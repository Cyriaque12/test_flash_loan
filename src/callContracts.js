const Web3 = require("web3")
const fs = require('fs');
const { exception } = require("console");
const { sign } = require("crypto");
const { create } = require("domain");




// perifery compile write data here
const constants = require("./constants.js")
//const routerAddress = constants.routerAddress;
//
//// Core compiling write data here 
//const factoryAddress = constants.factoryAddress;
//// Token compiling write data here
//const token1Address = constants.token1Address;
//const token2Address = constants.token2Address;
//const token3Address = constants.token3Address;
//
//const arbitrageAddress = constants.arbitrageAddress;

const account1 = constants.account1;
const account2 = constants.account2;


let factoryABI = constants.factory1Data['abi']
let pairABI = constants.pair1Data['abi']
let routerABI = constants.router1Data['abi']
let tokenABI =  constants.token1Data["abi"]
let arbitrageABI = constants.arbitrageData['abi']


let chainId;

// Address init in initAddress()
let factory1Address;
let router1Address;

let factory2Address;
let router2Address;

let token1Address;
let token2Address;
let token3Address;

let arbitrageAddress

var web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

async function initAddress() {
    chainId = await web3.eth.net.getId();
    factory1Address = constants.factory1Data["networks"][chainId]["address"]
    router1Address = constants.router1Data["networks"][chainId]["address"]
    factory2Address = constants.factory2Data["networks"][chainId]["address"]
    router2Address = constants.router2Data["networks"][chainId]["address"]
    token1Address = constants.token1Data["networks"][chainId]["address"]
    token2Address = constants.token2Data["networks"][chainId]["address"]
    token3Address = constants.token3Data["networks"][chainId]["address"]
    arbitrageAddress = constants.arbitrageData["networks"][chainId]["address"]

    console.log("init address done")
}

function getAmountOut(amountIn, reserveIn, reserveOut) {
    let amountInWithFees = amountIn * 997
    let numerator = amountInWithFees * reserveOut
    let denominator = reserveIn * 1000 + amountInWithFees
    return numerator/denominator
}

function getAmountIn(amountOut, reserveIn, reserveOut) {
    let numerator = reserveIn * amountOut * 1000
    let denominator = (reserveOut - amountOut) * 997
    let amountInRet = numerator/denominator + 1
    return amountInRet
}

async function approve(tokenAdress, to, amount, accountFrom) {
    let tokenContract = new web3.eth.Contract(tokenABI, tokenAdress);
    let tx = tokenContract.methods.approve(to, amount)
    let receipt = await signAndSendTx(tx, tokenAdress, accountFrom)
    //console.log(receipt)
    let amountApproved = await tokenContract.methods.allowance(accountFrom.address, to).call();
    //console.log("approved done : ", amountApproved)
}

function sortTokens(tokenA, tokenB) {
    return tokenA < tokenB ? [tokenA, tokenB] : [tokenB, tokenA];
}

async function mint(tokenAdress, acc) {
    let tokenContract = new web3.eth.Contract(tokenABI, tokenAdress);
    balance = await tokenContract.methods.balanceOf(acc.address).call()
    
    let mintTx = await tokenContract.methods.mint();
    //let gas = await mintTx.estimateGas()
    //console.log(mintTx)
    await signAndSendTx(mintTx, tokenAdress, acc)

    balance = await tokenContract.methods.balanceOf(acc.address).call()
    
}

async function signAndSendTx(tx, to, acc) {
    //console.log("sign and send tx")
    gas = await tx.estimateGas()
    gasPrice = await web3.eth.getGasPrice();
    data = tx.encodeABI();
    nonce = await web3.eth.getTransactionCount(acc.address)
    txData =  {
        to,
        data,
        gas,
        gasPrice,
        nonce,
        chainId
    };
    signedTx = await web3.eth.accounts.signTransaction(txData, acc.key);
    receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction)
    return receipt
}


async function addLiquidityToPair(tokenA, tokenB, amountA, amountB, routerAdd) {
    await approve(tokenA, routerAdd, amountA, account1);
    await approve(tokenB, routerAdd, amountB, account1);
    routerContract = new web3.eth.Contract(routerABI, routerAdd)
    let currentTimestamp = Math.round(Date.now() / 1000)
    const deadline = currentTimestamp + 60 * 20;
    let tx = routerContract.methods.addLiquidity(
                tokenA,
                tokenB,
                amountA,
                amountB,
                0,
                0,
                account1.address,
                deadline
            );
    await signAndSendTx(tx, routerAdd, account1);
}

async function removeLiquidityToPair(tokenA, tokenB, liquidity) {
    console.log("remove liquidity to pair", tokenA, tokenB,liquidity);
    pairAddress = await factoryContract.methods.getPair(tokenA, tokenB).call()
    await approve(pairAddress, routerAddress, liquidity, account1);
    //await approve(tokenB, routerAddress, amountB, account1);
    let currentTimestamp = Math.round(Date.now() / 1000)
    const deadline = currentTimestamp + 60 * 20;
    let tx = routerContract.methods.removeLiquidity(
                tokenA,
                tokenB,
                liquidity,
                0,
                0,
                account1.address,
                deadline
            );
    await signAndSendTx(tx, routerAddress, account1);
}

async function swapTokens(tokenA, tokenB, amountA) {
    // swap tokenA for tokenB
    await approve(tokenA, routerAddress, amountA, account1);
    deadline = Math.round(Date.now() / 1000) + 60 * 20;
    path = [tokenA, tokenB]
    tx = routerContract.methods.swapExactTokensForTokens(
        amountA,
        0, // Highly dangerous to do this
        path,
        account1.address,
        deadline
    );
    await signAndSendTx(tx, routerAddress, account1);
}

async function getReserve(tokenA, tokenB, factory) {
    factoryContract = new web3.eth.Contract(factoryABI, factory)
    pairAddress = await factoryContract.methods.getPair(tokenA, tokenB).call()
    //console.log(tokenA, tokenB, pairAddress)
    if (pairAddress == "0x0000000000000000000000000000000000000000") {
        createPairTx = factoryContract.methods.createPair(tokenA, tokenB);
        await signAndSendTx(createPairTx, factory, account1);
    }
    pairAddress = await factoryContract.methods.getPair(tokenA, tokenB).call()
    pairContract = new web3.eth.Contract(pairABI, pairAddress)
    reserve = await pairContract.methods.getReserves().call()
    return reserve
}

async function printReserve() {
    reserve12 = await getReserve(token1Address, token2Address, factory1Address)
    reserve23 = await getReserve(token2Address, token3Address, factory2Address)
    reserve13 = await getReserve(token1Address, token3Address, factory1Address)

    console.log("reserve12 fac1", reserve12);
    console.log("reserve23 fac2", reserve23);
    console.log("reserve13 fac3", reserve13);
}

async function printBalance() {
    token1Contract = new web3.eth.Contract(tokenABI, token1Address);
    token2Contract = new web3.eth.Contract(tokenABI, token2Address);
    token3Contract = new web3.eth.Contract(tokenABI, token3Address);
    balance1ToPrint = await token1Contract.methods.balanceOf(account1.address).call()
    balance2ToPrint = await token2Contract.methods.balanceOf(account1.address).call()
    balance3ToPrint = await token3Contract.methods.balanceOf(account1.address).call()
    console.log("balance1", balance1ToPrint, "balance2", balance2ToPrint, "balance3", balance3ToPrint)
}

async function emptyPair(tokenA, tokenB) {
    //reserve = await getReserve(tokenA, tokenB);
    //if (reserve[0] == 0 && reserve[1] == 0) {
    //    console.log("pair is already empty");
    //    return
    //}

    pairAddress = await factoryContract.methods.getPair(tokenA, tokenB).call()
    pairContract = new web3.eth.Contract(pairABI, pairAddress)
    liquidity = await pairContract.methods.balanceOf(account1.address).call();
    if (liquidity == 0) {
        console.log("pair empty");
        return
    }
    await removeLiquidityToPair(tokenA, tokenB, liquidity);
   //orderTokens = sortTokens(tokenA, tokenB);
   //if (orderTokens[0] == tokenA) {
   //    await removeLiquidityToPair(tokenA, tokenB, reserve[0], reserve[1]);
   //} else {
   //    await removeLiquidityToPair(tokenA, tokenB, reserve[1], reserve[2]);
   //}
}

async function fillReserve(tokenA, tokenB, amountA, amountB) {
    console.log("filling resere", tokenA, tokenB, amountA, amountB)
    reserve = await getReserve(tokenA, tokenB);
    
    orderTokens = sortTokens(tokenA, tokenB);
    if (orderTokens[0] == tokenA) {
        console.log("case1")
        console.log("new amountA", amountA - reserve[0])
        console.log("new amountB", amountB - reserve[1])

        await addLiquidityToPair(tokenA, tokenB, amountA - reserve[0], amountB - reserve[1]);
    } else {
        console.log("case2")
        console.log("new amountA", amountA - reserve[1])
        console.log("new amountB", amountB - reserve[0])
        await addLiquidityToPair(tokenA, tokenB, amountA - reserve[1], amountB - reserve[0]);
    }

}

async function initPairs() {
    console.log("launching main")
    await printReserve()
    await printBalance()
    should_mint = true;
    for (let i=0; i<2; i++) {
        if (should_mint) {
            await mint(token1Address, account1);
            await mint(token2Address, account1);
            await mint(token3Address, account1);
        }
    }
    console.log("minting done")
    await printBalance()

    

    //await emptyPair(token1Address, token2Address);
    //await emptyPair(token2Address, token3Address);
    //await emptyPair(token3Address, token1Address);

    await addLiquidityToPair(token1Address, token2Address, 10000, 20000, router1Address)
    await addLiquidityToPair(token2Address, token3Address, 30000, 50000, router2Address);
    await addLiquidityToPair(token3Address, token1Address, 70000, 30000, router1Address);
//
    console.log("add liquidity done");
    await printReserve()
}

async function getBalanceOfAddress(token) {
    tokenContract = new web3.eth.Contract(tokenABI, token);
    balance = await tokenContract.methods.balanceOf(account1.address).call()
    return balance
}

async function manualSwapWithRouter() {
    await printReserve()
    await printBalance()
    amountIn = 1000;
    balance1 = getBalanceOfAddress(token1Address);
    //balance2 = getBalanceOfAddress(token2Address);
    balance2 = 1950000;
    balance3 = getBalanceOfAddress(token3Address);
    await swapTokens(token1Address, token2Address, amountIn);
    //console.log("swap 1 done")
    //await printBalance()
    new_balance2 = await getBalanceOfAddress(token2Address)
    console.log(new_balance2, balance2)
    amountOut2 = new_balance2 - balance2;
    console.log("amount2In", amountOut2)
    //await swapTokens(token2Address, token3Address, amountOut2);
    console.log("swap 2 done")
    await printBalance()
    new_balance3 = await getBalanceOfAddress(token3Address)
    amountOut3 = new_balance3 - balance3;
    await swapTokens(token3Address, token1Address, 2841);
    console.log("swap 3 done")
    await printBalance()
}

async function getAmounts(path, amountIn, factories) {
    amounts = []
    amounts[0] = amountIn;
    for (let i=0; i < path.length-1; i++) {
        reserve = await getReserve(path[i], path[i+1], factories[i])
        sortedToken = sortTokens(path[i], path[i+1])
        reserveIn = sortedToken[0] == path[i] ? reserve[0] : reserve[1]
        reserveOut = sortedToken[0] == path[i] ? reserve[1] : reserve[0]
        amounts[i + 1] = Math.floor(getAmountOut(amounts[i], reserveIn, reserveOut));
    }
    return amounts
}

async function readArbitrageEvent(eventName) {
    events = arbContract.getPastEvents(eventName,function(error, events){
        console.log("all past events events");
        //console.log(events)
        for (let event of events) {
            console.log(event.returnValues);
        }
    })
    //console.log(events)
}

async function launchArbViaContract() {
    console.log("launching launchArbViaContract")
    await printReserve()
    await printBalance()
    let amountIn = 1000
    let path = [token1Address, token2Address, token3Address, token1Address];
    let factories = [factory1Address, factory2Address, factory1Address];
    let amounts = await getAmounts(path, amountIn, factories)
    console.log(amounts)
    
    for (let i=0; i < path.length; i++) {
        await approve(path[i], arbitrageAddress, amounts[i], account1);
    }

    
    let arbContract = new web3.eth.Contract(arbitrageABI, arbitrageAddress);
    let txArb = arbContract.methods.startArbitrage(path, amounts, factories);
    console.log("sending arb tx")
    await signAndSendTx(txArb, arbitrageAddress, account1)
    await printReserve()
    await printBalance()
}


async function main() {
    await initAddress()
    //await initPairs();
    await launchArbViaContract();
    //
    //await readArbitrageEvent("LoggerInt")
}



function testAmount() {
    let r1 = 10000;
    let r2 = 20000;
    amount2 = getAmountOut(1000, r1, r2)
    console.log(amount2);
    r2 = 30000;
    r3 = 50000;
    amount3 = getAmountOut(amount2, r2, r3)
    console.log(amount3)
    r3 = 70000
    r1 = 30000
    amount1 = getAmountOut(amount3, r3, r1)
    console.log(amount1)
}

//testAmount();
//testMyContract();

main()
