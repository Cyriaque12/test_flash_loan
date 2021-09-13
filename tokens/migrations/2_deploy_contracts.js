const Token1 = artifacts.require("Token1.sol");
const Token2 = artifacts.require("Token2.sol");
const Token3 = artifacts.require("Token3.sol");

module.exports = async function (deployer, network, addresses) {

    await deployer.deploy(Token1);
    
//
    const token1 = await Token1.deployed();

    await deployer.deploy(Token2);
    await deployer.deploy(Token3);
    const token2 = await Token2.deployed();
    const token3 = await Token3.deployed();
    

    console.log(`const token1Address = "${token1.address}";`)
    console.log(`const token2Address = "${token2.address}";`)
    console.log(`const token3Address = "${token3.address}";`)
}