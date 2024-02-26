/**
 * First, the script tells Truffle that we'd want to interact with the Migrations contract.
 * Next, it exports a function that accepts an object called deployer as a parameter. 
 * This object acts as an interface between you  and Truffle's deployment engine.
 */
const Migrations = artifacts.require("Migrations");

module.exports = async function(deployer) {
  try {
    await deployer.deploy(Migrations);
  } catch (error) {
    console.error('An error occurred during the migration:', error);
  }
};