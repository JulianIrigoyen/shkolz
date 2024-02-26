const Shkolz = artifacts.require('Shkolz');
const networkId = await web3.eth.net.getId();
const deployedAddress = Shkolz.networks[networkId].address;
console.log(deployedAddress);

let instance = await Shkolz.at('0x3AA4F3f1F245156567548A3fEd6A51d8cC4AfBA0')
let result = await instance.mint("0xe9f2cFf66BDeF6E89565F46A66864c6962a06652", "ShkolName", 1234567890123456);
