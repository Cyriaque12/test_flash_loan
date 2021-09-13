
const fs = require('fs');
// Get this data when launching ganaceh
const account1 = {
    address:"0x05A0CA81bEB39ee87BeAe2E99b2d6fb5fdA559fb",
    key: "0x3355a4091411380aa53116469b51e3373395c4a1101ddaba8c8b8dcc7a5450a9"
}

const account2 = {
    address:"0xeDF4c68FB9Ec60d82c7EA8d15FcBF93A9D1dC928",
    key: "0xe80ee5f2abd087852228620f1ca75b8359066b4b485172fba7bc405cd5161870"
}

// DEX 1 DATA
// Factory1
const factory1Data = JSON.parse(fs.readFileSync('../core1/build/contracts/UniswapV2Factory.json', 'utf-8'))
const pair1Data = JSON.parse(fs.readFileSync('../core1/build/contracts/UniswapV2Pair.json', 'utf-8'))

// Router 1 
const router1Data = JSON.parse(fs.readFileSync('../periphery1/build/contracts/UniswapV2Router02.json', 'utf-8'))
// DEX 2 DATA

// Factory2
const factory2Data = JSON.parse(fs.readFileSync('../core2/build/contracts/UniswapV2Factory.json', 'utf-8'))
const pair2Data = JSON.parse(fs.readFileSync('../core2/build/contracts/UniswapV2Pair.json', 'utf-8'))
// Router 2 
const router2Data = JSON.parse(fs.readFileSync('../periphery2/build/contracts/UniswapV2Router02.json', 'utf-8'))

// Token data
const token1Data =  JSON.parse(fs.readFileSync('../tokens/build/contracts/Token1.json', 'utf-8'))
const token2Data =  JSON.parse(fs.readFileSync('../tokens/build/contracts/Token2.json', 'utf-8'))
const token3Data =  JSON.parse(fs.readFileSync('../tokens/build/contracts/Token3.json', 'utf-8'))

// Arb data
const arbitrageData = JSON.parse(fs.readFileSync('../arb/build/contracts/Arbitrage.json', 'utf-8'))





// Adress en dure
//const routerAddress = "0x84327A67Fb0572068135dccBE7650B4F2b30FEc2";
//
//// Core compiling write data here 
//const factoryAddress = "0xFE4F850b4B8c8A4B5e01Cd9e80Bb6EEa91bc0329";
//const token1Address = "0x013c8dB9FBcE660F67046B2472eBdE712411EeaD";
//const token2Address = "0x0Fc41c7644556ac3afA2c1076cD3357E504960c2";
//const token3Address = "0xe1fe995C37a7153D46198b146aaaD77EeeB0A333";
//
//const arbitrageAddress = "0x2b4971f87Fe7f94f75be726134625ce76FFC5eD9";




module.exports = {
    //routerAddress,
    //factoryAddress,
    //token1Address,
    //token2Address,
    //token3Address,
    //arbitrageAddress,
    account1,
    account2,
    factory1Data,
    pair1Data,
    router1Data,
    factory2Data,
    pair2Data,
    router2Data,
    token1Data,
    token2Data,
    token3Data,
    arbitrageData
}