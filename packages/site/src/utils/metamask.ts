/**
 * Detect if the wallet injecting the ethereum object is Flask.
 *
 * @returns True if the MetaMask version is Flask, false otherwise.
 */
export const isFlask = async () => {
  const provider = window.ethereum;

  try {
    const clientVersion = await provider?.request({
      method: 'web3_clientVersion',
    });

    const isFlaskDetected = (clientVersion as string[])?.includes('flask');

    return Boolean(provider && isFlaskDetected);
  } catch {
    return false;
  }
};

/**
 * Detect if metamask is installed
 */

export const isMetamask = async () => {
  return typeof window.ethereum !== 'undefined';
};

/**
 * Add token to wallet's watched assets.
 */
type AddTokenRequest = {
  address?: string;
  symbol: string;
  decimals?: number;
  image?: string;
};

export async function addTokenToWallet(token: AddTokenRequest) {
  try {
    const wasAdded = await window.ethereum.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20',
        options: {
          address: token.address,
          symbol: token.symbol,
          decimals: token.decimals,
          image: token.image,
        },
      },
    });

    if (wasAdded) {
      console.log(`${token.symbol} was successfully added to wallet`);
    } else {
      console.log(`There was an issue adding ${token.symbol} to the wallet`);
    }
  } catch (error) {
    console.error(error);
  }
}

/**
 * Maps chain id to chain name
 * @param chainId - The network id
 * @returns -  Nework name
 */
export function mapChainIdToName(chainId: string): string {
  const chainIdMap: { [key: string]: string } = {
    '1': 'Ethereum Mainnet',
    '3': 'Ropsten Test Network',
    '4': 'Rinkeby Test Network',
    '5': 'Goerli Test Network',
    '42': 'Kovan Test Network',
    '11155111': 'Seploia Test Network',
  };

  return chainIdMap[chainId] || 'Unknown Network';
}
