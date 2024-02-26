// Import all the contracts
const Shkolz = artifacts.require("Shkolz");

module.exports = function(deployer) {
  deployer.deploy(Shkolz);
};
