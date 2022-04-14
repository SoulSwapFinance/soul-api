'use strict';
const {web3Factory} = require("../../utils/web3");
const { FTM_CHAIN_ID, LUXOR_TREASURY_ADDRESS, PRICE_FETCHER_ADDRESS } = require("../../constants");

const web3 = web3Factory( FTM_CHAIN_ID );

const ERC20ContractABI = require('../../abis/ERC20ContractABI.json');
const PairContractABI = require('../../abis/PairContractABI.json');
const UnderworldContractABI = require('../../abis/UnderworldContractABI.json');

const PriceFetcherABI = require('../../abis/PriceFetcherABI.json');
const PriceFetcherContract = new web3.eth.Contract(PriceFetcherABI, PRICE_FETCHER_ADDRESS);

async function getPairInfo(ctx) {
    const pairAddress = web3.utils.toChecksumAddress(ctx.params.id);

    // Pair Pricing //
    const PairContract = new web3.eth.Contract(PairContractABI, pairAddress);
    const UnderworldContract = new web3.eth.Contract(UnderworldContractABI, pairAddress);
    
    const name = await PairContract.methods.name().call()
    const symbol = await PairContract.methods.symbol().call()

    const pairType 
        = symbol == 'SOUL-LP' 
            ? 'swap' 
            : 'underworld'

    const token0
        = pairType == 'swap'
            ? await PairContract.methods.token0().call()
            : await UnderworldContract.methods.asset().call()

    const token1
        = pairType == 'swap'
            ? await PairContract.methods.token1().call()
            : await UnderworldContract.methods.collateral().call()
    
    const Token0Contract = new web3.eth.Contract(ERC20ContractABI, token0);
    const Token1Contract = new web3.eth.Contract(ERC20ContractABI, token1);

    // Abstracta Mathematica //
    const pairDecimals = await PairContract.methods.decimals().call()
    const pairDivisor = 10**(pairDecimals)
    const lpSupply = await PairContract.methods.totalSupply().call() / pairDivisor

    const token0Decimals = await Token0Contract.methods.decimals().call()
    const token1Decimals = await Token1Contract.methods.decimals().call()

    const token0Divisor = 10**(token0Decimals)
    const token1Divisor = 10**(token1Decimals)

    const token0Balance = await Token0Contract.methods.balanceOf(pairAddress).call() / token0Divisor;
    const token1Balance = await Token1Contract.methods.balanceOf(pairAddress).call() / token1Divisor;

    const token0Symbol = await Token0Contract.methods.symbol().call();
    const token1Symbol = await Token1Contract.methods.symbol().call();

    // Prices & Value Locked //
    const token0Price = await PriceFetcherContract.methods.currentTokenUsdcPrice(token0).call() / 1e18
    const token1Price = await PriceFetcherContract.methods.currentTokenUsdcPrice(token1).call() / 1e18

    const lpValuePaired 
        = pairType == 'farm'
            ? token0Price * token0Balance * 2 // intuition: 2x the value of half the pair.
            : token0Price * await PairContract.methods.totalSupply().call() / pairDivisor

    const lpPrice = lpValuePaired / lpSupply

    const luxorTreasuryBalance = await PairContract.methods.balanceOf(LUXOR_TREASURY_ADDRESS).call();

    if (!("id" in ctx.params))
        return {"name": "Pairs"};
    else {
        return {
            "address": pairAddress,
            "name": name,
            "symbol": symbol,
            "pairDecimals": pairDecimals,
            "pairType": pairType,

            "lpPrice": lpPrice,
            "lpValue": lpValuePaired,

            "token0Address": token0,
            "token0Symbol": token0Symbol,
            "token0Decimals": token0Decimals,
            "token0Balance": token0Balance,
            "token0Price": token0Price,
            
            "token1Address": token1,
            "token1Symbol": token1Symbol,
            "token1Decimals": token1Decimals,
            "token1Price": token1Price,
            "token1Balance": token1Balance,

            "supply": lpSupply,
            "luxorTreasuryBalance": luxorTreasuryBalance,
            "api": `https://api.soulswap.finance/info/tokens/${pairAddress}`,
        }
    }
}

async function getUserPairInfo(ctx) {
    const pairAddress = web3.utils.toChecksumAddress(ctx.params.id);
    const userAddress = web3.utils.toChecksumAddress(ctx.params.userAddress);

    // Pair Pricing //
    const PairContract = new web3.eth.Contract(PairContractABI, pairAddress);
    const UnderworldContract = new web3.eth.Contract(UnderworldContractABI, pairAddress);
    
    const name = await PairContract.methods.name().call()
    const symbol = await PairContract.methods.symbol().call()

    const pairType 
        = symbol == 'SOUL-LP' 
            ? 'swap' 
            : 'underworld'

    const token0
        = pairType == 'swap'
            ? await PairContract.methods.token0().call()
            : await UnderworldContract.methods.asset().call()

    const token1
        = pairType == 'swap'
            ? await PairContract.methods.token1().call()
            : await UnderworldContract.methods.collateral().call()
    
    const Token0Contract = new web3.eth.Contract(ERC20ContractABI, token0);
    const Token1Contract = new web3.eth.Contract(ERC20ContractABI, token1);

    // Abstracta Mathematica //
    const pairDecimals = await PairContract.methods.decimals().call()
    const pairDivisor = 10**(pairDecimals)
    const lpSupply = await PairContract.methods.totalSupply().call() / pairDivisor

    const token0Decimals = await Token0Contract.methods.decimals().call()
    const token1Decimals = await Token1Contract.methods.decimals().call()

    const token0Divisor = 10**(token0Decimals)
    const token1Divisor = 10**(token1Decimals)

    const token0Balance = await Token0Contract.methods.balanceOf(pairAddress).call() / token0Divisor;
    const token1Balance = await Token1Contract.methods.balanceOf(pairAddress).call() / token1Divisor;

    const token0Symbol = await Token0Contract.methods.symbol().call();
    const token1Symbol = await Token1Contract.methods.symbol().call();
    
    // Prices & Value Locked //
    const token0Price = await PriceFetcherContract.methods.currentTokenUsdcPrice(token0).call() / 1e18
    const token1Price = await PriceFetcherContract.methods.currentTokenUsdcPrice(token1).call() / 1e18

    const lpValuePaired 
        = pairType == 'farm'
            ? token0Price * token0Balance * 2 // intuition: 2x the value of half the pair.
            : token0Price * await PairContract.methods.totalSupply().call() / pairDivisor

    const lpPrice = lpValuePaired / lpSupply
    const userBalance = await PairContract.methods.balanceOf(userAddress).call();
    const luxorTreasuryBalance = await PairContract.methods.balanceOf(LUXOR_TREASURY_ADDRESS).call();

    if (!("id" in ctx.params))
        return {"name": "Pairs"};
    else {
        return {
            "address": pairAddress,
            "name": name,
            "symbol": symbol,
            "pairDecimals": pairDecimals,
            "pairType": pairType,
            
            "userBalance": userBalance,

            "lpPrice": lpPrice,
            "lpValue": lpValuePaired,

            "token0Address": token0,
            "token0Symbol": token0Symbol,
            "token0Decimals": token0Decimals,
            "token0Price": token0Price,
            "token0Balance": token0Balance,

            "token1Address": token1,
            "token1Symbol": token1Symbol,
            "token1Decimals": token1Decimals,
            "token1Price": token1Price,
            "token1Balance": token1Balance,

            "supply": lpSupply,
            "luxorTreasuryBalance": luxorTreasuryBalance,
            "api": `https://api.soulswap.finance/info/tokens/${pairAddress}`,
        }
    }
}

async function pairInfo(ctx) {
    ctx.body = (await getPairInfo(ctx))
}

async function userPairInfo(ctx) {
    ctx.body = (await getUserPairInfo(ctx))
}

module.exports = { pairInfo, userPairInfo };
