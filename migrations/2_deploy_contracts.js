var Car = artifacts.require("Car.sol");

module.exports = function(deployer) {
  // Faccio il deploy del contratto Car
  deployer.deploy(Car)
};
