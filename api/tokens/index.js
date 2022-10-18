'use strict';
const {web3Factory} = require("../../utils/web3");
const { CHAIN_ID, PRICE_FETCHER_ADDRESS, BTC, BTC_ORACLE_ADDRESS } = require("../../constants");

const web3 = web3Factory( CHAIN_ID );
const ERC20ContractABI = require('../../abis/ERC20ContractABI.json');
const PriceFetcherABI = require('../../abis/PriceFetcherABI.json');
const ChainlinkOracleABI = require('../../abis/ChainlinkOracleABI.json');
const BtcOracleContract = new web3.eth.Contract(ChainlinkOracleABI, BTC_ORACLE_ADDRESS);

async function getTokenInfo(ctx) {
    const tokenAddress = web3.utils.toChecksumAddress(ctx.params.id);
    const TokenContract = new web3.eth.Contract(ERC20ContractABI, tokenAddress);
    const PriceFetcherContract = new web3.eth.Contract(PriceFetcherABI, PRICE_FETCHER_ADDRESS);

    // METHOD CALLS //
    const totalSupply = await TokenContract.methods.totalSupply().call();
    const tokenSymbol = await TokenContract.methods.symbol().call();
    const tokenName = await TokenContract.methods.name().call();
    const tokenDecimals = await TokenContract.methods.decimals().call();
    const tokenPrice
        = tokenAddress == BTC
        ? await BtcOracleContract.methods.latestAnswer().call() / 1E8
        : await PriceFetcherContract.methods.currentTokenUsdcPrice(tokenAddress).call() / 1E18 
        ?? 0

    const divisor = 10**tokenDecimals
    const marketCap = totalSupply * tokenPrice / divisor

    if (!("id" in ctx.params))
        return {"name": "Tokens"};
    else {
        return {
            "address": tokenAddress,
            "name": tokenName,
            "symbol": tokenSymbol,
            "price": tokenPrice,
            "decimals": tokenDecimals,
            "supply": totalSupply,
            "mcap": marketCap,
            "luxorTreasuryBalance": 0,
            "api": `https://avax-api.soulswap.finance/info/tokens/${tokenAddress}`,
            "ftmscan": `https://snowtrace.io/address/${tokenAddress}#code`,
            "image": `https://raw.githubusercontent.com/soulswapfinance/assets/master/blockchains/avalanche/assets/${tokenAddress}/logo.png`
        }
    }
}

async function tokenInfo(ctx) {
    ctx.body = (await getTokenInfo(ctx))
}

module.exports = { tokenInfo };
