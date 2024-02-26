/* eslint-disable no-negated-condition */
/* eslint-disable guard-for-in */
import {
  JSXElementConstructor,
  Key,
  ReactElement,
  ReactNode,
  ReactPortal,
  useState,
  useCallback,
  useEffect,
  useContext,
} from 'react';
import io from 'socket.io-client';
import styled from 'styled-components';
import attributesData from '../../static/attributes.json';
import { MetaMaskContext } from '../hooks';

const AttributeWrapper = styled.div`
  width: 100%;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: start;
  flex: 1;
  margin-top: 7.6rem;
  margin-bottom: 7.6rem;
  padding: 2rem;
  gap: 2rem;
  ${({ theme }) => theme.mediaQueries.small} {
    padding-left: 2.4rem;
    padding-right: 2.4rem;
    margin-top: 2rem;
    margin-bottom: 2rem;
    width: auto;
  }
`;

const Title = styled.p`
  font-size: ${(props) => props.theme.fontSizes.title};
  font-weight: bold;
  margin: 0;
  margin-left: 1.2rem;
  ${({ theme }) => theme.mediaQueries.small} {
    display: none;
  }
`;

const Heading = styled.h1`
  margin-top: 0;
  margin-bottom: 2.4rem;
  text-align: center;
`;

const Span = styled.span`
  color: ${(props) => props.theme.colors.primary.default};
`;

const AttributeDropdown = styled.select`
  /* Style the attribute dropdown */
  width: 100%;
  padding: 0.5rem 1rem;
  font-size: ${({ theme }) => theme.fontSizes.text};
  border-radius: ${({ theme }) => theme.radii.default};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  margin-top: 1rem;
  background-color: ${({ selected }) => (selected ? 'green' : 'white')};
`;

const AttributeOption = styled.option`
  /* Style options within the attribute dropdown */
  font-size: ${({ theme }) => theme.fontSizes.text};
`;

const RandomizeButton = styled.button`
  padding: 0.5rem 2rem;
  font-size: ${({ theme }) => theme.fontSizes.text};
  border-radius: ${({ theme }) => theme.radii.default};
  border: none;
  color: ${({ theme }) => theme.colors.text.alternative};
  background-color: ${({ theme }) => theme.colors.primary.default};
  cursor: pointer;
  margin-left: 1rem;
`;

const ClearAttributesButton = styled.button`
  padding: 0.5rem 2rem;
  font-size: ${({ theme }) => theme.fontSizes.text};
  border-radius: ${({ theme }) => theme.radii.default};
  border: none;
  color: ${({ theme }) => theme.colors.text.alternative};
  background-color: ${({ theme }) => theme.colors.primary.default};
  cursor: pointer;
  margin-left: 1rem;
`;

const SubmitButton = styled.button`
  margin-top: 0.5rem;
  padding: 0.5rem 2rem;
  font-size: ${({ theme }) => theme.fontSizes.text};
  border-radius: ${({ theme }) => theme.radii.default};
  border: none;
  color: ${({ theme }) => theme.colors.text.alternative};
  background-color: ${({ theme }) => theme.colors.primary.default};
  cursor: pointer;
  align-items: right;
`;

const DNAContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

const CardContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  width: 100%;
  margin: auto;
  height: 100%;
  margin-top: 2.5rem;
`;

const AttributesContainer = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%; // Use full width
`;

const LeftColumn = styled.div`
  width: 48%;
`;

const RightColumn = styled.div`
  width: 48%;
`;

const CreateShkol = () => {
  const [dna, setDna] = useState('');
  const { account } = useContext(MetaMaskContext);
  const [isLoading, setIsLoading] = useState(false);
  const [ipfsHash, setIpfsHash] = useState(null);
  const attributesArray = Object.entries(attributesData).map(
    ([type, values]) => ({ type, values, selected: 0 }),
  );
  const [attributes, setAttributes] = useState(attributesArray);

  const ipfsUrl = 'https://shkolz.infura-ipfs.io/ipfs/';

  useEffect(() => {
    const socket = io('http://localhost:3693');

    socket.on('connect', () => {
      console.log('Connected to the JHJ');
    });

    socket.on('ipfsHashUpdate', (hash) => {
      console.log('RECEIVED IPFS HASH');
      console.log(hash);
      if (hash.startsWith('Qm')) {
        setIpfsHash(hash);
        socket.disconnect();
      }
    });

    socket.on('connect_error', (error) => {
      console.log('Connection error:', error);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const getRandomInt = (max) => {
    return Math.floor(Math.random() * Math.floor(max));
  };

  const randomizeAttributes = useCallback(() => {
    const updatedAttributes = attributes.map((attribute) => {
      const randomIndex = getRandomInt(attribute.values.length);
      return { ...attribute, selected: randomIndex };
    });
    setAttributes(updatedAttributes);

    const newDna = updatedAttributes
      .map((attr) => String(attr.selected).padStart(2, '0'))
      .join('');
    setDna(newDna);
  }, [attributes]);

  const handleAttributeChange = (
    index: string | number,
    selectedIndex: number,
  ) => {
    const updatedAttributes = [...attributes];
    updatedAttributes[index].selected = selectedIndex;
    setAttributes(updatedAttributes);

    // Update the DNA based on the new attributes
    const newDna = updatedAttributes
      .map((attr) => String(attr.selected).padStart(2, '0'))
      .join('');
    console.log(prompt);
    setDna(newDna);
  };

  const Attribute = ({ attribute, index }) => {
    const handleValueChange = (event: { target: { selectedIndex: any } }) => {
      handleAttributeChange(index, event.target.selectedIndex);
    };

    return (
      <AttributeWrapper key={index}>
        <Title>{attribute.type}</Title>
        <AttributeDropdown
          onChange={handleValueChange}
          value={attribute.selected}
          selected={attribute.selected !== 0}
        >
          {attribute.values.map(
            (
              value:
                | string
                | number
                | boolean
                | ReactElement<any, string | JSXElementConstructor<any>>
                | Iterable<ReactNode>
                | ReactPortal
                | null
                | undefined,
              valueIndex: readonly string[] | Key | null | undefined,
            ) => (
              <AttributeOption key={valueIndex} value={valueIndex}>
                {value}
              </AttributeOption>
            ),
          )}
        </AttributeDropdown>
      </AttributeWrapper>
    );
  };

  const clearAttributes = useCallback(() => {
    const updatedAttributes = attributes.map((attribute) => {
      return { ...attribute, selected: 0 };
    });
    setAttributes(updatedAttributes);

    const newDna = updatedAttributes
      .map((attr) => String(attr.selected).padStart(2, '0'))
      .join('');
    setDna(newDna);
  }, [attributes]);

  const sendDataToServer = async (contents: string[], modifiers: string[]) => {
    console.log('Sending request');
    const promptContent = contents.join(', ');
    const finalPrompt = `Based on these three words: ${promptContent}, write a prompt for a generative art AI to create a picture.`;

    console.log(finalPrompt);
    const response = await fetch('http://localhost:3693/imagine', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: {
          content: JSON.stringify(finalPrompt),
          modifiers: JSON.stringify(modifiers),
          wallet: JSON.stringify('0x58a1C3167d395BB994F3b41AD76343eC57403835'),
        },
      }),
    });

    console.log(`Got response from server: ${response}`);

    if (response.status !== 200) {
      throw new Error(`Server responded with status: ${response.status}`);
    }

    return await response.json();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const contents = [];
    const modifiers = [];
    attributes.forEach((attr) => {
      const value = attr.values[attr.selected];
      if (['mythos', 'settings', 'weather'].includes(attr.type)) {
        contents.push(value);
      } else if (value !== '-') {
        modifiers.push(`${value}::1`);
      }
    });

    setIsLoading(true);

    try {
      const data = await sendDataToServer(contents, modifiers);
      // /setImageData(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <Heading>
        <Span>Create your Shkol</Span>Trip
      </Heading>
      <CardContainer>
        <DNAContainer>
          <code>{`DNA ${dna}`}</code>
          <RandomizeButton onClick={randomizeAttributes}>
            Randomize
          </RandomizeButton>
          <ClearAttributesButton onClick={clearAttributes}>
            Clear Attributes
          </ClearAttributesButton>
          <SubmitButton type="submit" onClick={handleSubmit}>
            Mint Shkol
          </SubmitButton>
        </DNAContainer>
        <AttributesContainer>
          <LeftColumn>
            {attributes.slice(0, 4).map((attr, index) => (
              <Attribute key={index} attribute={attr} index={index} />
            ))}
          </LeftColumn>
          <RightColumn>
            {attributes.slice(4).map((attr, index) => (
              <Attribute key={index + 4} attribute={attr} index={index + 4} />
            ))}
          </RightColumn>
        </AttributesContainer>
      </CardContainer>
    </Container>
  );
};

export default CreateShkol;
