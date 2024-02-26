/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-negated-condition */
import { useContext, useState, useEffect } from 'react';
import styled, { useTheme } from 'styled-components';
// eslint-disable-next-line import/no-extraneous-dependencies
import Web3 from 'web3';
import contract from '@truffle/contract';
import { MetamaskActions, MetaMaskContext } from '../hooks';
// import { HeaderButtons } from './Buttons';
// import { SnapLogo } from './SnapLogo';
// import { Toggle } from './Toggle';
import shkolz from '../../../truffle/build/contracts/Shkolz.json';

const Span = styled.span`
  color: ${(props) => props.theme.colors.primary.default};
`;

const WidgetWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2.4rem;
  ${({ theme }) => theme.mediaQueries.small} {
    padding: 0 1.6rem;
  }
`;
const WidgetContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  background-color: ${({ theme }) => theme.colors.card.default};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: ${({ theme }) => theme.radii.default};
  box-shadow: ${({ theme }) => theme.shadows.default};
  padding: 2.4rem;
  margin-top: 2.4rem;
  ${({ theme }) => theme.mediaQueries.small} {
    padding: 1.6rem;
    margin-top: 1.2rem;
  }
`;

const TabButton = styled.button`
  font-size: ${({ theme }) => theme.fontSizes.text};
  margin-right: 1.2rem;
  padding: 1.2rem;
  border: none;
  border-radius: ${({ theme }) => theme.radii.default};
  background-color: ${({ theme }) => theme.colors.primary.default};
  color: ${({ theme }) => theme.colors.text.alternative};
  cursor: pointer;
  ${({ theme }) => theme.mediaQueries.small} {
    margin-right: 0.6rem;
    padding: 0.6rem;
  }
`;

const DisconnectButton = styled.button`
  font-size: ${({ theme }) => theme.fontSizes.text};
  margin-right: 1.2rem;
  padding: 1.2rem;
  border: none;
  border-radius: ${({ theme }) => theme.radii.default};
  background-color: ${({ theme }) => theme.colors.primary.default};
  color: ${({ theme }) => theme.colors.text.alternative};
  cursor: pointer;
  ${({ theme }) => theme.mediaQueries.small} {
    margin-right: 0.6rem;
    padding: 0.6rem;
  }

  &:hover {
    background-color: red;
  }
`;

const TabContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-top: 2.4rem;
  ${({ theme }) => theme.mediaQueries.small} {
    margin-top: 1.2rem;
  }
`;

const Card = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: ${({ theme }) => theme.radii.default};
  padding: 2rem;
  margin-bottom: 2rem;
  background-color: ${({ theme }) => theme.colors.background.default};
`;

const MintForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ShkolzWidget = () => {
  const theme = useTheme();
  const [state, dispatch] = useContext(MetaMaskContext);
  const [activeTab, setActiveTab] = useState('balance');
  const [activeAccount, setActiveAccount] = useState('');
  /**
   * Interface with Shkolz Smart Contract
   */
  // Load the ABI from the JSON file
  const contractABI = shkolz.abi;
  const contractAddress = '0x3AA4F3f1F245156567548A3fEd6A51d8cC4AfBA0'; // Contract address goes here

  // Initialize web3 with MetaMask provider
  let shkolzInstance;
  if (typeof web3 !== 'undefined' && web3.eth) {
    // web3 is available - Initialize contract
    shkolzInstance = new web3.eth.Contract(contractABI, contractAddress);
  } else {
    // Handle the scenario where web3 or web3.eth is not available.
    console.error(
      'web3 or web3.eth is not available. Ensure you have a web3 provider like MetaMask installed.',
    );
  }

  const [name, setName] = useState('');
  const [dna, setDna] = useState('');

  const mint = async (account, name, dna) => {
    const gas = await shkolzInstance.methods
      .mint(account, name, dna)
      .estimateGas({ from: account });
    const result = await shkolzInstance.methods
      .mint(account, name, dna)
      .send({ from: account, gas });
    return result;
  };

  const mintRandom = async (name) => {
    console.log('About to call mint function');
    const gas = await shkolzInstance.methods
      .mintRandom(activeAccount, name)
      .estimateGas({ from: activeAccount });
    console.log('Mint function call completed Up to here');
    const result = await shkolzInstance.methods
      .mintRandom(activeAccount, name)
      .send({ from: activeAccount, gas });
    console.log('Mint function call completed');
    return result;
  };

  const burn = async (account, tokenId) => {
    const gas = await shkolzInstance.methods
      .burn(tokenId)
      .estimateGas({ from: account });
    const result = await shkolzInstance.methods
      .burn(tokenId)
      .send({ from: account, gas });
    return result;
  };

  const getShkolzCount = async () => {
    const result = await shkolzInstance.methods.getShkolzCount().call();
    return result;
  };

  const handleMint = async (event) => {
    console.log('MINTING!');
    event.preventDefault();
    await mint(activeAccount, name, dna);
  };

  const handleMintRandom = async (event) => {
    event.preventDefault();
    await mintRandom(activeAccount, name);
  };

  const handleBurn = async (tokenId) => {
    event.preventDefault();
    await burn(activeAccount, tokenId);
  };

  useEffect(() => {
    if (state.wallet) {
      setActiveTab('balance');
    } else {
      setActiveTab(null);
    }
  }, [state.wallet]);

    // const disconnectMetamask = () => {
  //   setActiveAccount(null);
  //   dispatch({ type: MetamaskActions.Disconnect });
  // };

  return (
    <WidgetWrapper>
      {state.wallet && (
        <WidgetContainer>
          <div>
            <TabButton onClick={() => setActiveTab('balance')}>
              Summary
            </TabButton>
            {/* <TabButton onClick={() => setActiveTab('nft')}>NFT</TabButton> */}
          </div>
          {activeTab === 'balance' && (
            <TabContainer>
              <Card>
                <p>
                  Active wallet: <Span>{state.wallet} </Span>{' '}
                </p>
                <p>
                  Network Name: <Span>{state.networkName} </Span>{' '}
                </p>
                <p>Balance: {state.balance} ETH</p>
              </Card>
            </TabContainer>
          )}
          {/* {activeTab === 'nft' && (
            <TabContainer>
              <h2>NFT Operations</h2>
              <MintForm onSubmit={handleMint}>
                <input
                  type="text"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <input
                  type="number"
                  placeholder="DNA"
                  value={dna}
                  onChange={(e) => setDna(e.target.value)}
                />
                <button type="submit">Mint Shkolz</button>
              </MintForm>
              <MintForm onSubmit={handleMintRandom}>
                <input
                  type="text"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <button type="submit">Mint Random Shkolz</button>
              </MintForm>
              <MintForm onSubmit={(e) => handleBurn(e.target.value)}>
                <input type="number" placeholder="Token ID to burn" />
                <button type="submit">Burn Shkolz</button>
              </MintForm>
              <button onClick={getShkolzCount}>Get Shkolz Count</button>
            </TabContainer>
          )} */}
        </WidgetContainer>
      )}
    </WidgetWrapper>
  );
};

export default ShkolzWidget;
