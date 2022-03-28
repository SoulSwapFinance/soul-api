'use strict';

const {web3Factory} = require("../../utils/web3");
const { FTM_CHAIN_ID } = require("../../constants");
const web3 = web3Factory(FTM_CHAIN_ID);

const ERC20ContractABI = require('../../abis/ERC20ContractABI.json');
const PriceFetcherABI = require('../../abis/PriceFetcherABI.json');
const fetcherAddress = '0xba5da8aC172a9f014D42837EE1B678C4Ca96fB0E';
const BN = require('bn.js');

const StakeHelperABI = require('../../abis/StakeHelperABI.json');
// const { FTM_CHAIN_ID } = require("../../constants");
const LuxorStakeHelperAddress = "0x2Dd0D30f525e65641962904470660507e80940e4";
const LuxorAddress = "0x6671E20b83Ba463F270c8c75dAe57e3Cc246cB2b";

const LuxorStakeHelperContract = new web3.eth.Contract(StakeHelperABI, LuxorStakeHelperAddress);
const LuxorContract = new web3.eth.Contract(ERC20ContractABI, LuxorAddress);
const PriceFetcherContract = new web3.eth.Contract(PriceFetcherABI, fetcherAddress);

async function getInfo() {

    // METHOD CALLS //
    const totalSupply = await LuxorContract.methods.totalSupply().call();
    const tokenSymbol = await LuxorContract.methods.symbol().call();
    const tokenName = await LuxorContract.methods.name().call();
    const tokenDecimals = await LuxorContract.methods.decimals().call();
    const rawPrice = await PriceFetcherContract.methods.currentTokenUsdcPrice(LuxorAddress).call();
    const tokenPrice = rawPrice / 1e18
    const divisor = 10**tokenDecimals
    const marketCap = totalSupply * tokenPrice / divisor
    const warmupPeriod = new BN(await LuxorStakeHelperContract.methods.warmupPeriod().call());
    const epoch = await LuxorStakeHelperContract.methods.epoch().call();

        return {
            "address": LuxorAddress,
            "name": tokenName,
            "symbol": tokenSymbol,
            "warmup": warmupPeriod,
            "epoch": epoch,
            "price": tokenPrice,
            "decimals": tokenDecimals,
            "supply": totalSupply,
            "mcap": marketCap,
            "api": "https://api.soulswap.finance/info/tokens/" + LuxorAddress,
            "ftmscan": `https://ftmscan.com/address/${LuxorAddress}#code`,
            "image": `https://raw.githubusercontent.com/soulswapfinance/assets/master/blockchains/fantom/assets/${LuxorAddress}/logo.png`
        }
}

async function infos(ctx) {
    ctx.body = (await getInfo(ctx))
}

module.exports = {infos};
