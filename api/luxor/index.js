'use strict';

const {web3Factory} = require("../../utils/web3");
const { FTM_CHAIN_ID } = require("../../constants");
const web3 = web3Factory(FTM_CHAIN_ID);

const ERC20ContractABI = require('../../abis/ERC20ContractABI.json');
const BondHelperABI = require('../../abis/LuxorBondHelperABI.json');
const PriceFetcherABI = require('../../abis/PriceFetcherABI.json');
const fetcherAddress = '0xba5da8aC172a9f014D42837EE1B678C4Ca96fB0E';
const BN = require('bn.js');

const StakeHelperABI = require('../../abis/StakeHelperABI.json');
// const { FTM_CHAIN_ID } = require("../../constants");
const BondHelperAddress = "0xdC7Bd8bA29ba99A250da6F0820ad9A1a285fE82a";
const LuxorAddress = "0x6671E20b83Ba463F270c8c75dAe57e3Cc246cB2b";
const LuxorStakeHelperAddress = "0x2Dd0D30f525e65641962904470660507e80940e4";
const LuxorStakeHelperContract = new web3.eth.Contract(StakeHelperABI, LuxorStakeHelperAddress);

const BondHelperContract = new web3.eth.Contract(BondHelperABI, BondHelperAddress);
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

async function getBondInfo(ctx) {

    // METHOD CALLS //
    const bondAddress = ctx.params.id
    const tokenName = await LuxorContract.methods.name().call();
    const principle = await BondHelperContract.methods.principle(bondAddress).call();

    const marketPrice = await PriceFetcherContract.methods.currentTokenUsdcPrice(LuxorAddress).call();
    const bondPrice = await BondHelperContract.methods.bondPriceUsd(bondAddress).call();
    
    const minimumPrice = await BondHelperContract.methods.minimumPrice(bondAddress).call();
    const pendingPayout = await BondHelperContract.methods.pendingPayout(bondAddress).call();
    const maximumPayout = await BondHelperContract.methods.maximumPayout(bondAddress).call();
    const totalDebt = await BondHelperContract.methods.totalDebt(bondAddress).call();
    const maximumDebt = await BondHelperContract.methods.maximumDebt(bondAddress).call();
    const vestingTerm = await BondHelperContract.methods.vestingTerm(bondAddress).call();
    const remainingDebt = maximumDebt - totalDebt;
    const status = remainingDebt > 0 ? 'Available' : 'Unavailable'
    
    const delta = marketPrice - bondPrice
    const discount = delta > 0 ? (delta / marketPrice) * 100 : 0

    return {
            "address": LuxorAddress,
            "vestingTerm": vestingTerm,
            "status": status,
            "name": tokenName,
            "principle": principle,
            "price": bondPrice,
            "marketPrice": marketPrice,
            "discount": discount,
            "minimumPrice": minimumPrice,
            "pendingPayout": pendingPayout,
            "maximumPayout": maximumPayout,
            "totalDebt": totalDebt,
            "maximumDebt": maximumDebt,
            "remainingDebt": remainingDebt
        }
}

async function infos(ctx) {
    ctx.body = (await getInfo(ctx))
}

async function bondInfo(ctx) {
    ctx.body = (await getBondInfo(ctx))
}
module.exports = { bondInfo, infos };