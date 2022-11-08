'use strict';
const {web3Factory} = require("../../utils/web3");
const { CHAIN_ID, LUXOR_TREASURY_ADDRESS, LUM, BTC, BTC_ORACLE_ADDRESS, SOR } = require("../../constants");

const web3 = web3Factory( CHAIN_ID );
const ERC20ContractABI = require('../../abis/ERC20ContractABI.json');
const PriceFetcherABI = require('../../abis/PriceFetcherABI.json');
const fetcherAddress = '0xba5da8aC172a9f014D42837EE1B678C4Ca96fB0E';
const BN = require('bn.js');

async function getTokenInfo(ctx) {
    const tokenAddress = web3.utils.toChecksumAddress(ctx.params.id);
    const TokenContract = new web3.eth.Contract(ERC20ContractABI, tokenAddress);
    const PriceFetcherContract = new web3.eth.Contract(PriceFetcherABI, fetcherAddress);
    const ChainlinkOracleABI = require('../../abis/ChainlinkOracleABI.json');
    const BtcOracleContract = new web3.eth.Contract(ChainlinkOracleABI, BTC_ORACLE_ADDRESS)
    
    // METHOD CALLS //
    const totalSupply = await TokenContract.methods.totalSupply().call();
    const tokenSymbol = await TokenContract.methods.symbol().call();
    const tokenName = await TokenContract.methods.name().call();
    const tokenDecimals = await TokenContract.methods.decimals().call();
    const divisor = 10**tokenDecimals

    const tokenPrice
        = tokenAddress === LUM ? 0 
        : tokenAddress == BTC
        ? await BtcOracleContract.methods.latestAnswer().call() / divisor
        : await PriceFetcherContract.methods.currentTokenUsdcPrice(tokenAddress).call() / 1E18

    const marketCap = totalSupply * tokenPrice / divisor
    const luxorTreasuryBalance = await TokenContract.methods.balanceOf(LUXOR_TREASURY_ADDRESS).call();

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
            "luxorTreasuryBalance": luxorTreasuryBalance,
            "api": `https://api.soulswap.finance/info/tokens/${tokenAddress}`,
            "ftmscan": `https://ftmscan.com/address/${tokenAddress}#code`,
            "image": `https://raw.githubusercontent.com/soulswapfinance/assets/master/blockchains/fantom/assets/${tokenAddress}/logo.png`
        }
    }
}

async function tokenInfo(ctx) {
    ctx.body = (await getTokenInfo(ctx))
}

module.exports = { tokenInfo };
