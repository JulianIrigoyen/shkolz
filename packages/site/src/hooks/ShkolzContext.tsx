import { useEffect, useState } from 'react';
import Web3 from 'web3';
import shkolz from '../../../truffle/build/contracts/Shkolz.json';

let web3;
let contract;

export const useShkolzContract = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      web3 = new Web3(window.ethereum);

      const contractABI = shkolz.abi;
      const contractAddress = '0xCEbCE48A68e1cC6ebF72504b2C6F91ff9Abb8109'; // Contract address goes here
      contract = new web3.eth.Contract(contractABI, contractAddress);
      setIsReady(true);
    }
  }, []);

  const mint = async (account, name, dna) => {
    const gas = await contract.methods
      .mint(account, name, dna)
      .estimateGas({ from: account });
    const result = await contract.methods
      .mint(account, name, dna)
      .send({ from: account, gas });
    return result;
  };

  const mintRandom = async (account, name) => {
    const gas = await contract.methods
      .mintRandom(account, name)
      .estimateGas({ from: account });
    const result = await contract.methods
      .mintRandom(account, name)
      .send({ from: account, gas });
    return result;
  };

  const burn = async (account, tokenId) => {
    const gas = await contract.methods
      .burn(tokenId)
      .estimateGas({ from: account });
    const result = await contract.methods
      .burn(tokenId)
      .send({ from: account, gas });
    return result;
  };

  const getShkolzCount = async () => {
    const result = await contract.methods.getShkolzCount().call();
    return result;
  };

  return { isReady, web3, contract, mint, mintRandom, burn, getShkolzCount };
};
