'use strict';
const {web3Factory} = require("../../utils/web3");
const { CHAIN_ID, LUM, BTC_ORACLE_ADDRESS, COFFINBOX_ADDRESS, PRICE_FETCHER_ADDRESS, SOR, BTC } = require("../../constants");

const web3 = web3Factory( CHAIN_ID );
const ERC20ContractABI = require('../../abis/ERC20ContractABI.json');
const CoffinContractABI = require('../../abis/CoffinContractABI.json');
const PriceFetcherABI = require('../../abis/PriceFetcherABI.json');
const ChainlinkOracleABI = require('../../abis/ChainlinkOracleABI.json');
const BtcOracleContract = new web3.eth.Contract(ChainlinkOracleABI, BTC_ORACLE_ADDRESS);

const CoffinContract = new web3.eth.Contract(CoffinContractABI, COFFINBOX_ADDRESS);

async function getCoffinInfo(ctx) {
    const tokenAddress = web3.utils.toChecksumAddress(ctx.params.id);
    const TokenContract = new web3.eth.Contract(ERC20ContractABI, tokenAddress);
    const PriceFetcherContract = new web3.eth.Contract(PriceFetcherABI, PRICE_FETCHER_ADDRESS);

    // GENERIC TOKEN DETAILS //
    const tokenSymbol = await TokenContract.methods.symbol().call();
    const tokenName = await TokenContract.methods.name().call();
    const tokenDecimals = await TokenContract.methods.decimals().call();
    const totalSupply = await TokenContract.methods.totalSupply().call();
    const tokenPrice 
        = tokenAddress === LUM ? 0 
            : tokenAddress === SOR ? 0 
            : tokenAddress === BTC 
            ? await BtcOracleContract.methods.latestAnswer().call() / 1E8 
            : await PriceFetcherContract.methods.currentTokenUsdcPrice(ctx.params.id).call() / 1e18
            ?? 0
    const divisor = 10**tokenDecimals
    const marketCap = totalSupply * tokenPrice / divisor
    const coffinBalance = await TokenContract.methods.balanceOf(COFFINBOX_ADDRESS).call();
    const tvl = coffinBalance * tokenPrice;

    // COFFIN TOKEN DETAILS //
    const masterContractOf = await CoffinContract.methods.masterContractOf(tokenAddress).call();
    const nonces = await CoffinContract.methods.nonces(tokenAddress).call();
    const pendingStrategy = await CoffinContract.methods.pendingStrategy(tokenAddress).call();
    const strategy = await CoffinContract.methods.strategy(tokenAddress).call();
    const startDate = await CoffinContract.methods.strategyData(tokenAddress).call()[0];
    const targetPercentage = await CoffinContract.methods.strategyData(tokenAddress).call()[1];
    const strategyBalance = await CoffinContract.methods.strategyData(tokenAddress).call()[2];
    const totalElastic = await CoffinContract.methods.totals(tokenAddress).call()[0];
    const totalBase = await CoffinContract.methods.totals(tokenAddress).call()[1];

    if (!("id" in ctx.params))
        return {"name": "Coffin"};
    else {
        return {
            "address": tokenAddress,
            "name": tokenName,
            "symbol": tokenSymbol,
            "price": tokenPrice,
            "decimals": tokenDecimals,
            "coffinBalance": coffinBalance,
            "mcap": marketCap,
            "tvl": tvl,
            "mcap": marketCap,
            "masterContractOf": masterContractOf,
            "nonces": nonces,
            "strategy": strategy,
            "pendingStrategy": pendingStrategy,
            "strategyStartDate": startDate,
            "strategyTargetPercentage": targetPercentage,
            "strategyBalance": strategyBalance,
            "totalElastic": totalElastic,
            "totalBase": totalBase,
            "api": `https://avax-api.soulswap.finance/info/tokens/${tokenAddress}`,
            "ftmscan": `https://snowtrace.io/address/${tokenAddress}#code`,
            "image": `https://raw.githubusercontent.com/soulswapfinance/assets/master/blockchains/avalanche/assets/${ctx.params.id}/logo.png`
        }
    }
}

async function getUserInfo(ctx) {
    const tokenAddress = web3.utils.toChecksumAddress(ctx.params.id);
    const TokenContract = new web3.eth.Contract(ERC20ContractABI, tokenAddress);
    const PriceFetcherContract = new web3.eth.Contract(PriceFetcherABI, PRICE_FETCHER_ADDRESS);
    const userAddress = web3.utils.toChecksumAddress(ctx.params.userAddress);

    // GENERIC TOKEN DETAILS //
    const tokenSymbol = await TokenContract.methods.symbol().call();
    const tokenName = await TokenContract.methods.name().call();
    const tokenDecimals = await TokenContract.methods.decimals().call();
    const totalSupply = await TokenContract.methods.totalSupply().call();
    const rawPrice 
        = tokenAddress === LUM ? 0 
            : tokenAddress === SOR ? 0
            : tokenAddress == BTC
            ? await BtcOracleContract.methods.latestAnswer().call() / 1E8
            : await PriceFetcherContract.methods.currentTokenUsdcPrice(ctx.params.id).call() / 1E18 
            ?? 0;
    const tokenPrice = rawPrice
    const divisor = 10**tokenDecimals
    const marketCap = totalSupply * tokenPrice / divisor
    const coffinBalance = await TokenContract.methods.balanceOf(COFFINBOX_ADDRESS).call() / divisor;
    const tvl = coffinBalance * tokenPrice;

    // USER DETAILS //
    const userBalance = await CoffinContract.methods.balanceOf(tokenAddress, userAddress).call() / divisor;
    const userTvl = userBalance * tokenPrice;
    
    // COFFIN TOKEN DETAILS //
    const masterContractOf = await CoffinContract.methods.masterContractOf(tokenAddress).call();
    const nonces = await CoffinContract.methods.nonces(tokenAddress).call();
    const pendingStrategy = await CoffinContract.methods.pendingStrategy(tokenAddress).call();
    // const strategy = await CoffinContract.methods.strategy(tokenAddress).call();
    const start = await CoffinContract.methods.strategyData(tokenAddress).call();
    const startDate = start[0];
    const target = await CoffinContract.methods.strategyData(tokenAddress).call();
    const targetPercentage = target[1];
    const strategy = await CoffinContract.methods.strategyData(tokenAddress).call();
    const strategyBalance = strategy[2];
    const elastic = await CoffinContract.methods.totals(tokenAddress).call();
    const totalElastic = elastic[0]
    const base = await CoffinContract.methods.totals(tokenAddress).call();
    const totalBase = base[1];

    if (!("id" in ctx.params))
        return {"name": "Coffin"};
    else {
        return {
            "address": tokenAddress,
            "name": tokenName,
            "symbol": tokenSymbol,
            "userBalance": userBalance,
            "price": tokenPrice,
            "decimals": tokenDecimals,
            "coffinBalance": coffinBalance,
            "mcap": marketCap,
            "tvl": tvl,
            "userTvl": userTvl,
            "mcap": marketCap,
            "masterContractOf": masterContractOf,
            "nonces": nonces,
            // "strategy": strategy,
            "pendingStrategy": pendingStrategy,
            "strategyStartDate": startDate,
            "strategyTargetPercentage": targetPercentage,
            "strategyBalance": strategyBalance,
            "totalElastic": totalElastic,
            "totalBase": totalBase,
            "api": `https://avax-api.soulswap.finance/info/tokens/${tokenAddress}`,
            "ftmscan": `https://snowtrace.io/address/${tokenAddress}#code`,
            "image": `https://raw.githubusercontent.com/soulswapfinance/assets/master/blockchains/avalanche/assets/${tokenAddress}/logo.png`
        }
    }
}

async function coffinInfo(ctx) {
    ctx.body = (await getCoffinInfo(ctx))
}

async function userInfo(ctx) {
    ctx.body = (await getUserInfo(ctx))
}

module.exports = { coffinInfo, userInfo };
