import random
import re
import requests
import shutil
import time
import uuid
import ast
from flask import Flask, jsonify, request
from flask_socketio import SocketIO, emit
from flask_cors import CORS
from retrying import retry

from playwright.sync_api import sync_playwright
import openai

import threading
import base64
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

INFURA_IPFS_API_KEY = os.getenv("INFURA_IPFS_API_KEY")
INFURA_IPFS_API_SECRET = os.getenv("INFURA_IPFS_API_SECRET")
INFURA_IPFS_URL = os.getenv("INFURA_IPFS_URL")


ipfs_hash_store = {}

openai.api_key = os.getenv("OPENAI_API_KEY")

def download_upscaled_images(page, prompt_text):
    try:
        prompt_text = prompt_text.lower()
        
        # Repeat until 'Make Variations' and 'Web' are found in the first message
        while True:
            first_message = get_last_message(page)
            
            if 'Make Variations' in first_message and 'Web' in first_message:
                image_elements = page.query_selector_all('.originalLink-Azwuo9')
                random_image = image_elements[random.randint(0, 3)]   
                print("Found 'Make Variations' and 'Web' in the first message. Attempting to download image.")
                src = random_image.get_attribute('href')
                url = src
                response = re.sub(r'[^a-zA-Z0-9\s]', '', prompt_text)
                response = response.replace(' ', '_').replace(',', '_')
                response = re.sub(r'[\<>:"/|?*]', '', response)
                response = response.replace('\n\n', '_')
                response = response[:50].rstrip('. ')
                download_response = requests.get(url, stream=True)
                file_name = f'shkol-{str(uuid.uuid1())}.png'
                with open(file_name, 'wb') as out_file:
                    shutil.copyfileobj(download_response.raw, out_file)
                del download_response
                upload_generator = upload_to_infura(file_name)
                for event in upload_generator:
                    print(event)  # This will print the events emitted by the generator
                break 
            else:
                print("'Make Variations' and 'Web' not yet found in the first message, waiting...")
                time.sleep(20)
    except Exception as e:
        print(f"An error occurred while finding the first message: {e}")
        raise e

@retry(stop_max_attempt_number=10, wait_fixed=60000)
def download_image(url, file_name):
    r = requests.get(url, stream=True)
    with open(file_name, 'wb') as out_file:
        shutil.copyfileobj(r.raw, out_file)
    del r
    print('Successfully downloaded image')

def get_last_message(page):
    messages = page.query_selector_all(".messageListItem-ZZ7v6g")
    last_message = messages[-1]
    last_message_text = last_message.evaluate_handle('(node) => node.innerText')
    last_message_text = str(last_message_text)
    print("Successfully found last message")
    return last_message_text

# You need to replace all functions with regular functions and remove all keywords

def main(bot_command, channel_url, PROMPT, modifiers):
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("https://www.discord.com/login")
        with open("credentials.txt", "r") as f:
            email = f.readline()
            password = f.readline()
        page.fill("input[name='email']", email)
        time.sleep(random.randint(1, 5))
        page.fill("input[name='password']", password)
        time.sleep(random.randint(1, 5))
        page.click("button[type='submit']")
        time.sleep(random.randint(5, 10))
        page.wait_for_url("https://discord.com/channels/@me", timeout=15000)
        print("Successfully logged into Discord.")
        time.sleep(random.randint(1, 5))
        open_discord_channel(page, channel_url, bot_command, PROMPT, modifiers)


def open_discord_channel(page, channel_url, bot_command, PROMPT, modifiers):
    page.goto(f"{channel_url}")
    time.sleep(random.randint(1, 5))
    page.wait_for_load_state("networkidle")
    print("Opened appropriate channel.")
    print("Entering the specified bot command.")
    send_bot_command(page, bot_command, PROMPT, modifiers)
    return page


def select_upscale_option(page, option_text):
    page.locator(f"button:has-text('{option_text}')").locator("nth=-1").click()
    print(f"Clicked {option_text} upscale option.")


def send_bot_command(page, command, PROMPT, modifiers):
    print("Clicking on chat bar.")
    chat_bar = page.locator('xpath=//*[@id="app-mount"]/div[2]/div[1]/div[1]/div/div[2]/div/div/div/div/div[3]/div[2]/main/form/div/div[1]/div/div[3]/div/div[2]/div')
    time.sleep(random.randint(1, 5))  # replace time.sleep with time.sleep
    print("Typing in bot command")
    chat_bar.fill(command)
    time.sleep(random.randint(1, 5))  # replace time.sleep with time.sleep
    print("Selecting the prompt option in the suggestions menu")
    prompt_option = page.locator('xpath=/html/body/div[1]/div[2]/div[1]/div[1]/div/div[2]/div/div/div/div/div[3]/div[2]/main/form/div/div[2]/div/div/div[2]/div[1]/div/div/div')
    time.sleep(random.randint(1, 5))  # replace time.sleep with time.sleep
    prompt_option.click()
    print("Generating prompt using OpenAI's API.")
    try:
        generate_prompt_and_submit_command(page, PROMPT, modifiers)

    except Exception as e:
        print(f"An error occurred while selecting upscale options: {e}")
        raise e


def generate_prompt_and_submit_command(page, prompt, modifiers):
    try:
        # Send request to GPT-3 to generate analysis based on indicators and templates
        print('Asking for prompt with ' + str(prompt) )
        response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
        {"role": "system",
        "content": "Midjourney is a generative artificial intelligence program and service. A prompt can be a single word, phrase, or even an emoji. Advanced prompts can include image URLs, multiple text phrases, and parameters for added specificity. While short prompts can generate images, they will heavily rely on the bot's default style. Conversely, long prompts may not always generate better images. The focus should be on conveying main concepts concisely. he bot doesn't understand grammar or sentence structure like humans. Specific synonyms, fewer words, and proper organization of thoughts can make prompts more effective.Focus on Desires: It's more effective to describe what is wanted in the image rather than what is not wanted. Detailed Instructions: Leaving out details can lead to surprises. It's better to be specific about important context or details, such as the subject, medium, environment, lighting, color, mood, and composition of the image. Use Collective Nouns: For more precision, using specific numbers or collective nouns is better than using plural words.  Act as a skilled Midjourney Prompt Engineer"},
        {"role": "user", "content": prompt + '4K HIGHLY DETAILED PHOTOREALISTIC'}
        ]
        )

        # Extract the generated analysis
        modifiers_list = ast.literal_eval(modifiers)
        modifiers_list = [modifier for modifier in modifiers_list if modifier.strip() and modifier != "::1"]
        generated_prompt = response['choices'][0]['message']['content']
        generated_prompt += " :: "
        generated_prompt += " ".join(modifiers_list)
    
        generated_prompt += " --ar 16:9 --v 4"

        print(generated_prompt)
        time.sleep(random.randint(1, 5))
        pill_value = page.locator('xpath=//*[@id="app-mount"]/div[2]/div[1]/div[1]/div/div[2]/div/div/div/div/div[3]/div/main/form/div/div[2]/div/div[2]/div/div/div/span[2]/span[2]')
        pill_value.fill(generated_prompt)
        time.sleep(random.randint(1, 5))
        page.keyboard.press("Enter")
        print(f'Successfully submitted prompt: {generated_prompt}')
        wait_and_select_upscale_options(page, generated_prompt)
    except Exception as e:
        print(f"An error occurred while submitting the prompt: {e}")
    
def wait_and_select_upscale_options(page, prompt_text: str):
    """
    Function to wait for and select upscale options.

    Parameters:
    - page: The page to operate on.
    - prompt_text (str): The text of the prompt.

    Returns:
    - None
    """
    try:
        prompt_text = prompt_text.lower()

        # Repeat until upscale options are found
        while True:
            last_message = get_last_message(page)

            # Check for 'U1' in the last message
            if 'U1' in last_message:
                print("Found upscale options. Attempting to upscale all generated images.")
                try:
                    select_upscale_option(page, 'U1')
                    time.sleep(random.randint(3, 5))
                except Exception as e:
                    print(f"An error occurred while selecting upscale options: {e}")
                    raise e

                download_upscaled_images(page, prompt_text)
                break  # Exit the loop when upscale options have been found and selected

            else:
                print("Upscale options not yet available, waiting...")
                time.sleep(random.randint(3, 5))
                
    except Exception as e:
        print(f"An error occurred while finding the last message: {e}")
        raise e


# app = Flask(__name__)
# CORS(app)

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")  # Assuming you want to allow requests from any origin

def upload_to_infura(file_path):
        print("Uploading file to IPFS")
        with open(file_path, 'rb') as f:
            files = {'file': f}
            auth = (INFURA_IPFS_API_KEY, INFURA_IPFS_API_SECRET)
            response = requests.post(f"{INFURA_IPFS_URL}/api/v0/add", files=files, auth=auth)
            print(response)
            
            if response.status_code == 200:
                print(f"File uploaded to IPFS with hash: {response.json()['Hash']}")
                response_json = response.json()
                print(f"File Name: {response_json['Name']}")
                print(f"IPFS Hash: {response_json['Hash']}")
                print(f"File Size: {response_json['Size']}")
                print(f"Emitting event")
                # send HASH VIA WEBSOCKET
                socketio.emit('ipfsHashUpdate', response.json()['Hash'], namespace='/imagine')
            else:
                print(f"Failed to upload file to IPFS: {response.text}")


@app.route('/imagine', methods=['POST'])
def imagine():
    data = request.get_json()
    prompt = data.get('prompt')

    if not prompt:
        return jsonify({'error': 'Prompt not provided'}), 400

    prompt_content = prompt.get('content')
    prompt_modifiers = prompt.get('modifiers')
    prompt_sender = prompt.get('wallet')
    
    

    if not prompt_content:
        return jsonify({'error': 'Content not provided'}), 400

    print('RECEIVED REQUEST TO IMAGINE SHKOLTRIP ' + str(prompt_content))

    try:
        threading.Thread(target=main, args=('/imagine', "https://discord.com/channels/1135517750090018859/1135518484177109122", prompt_content, prompt_modifiers)).start()
        return jsonify({'status': 'The   prompt was prompted !'}), 200
    except Exception as e:
        return jsonify({'error': 'An error occurred: ' + str(e)}), 500
    
@socketio.on('connect', namespace='/imagine')
def test_connect():
    print("Client connected")   
    
if __name__ == "__main__":
    try:
        socketio.run(app, host='localhost', port=3693)
    except Exception as e:
        print(f"An error occurred: {e}") 