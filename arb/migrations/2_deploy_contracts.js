const Arbitrage = artifacts.require("Arbitrage.sol");

module.exports = async function (deployer, network, addresses) {
    await deployer.deploy(Arbitrage);
    const arbitrage = await Arbitrage.deployed()
    

    console.log(`const arbitrageAddress = "${arbitrage.address}";`)


}