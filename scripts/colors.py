import json

color_strings = [
    "amber::1", "baby blue color::1", "blue::1", "baby pink color::1",
    "brown color::1", "beige::1", "CYMK::1", "cyan::1", "citrus::1",
    "gold color::1", "green::1", "hot pink color::1", "gray::1",
    "coquelicot color::1", "grayscale color::1", "indigo::1",
    "matte black color::1", "neon blue color::1", "mint color::1",
    "lavender color::1", "magenta::1", "navy blue::1", "neon orange color::1",
    "neon green color::1", "neon red color::1", "neon yellow color::1",
    "pink::1", "pastel::1", "red::1", "orange::1", "RGB::1", "teal::1",
    "violet::1", "white::1", "turquoise::1", "vermillion::1", "silver color::1", "yellow::1"
]


lightning_strings = [
    "accent lighting::1", "backlight::1", "blacklight::1", "concert lighting::1", "candlelight::1", 
    "blinding light::1", "crepuscular rays::1", "edison bulb::1", "direct sunlight::1", "electric arc::1", 
    "dusk::1", "fire::1", "glowing radioactively::1", "glowing::1", "fluorescent::1", "glowstick::1", 
    "lava glow::1", "neon lamp::1", "nightclub lighting::1", "moonlight::1", "spotlight::1", 
    "quantum dot display::1", "nuclear waste glow::1", "natural lighting::1", "strobe::1", "sunlight::1", 
    "ultraviolet::1"
]
camera_strings = [
    "wide angle lens::1", "ultra wide angle lens::1", "telescope lens::1", "satellite imagery::1",
    "super resolution microscopy::1", "telephoto lens::1", "pinhole lens::1", "panorama::1",
    "miniature faking::1", "macro lens::1", "magnification::1", "microscopy::1",
    "electron microscope::1", "DSLR::1", "360 panorama::1"
]

colors = {}
lightning = {}
cameras = {}

ls = []
cs = []
for camera_s in camera_strings:
    camera, _ = camera_s.split("::")
    cs.append(camera_s)
    cameras[camera] = camera_s
    
for l in lightning_strings:
    lig, _ = l.split("::")
    ls.append(lig)
    lightning[lig] = l

print(ls)

print(cs)    
for color_string in color_strings:
    color, _ = color_string.split("::")  # Ignore the prompt part
    colors[color] = color_string  # Use the entire color_string as the value

json_object = json.dumps(colors, indent=4)

light_json = json.dumps(lightning, indent=4)
cam_j = json.dumps(cameras, indent=4)



