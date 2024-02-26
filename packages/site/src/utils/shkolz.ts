// import Web3 from 'web3';
// import shkolz from '../../../truffle/build/contracts/Shkolz.json';

// // Initialize web3 with MetaMask provider
// const web3 = new Web3(window.ethereum);

// // Load the ABI from the JSON file
// const contractABI = shkolz.abi;
// const contractAddress = '0xCEbCE48A68e1cC6ebF72504b2C6F91ff9Abb8109'; // Contract address goes here

// // Initialize contract
// const contract = new web3.eth.Contract(contractABI, contractAddress);

// export const mint = async (account, name, dna) => {
//   const gas = await contract.methods
//     .mint(account, name, dna)
//     .estimateGas({ from: account });
//   const result = await contract.methods
//     .mint(account, name, dna)
//     .send({ from: account, gas });
//   return result;
// };

// export const mintRandom = async (account, name) => {
//   const gas = await contract.methods
//     .mintRandom(account, name)
//     .estimateGas({ from: account });
//   const result = await contract.methods
//     .mintRandom(account, name)
//     .send({ from: account, gas });
//   return result;
// };

// export const burn = async (account, tokenId) => {
//   const gas = await contract.methods
//     .burn(tokenId)
//     .estimateGas({ from: account });
//   const result = await contract.methods
//     .burn(tokenId)
//     .send({ from: account, gas });
//   return result;
// };

// export const getShkolzCount = async () => {
//   const result = await contract.methods.getShkolzCount().call();
//   return result;
// };
