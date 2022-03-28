'use strict';
const {web3Factory} = require("../../utils/web3");
const { FTM_CHAIN_ID } = require("../../constants");

const web3 = web3Factory( FTM_CHAIN_ID );
const ERC20ContractABI = require('../../abis/ERC20ContractABI.json');
const PriceFetcherABI = require('../../abis/PriceFetcherABI.json');
const fetcherAddress = '0xba5da8aC172a9f014D42837EE1B678C4Ca96fB0E';
const BN = require('bn.js');

async function getInfo(ctx) {
    const tokenAddress = web3.utils.toChecksumAddress(ctx.params.id);
    const TokenContract = new web3.eth.Contract(ERC20ContractABI, tokenAddress);
    const PriceFetcherContract = new web3.eth.Contract(PriceFetcherABI, fetcherAddress);

    // METHOD CALLS //
    const totalSupply = await TokenContract.methods.totalSupply().call();
    const tokenSymbol = await TokenContract.methods.symbol().call();
    const tokenName = await TokenContract.methods.name().call();
    const tokenDecimals = await TokenContract.methods.decimals().call();
    const rawPrice = await PriceFetcherContract.methods.currentTokenUsdcPrice(ctx.params.id).call();
    const tokenPrice = rawPrice / 1e18
    const divisor = 10**tokenDecimals
    const marketCap = totalSupply * tokenPrice / divisor

    if (!("id" in ctx.params))
        return {"name": "Tokens"};
    else {
        return {
            "address": ctx.params.id,
            "name": tokenName,
            "symbol": tokenSymbol,
            "price": tokenPrice,
            "decimals": tokenDecimals,
            "supply": totalSupply,
            "mcap": marketCap,
            "api": "https://api.soulswap.finance/info/tokens/" + ctx.params.id,
            "ftmscan": `https://ftmscan.com/address/${ctx.params.id}#code`,
            "image": `https://raw.githubusercontent.com/soulswapfinance/assets/master/blockchains/fantom/assets/${ctx.params.id}/logo.png`
        }
    }
}

async function infos(ctx) {
    ctx.body = (await getInfo(ctx))
}

module.exports = {infos};
