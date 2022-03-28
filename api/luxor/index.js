'use strict';

const {web3Factory} = require("../../utils/web3");
const { 
  FTM_CHAIN_ID,
  TREASURY_ADDRESS,
  
  // erc20s
  LuxorContract,
  FtmContract,
  DaiContract,
  
  // liquidity
  DaiLuxContract,
  FtmLuxContract,
  
  // investments
  DaiLendFtmContract,
  FtmLendDaiContract,
  FtmDaiContract,
  FtmWlumContract,

} = require("../../constants");
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
const TreasuryAddress=TREASURY_ADDRESS;

const LuxorStakeHelperContract = new web3.eth.Contract(StakeHelperABI, LuxorStakeHelperAddress);

const BondHelperContract = new web3.eth.Contract(BondHelperABI, BondHelperAddress);

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

async function getTreasuryInfo() {

    // METHOD CALLS //
    
    // reserveBalance =
      // ftmBalance + daiBalance
    
    const ftmBalance = await FtmContract.methods.balanceOf(TreasuryAddress).call();
    const daiBalance = await DaiContract.methods.balanceOf(TreasuryAddress).call();

    // liquidityBalance =
     // luxFtmBalance + luxDaiBalance
    const luxFtmBalance = await FtmLuxContract.methods.balanceOf(TreasuryAddress).call();

    const luxDaiBalance = await DaiLuxContract.methods.balanceOf(TreasuryAddress).call();

    // investBalance =
     // ftmWlumBalance + ftmLendBalance +
     // daiLendBalance + ftmDaiBalance
  
const ftmWlumBalance = await FtmWlumContract.methods.balanceOf(TreasuryAddress).call();

const ftmLendBalance = await DaiLendFtmContract.methods.balanceOf(TreasuryAddress).call();

const daiLendBalance = await FtmLendDaiContract.methods.balanceOf(TreasuryAddress).call();

const ftmDaiBalance = await FtmDaiContract.methods.balanceOf(TreasuryAddress).call();

    return {
            "address": TreasuryAddress,
  
            "ftmBalance": ftmBalance,
            "daiBalance": daiBalance,
            
            "luxFtmBalance": luxFtmBalance,
            "luxDaiBalance": luxDaiBalance,
            
            "ftmWlumBalance": ftmWlumBalance,
            "daiLendBalance": daiLendbalance,
            "ftmLendBalance": ftmLendBalance,
            "ftmDaiBalance": ftmDaiBalance,
         
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

async function treasuryInfo(ctx) {
    ctx.body = (await getBondInfo(ctx))
}

module.exports = { bondInfo, infos, treasuryInfo };
