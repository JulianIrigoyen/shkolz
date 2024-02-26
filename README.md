This is a 3 layer PoC application to demonstrate the use of Truffle to create an NFT-minting dApp. Our dApp will:

- Ask the user for some parameters
- Log in to Discord and navigate the interaction with the Midjourney Bot /imagine command
- Upload the downloaded image to IPFS
- Mint an NFT with the generated metadata in Ethereum (Sepolia, of course)
- Return the transaction hash of their newly created NFT to the user.




# @metamask/template-snap-monorepo

This repository demonstrates how to develop a snap with TypeScript. For detailed instructions, see [the MetaMask documentation](https://docs.metamask.io/guide/snaps.html#serving-a-snap-to-your-local-environment).

MetaMask Snaps is a system that allows anyone to safely expand the capabilities of MetaMask. A _snap_ is a program that we run in an isolated environment that can customize the wallet experience.

## Snaps is pre-release software

To interact with (your) Snaps, you will need to install [MetaMask Flask](https://metamask.io/flask/), a canary distribution for developers that provides access to upcoming features.

## Getting Started

Clone the template-snap repository [using this template](https://github.com/MetaMask/template-snap-monorepo/generate) and setup the development environment:

```shell
yarn install && yarn start
```
