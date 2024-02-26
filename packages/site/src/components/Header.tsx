import { useContext, useState } from 'react';
import styled, { useTheme } from 'styled-components';
import { MetamaskActions, MetaMaskContext } from '../hooks';
import { connectSnap, getThemePreference, isMetamask } from '../utils';
import { ConnectButton } from './Buttons';
import { SnapLogo } from './SnapLogo';
import { Toggle } from './Toggle';

const HeaderWrapper = styled.header`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 2.4rem;
  border-bottom: 1px solid ${(props) => props.theme.colors.border.default};
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

const LogoWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const RightContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

export const Header = ({
  handleToggleClick,
}: {
  handleToggleClick(): void;
}) => {
  const theme = useTheme();
  const [state, dispatch] = useContext(MetaMaskContext);
  const [activeAccount, setActiveAccount] = useState('');

  const connectMetamask = async () => {
    try {
      if (window.ethereum) {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
      } else {
        console.error('MetaMask not installed.');
        return;
      }
      const accounts = await window.ethereum.request({
        method: 'eth_accounts',
      });
      if (accounts && accounts.length > 0) {
        setActiveAccount(accounts[0]);
        dispatch({ type: MetamaskActions.Connect, payload: accounts[0] });
      }
    } catch (error) {
      console.error('User rejected request:', error);
      dispatch({ type: MetamaskActions.SetError, payload: error });
    }
  };

  const disconnectMetamask = () => {
    setActiveAccount(null);
    dispatch({ type: MetamaskActions.Disconnect });
  };

  const handleConnectClick = async () => {
    try {
      const hasMetamask = await isMetamask(); // Check if MetaMask is installed

      if (hasMetamask) {
        await window.ethereum.request({ method: 'eth_requestAccounts' });

        const accounts = await window.ethereum.request({
          method: 'eth_accounts',
        });
        if (accounts && accounts.length > 0) {
          dispatch({ type: MetamaskActions.Connect, payload: accounts[0] });
          // ... any other logic you want when a connection is established
        }
      } else {
        // If MetaMask is not installed, display a prompt for the user to install it
        // eslint-disable-next-line no-alert
        const shouldInstall = window.confirm(
          "It seems you don't have MetaMask installed! Would you like to install it for a better experience? Click 'OK' to go to the installation page.",
        );

        if (shouldInstall) {
          window.open('https://metamask.io/', '_blank'); // Open the MetaMask installation page in a new tab
          return; // Exit the function so that the code after this doesn't execute
        }
      }

      dispatch({
        type: MetamaskActions.SetInstalled,
        payload: true,
      }); 
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  return (
    <HeaderWrapper>
      <LogoWrapper>
        <SnapLogo color={theme.colors.icon.default} size={36} />
        <Title>shkol network</Title>
      </LogoWrapper>
      <RightContainer>
        <Toggle
          onToggle={handleToggleClick}
          defaultChecked={getThemePreference()}
        />
        <ConnectButton
          isConnected={Boolean(activeAccount)}
          onConnectClick={connectMetamask}
          onDisconnectClick={disconnectMetamask}
        />
      </RightContainer>
    </HeaderWrapper>
  );
};
