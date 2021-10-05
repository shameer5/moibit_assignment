const MoibitStorage = artifacts.require("MoibitStorage");

module.exports = function(deployer) {
	deployer.deploy(MoibitStorage);
};