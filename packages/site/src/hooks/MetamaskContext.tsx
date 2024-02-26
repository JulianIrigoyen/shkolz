import {
  createContext,
  Dispatch,
  ReactNode,
  Reducer,
  useEffect,
  useReducer,
  useState,
} from 'react';
import Web3 from 'web3';
import { Snap } from '../types';
import { isFlask, isMetamask, mapChainIdToName } from '../utils';

export type MetamaskState = {
  isFlask: boolean;
  isMetamask: boolean;
  installedSnap?: Snap;
  error?: Error;
  wallet?: string | null;
  chainId?: string | null;
  networkName?: string | null;
  balance: string | null;
};

const initialState: MetamaskState = {
  isFlask: false,
  isMetamask: false,
  error: undefined,
  wallet: null,
  chainId: null,
  networkName: null,
  balance: null,
};

type MetamaskDispatch = { type: MetamaskActions; payload: any };

export const MetaMaskContext = createContext<
  [MetamaskState, Dispatch<MetamaskDispatch>]
>([
  initialState,
  () => {
    /* no op */
  },
]);

export enum MetamaskActions {
  SetInstalled = 'SetInstalled',
  SetFlaskDetected = 'SetFlaskDetected',
  SetMetamaskDetected = 'SetMetamaskDetected',
  SetChain = 'SetChain',
  SetBalance = 'SetBalance',
  SetError = 'SetError',
  Connect = 'Connect',
  Disconnect = 'Disconnect',
}

const reducer: Reducer<MetamaskState, MetamaskDispatch> = (state, action) => {
  switch (action.type) {
    case MetamaskActions.SetInstalled:
      return {
        ...state,
        installedSnap: action.payload,
      };

    case MetamaskActions.SetFlaskDetected:
      return {
        ...state,
        isFlask: action.payload,
      };

    case MetamaskActions.SetMetamaskDetected:
      return {
        ...state,
        isMetamask: action.payload,
      };

    case MetamaskActions.SetChain:
      return {
        ...state,
        chainId: action.payload.chainId,
        networkName: action.payload.networkName,
      };

    case MetamaskActions.SetBalance:
      return { ...state, balance: action.payload };

    case MetamaskActions.Connect:
      return {
        ...state,
        wallet: action.payload,
      };

    case MetamaskActions.Disconnect:
      return {
        ...state,
        wallet: null,
      };

    case MetamaskActions.SetError:
      return {
        ...state,
        error: action.payload,
      };

    default:
      return state;
  }
};

/**
 * MetaMask context provider to handle MetaMask and snap status.
 *
 * @param props - React Props.
 * @param props.children - React component to be wrapped by the Provider.
 * @returns JSX.
 */
export const MetaMaskProvider = ({ children }: { children: ReactNode }) => {
  if (typeof window === 'undefined') {
    return <>{children}</>;
  }

  const [state, dispatch] = useReducer(reducer, initialState);
  const web3 = window.ethereum ? new Web3(window.ethereum) : null;

  /**
   * Add event listeners for wallet events.
   */
  // Balance handler
  useEffect(() => {
    async function getBalance() {
      if (!state.isMetamask || !state.wallet) {
        console.log('MetaMask not installed or user not connected');
        return;
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (!accounts || accounts.length === 0) {
        console.log('No account is connected');
        return;
      }

      const account = accounts[0];
      const balanceInWei = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [account, 'latest'],
      });

      const ethBalance = web3.utils.fromWei(balanceInWei, 'ether');
      console.log(ethBalance);
      dispatch({
        type: MetamaskActions.SetBalance,
        payload: ethBalance,
      });
    }

    getBalance();
    // Re-check whenever the wallet or networkName changes
  }, [state.wallet, state.networkName, state.isMetamask]);

  // useEffect(() => {
  //   async function getBalance() {
  //     const accounts = await window.ethereum.request({
  //       method: 'eth_requestAccounts',
  //     });
  //     if (!accounts || accounts.length === 0) {
  //       console.log('No account is connected');
  //       return;
  //     }

  //     const account = accounts[0];
  //     const balanceInWei = await window.ethereum.request({
  //       method: 'eth_getBalance',
  //       params: [account, 'latest'],
  //     });

  //     const ethBalance = web3.utils.fromWei(balanceInWei, 'ether');
  //     console.log(ethBalance);
  //     dispatch({
  //       type: MetamaskActions.SetBalance,
  //       payload: ethBalance,
  //     });
  //   }

  //   getBalance();
  //   // Re-check whenever the wallet or chain changes
  // }, [state.wallet, state.networkName, dispatch]);

  // Accounts and chain changed / disconnected handlers
  useEffect(() => {
    const accountsChangedHandler = async (accounts) => {
      dispatch({
        type: MetamaskActions.Connect,
        payload: accounts[0], // We take the first account as the connected wallet
      });
    };

    const chainChangedHandler = async (chainIdHex) => {
      const chainId = Number.parseInt(chainIdHex, 16).toString();
      console.log(`Chain changed to ${chainId}`);
      const networkName = mapChainIdToName(chainId);
      dispatch({
        type: MetamaskActions.SetChain,
        payload: { chainId, networkName },
      });
    };

    const disconnectHandler = async () => {
      dispatch({
        type: MetamaskActions.Disconnect,
        payload: null,
      });
    };

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', accountsChangedHandler);
      window.ethereum.on('chainChanged', chainChangedHandler);
      window.ethereum.on('disconnect', disconnectHandler);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener(
          'accountsChanged',
          accountsChangedHandler,
        );
        window.ethereum.removeListener('chainChanged', chainChangedHandler);
        window.ethereum.removeListener('disconnect', disconnectHandler);
      }
    };
  }, []);

  // Initial chain detection
  useEffect(() => {
    async function detectChain() {
      if (window.ethereum) {
        window.ethereum
          .request({ method: 'net_version' })
          .then((result) => {
            console.log(`User is connected to network: ${result}`);
            const networkName = mapChainIdToName(result);
            dispatch({
              type: MetamaskActions.SetChain,
              payload: { chainId: result, networkName },
            });
          })
          .catch((error) => console.error(`Failed to get network: ${error}`));
      }
    }
    detectChain();
  }, [window.ethereum, dispatch]);

  // Detect wallets handler
  useEffect(() => {
    const detectWallets = async () => {
      const isMetamaskDetected = await isMetamask();
      const isFlaskDetected = await isFlask();

      dispatch({
        type: MetamaskActions.SetMetamaskDetected,
        payload: isMetamaskDetected,
      });

      dispatch({
        type: MetamaskActions.SetFlaskDetected,
        payload: isFlaskDetected,
      });
    };

    detectWallets();
  }, [dispatch]); // Only re-run the effect if dispatch changes

  // useEffect(() => {
  //   async function detectMetamask() {
  //     const isMetamaskDetected = await isMetamask();
  //     dispatch({
  //       type: MetamaskActions.SetMetamaskDetected,
  //       payload: isMetamaskDetected,
  //     });
  //   }

  //   async function detectFlask() {
  //     const isFlaskDetected = await isFlask();

  //     dispatch({
  //       type: MetamaskActions.SetFlaskDetected,
  //       payload: isFlaskDetected,
  //     });
  //   }

  //   // async function detectSnapInstalled() {
  //   //   const installedSnap = await getSnap();
  //   //   dispatch({
  //   //     type: MetamaskActions.SetInstalled,
  //   //     payload: installedSnap,
  //   //   });
  //   // }

  //   detectFlask();
  //   detectMetamask();

  //   // if (state.isFlask) {
  //   //   detectSnapInstalled();
  //   // }

  //   if (state.isMetamask) {
  //     console.log('METAMASK DETECTED');
  //   }
  // }, [state.isFlask, window.ethereum]);

  // Timeout handler
  useEffect(() => {
    let timeoutId: number;

    if (state.error) {
      timeoutId = window.setTimeout(() => {
        dispatch({
          type: MetamaskActions.SetError,
          payload: undefined,
        });
      }, 10000);
    }

    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [state.error]);

  return (
    <MetaMaskContext.Provider value={[state, dispatch]}>
      {children}
    </MetaMaskContext.Provider>
  );
};
