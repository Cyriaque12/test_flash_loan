const Factory = artifacts.require("UniswapV2Factory.sol");
//const MyContract = artifacts.require("MyContract.sol");
//const MyCaller = artifacts.require("MyCaller.sol");

module.exports = async function (deployer, network, addresses) {
    //await deployer.deploy(MyContract);
    //const mycontract = await MyContract.deployed()
    await deployer.deploy(Factory, addresses[0]);
    const factory = await Factory.deployed();

    //await deployer.deploy(MyCaller);
    //const mycaller = await MyCaller.deployed();

    const initCodeHash = await factory.INIT_CODE_PAIR_HASH();

    
    console.log("--------------------data to write-------------------")
    console.log("Write this code hash in periphery/libraries/UniswapV2Library.sol function PairFor")
    console.log("init code hash:", initCodeHash)
    console.log(`const factoryAddress = "${factory.address}";`)
    //console.log(`const myContractAddress = "${mycontract.address}";`)
    //console.log(`const myCallerAddress = "${mycaller.address}";`)
    console.log("--------------------end data to write-------------------")

}