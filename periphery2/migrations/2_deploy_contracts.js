const Router = artifacts.require("UniswapV2Router02.sol");
const WETH = artifacts.require("WETH.sol");
const fs = require('fs');
const Web3 = require("web3");
var web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

const factory1Data = JSON.parse(fs.readFileSync('../../core2/build/contracts/UniswapV2Factory.json', 'utf-8'))

module.exports = async function (deployer, network) {
  chainId = chainId = await web3.eth.net.getId();
  let weth;
  const factoryAddress = factory1Data["networks"][chainId]["address"];
  await deployer.deploy(WETH);


  weth = await WETH.deployed()
  await deployer.deploy(Router, factoryAddress, weth.address);
  router = await Router.deployed();


  console.log(`const routerAddress = "${router.address}";`)
  


};
