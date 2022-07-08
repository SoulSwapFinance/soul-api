'use strict';

const {web3Factory} = require("../../utils/web3");
const { 
  FTM_CHAIN_ID,
  LUX, DAI, LUM, WFTM
} = require("../../constants");
const web3 = web3Factory(FTM_CHAIN_ID);
const ERC20ContractABI = require('../../abis/ERC20ContractABI.json');
const LumensContractABI = require('../../abis/LumensContractABI.json');
const BondHelperABI = require('../../abis/LuxorBondHelperABI.json');
const PriceFetcherABI = require('../../abis/PriceFetcherABI.json');
const fetcherAddress = '0xba5da8aC172a9f014D42837EE1B678C4Ca96fB0E';
const BN = require('bn.js');

const StakeHelperABI = require('../../abis/StakeHelperABI.json');

const DistributorContractABI = require('../../abis/DistributorContractABI.json');

const BondHelperAddress = "0xdC7Bd8bA29ba99A250da6F0820ad9A1a285fE82a";
const LuxorAddress = "0x6671E20b83Ba463F270c8c75dAe57e3Cc246cB2b";
const LuxorStakeHelperAddress = "0x2Dd0D30f525e65641962904470660507e80940e4";
const LuxorStakeAddress = "0xf3F0BCFd430085e198466cdCA4Db8C2Af47f0802";
const WarmupAddress = "0x2B6Fe815F3D0b8C13E8F908A2501cdDC23D4Ed48";
const TreasuryAddress="0x38FA2E36AEf0A9CBbCffF0E507B0c7584705b78e";
const DistributorAddress="0x032f6db264E78885E156F04564344F4c1C59101f";

// CONTRACTS //
const LuxorContract = new web3.eth.Contract(ERC20ContractABI, LUX);
const LumensContract = new web3.eth.Contract(LumensContractABI, LUM);
const DistributorContract = new web3.eth.Contract(DistributorContractABI, DistributorAddress);

// Reserves
const DaiContract = new web3.eth.Contract(ERC20ContractABI, DAI);
const FtmContract = new web3.eth.Contract(ERC20ContractABI, WFTM);

// Liquidity
// const FtmLuxContract = new web3.eth.Contract(ERC20ContractABI, FTM_LUX_LP);
// const DaiLuxContract = new web3.eth.Contract(ERC20ContractABI, DAI_LUX_LP);

// Investments
// const FtmDaiContract = new web3.eth.Contract(ERC20ContractABI, FTM_DAI_LP);
// const FtmWlumContract = new web3.eth.Contract(ERC20ContractABI, FTM_WLUM_LP);
// const DaiLendFtmContract = new web3.eth.Contract(ERC20ContractABI, DAI_LEND_FTM);
// const FtmLendDaiContract = new web3.eth.Contract(ERC20ContractABI, FTM_LEND_DAI);

// Helpers
const LuxorStakeHelperContract = new web3.eth.Contract(StakeHelperABI, LuxorStakeHelperAddress);
const BondHelperContract = new web3.eth.Contract(BondHelperABI, BondHelperAddress);
const PriceFetcherContract = new web3.eth.Contract(PriceFetcherABI, fetcherAddress);

async function getInfo() {

    // METHOD CALLS //
    const totalSupply = await LuxorContract.methods.totalSupply().call() / 1e9;
    const tokenSymbol = await LuxorContract.methods.symbol().call();
    const tokenName = await LuxorContract.methods.name().call();
    const tokenDecimals = await LuxorContract.methods.decimals().call();

    const rawFtmPrice = await PriceFetcherContract.methods.currentTokenUsdcPrice(WFTM).call();
    const ftmPrice = rawFtmPrice / 1e18
    
    const rawLuxorPrice = await PriceFetcherContract.methods.currentTokenUsdcPrice(LUX).call();
    const luxorPrice = rawLuxorPrice / 1e18
    const marketCap = totalSupply * luxorPrice
    const warmupPeriod = new BN(await LuxorStakeHelperContract.methods.warmupPeriod().call());
    const epoch = await LuxorStakeHelperContract.methods.epoch().call();
    const distribute = await LuxorStakeHelperContract.methods.distribute().call() / 1e9;
    const nextRebase = await LuxorStakeHelperContract.methods.nextRebase().call();
    
    const stakingBalance = await LuxorContract.methods.balanceOf(LuxorStakeAddress).call() / 1e9;
    const warmupBalance = await LumensContract.methods.balanceOf(WarmupAddress).call() / 1e9;
    const ftmBalance = await FtmContract.methods.balanceOf(TreasuryAddress).call() / 1e18;
    const circulatingLumens = await LumensContract.methods.circulatingSupply().call() / 1e9;
    const index = await LumensContract.methods.index().call() / 1e9;
    const daiBalance = await DaiContract.methods.balanceOf(TreasuryAddress).call() / 1e18;
    const ftmValue = ftmBalance * ftmPrice
    const reserveBalance = ftmValue + daiBalance

        return {
            "address": LuxorAddress,
            "name": tokenName,
            "symbol": tokenSymbol,
            "warmup": warmupPeriod,
            "epoch": epoch,
            "index": index,
            "nextRebase": nextRebase,
            "distribute": distribute,
            "price": luxorPrice,
            "decimals": tokenDecimals,
            "supply": totalSupply,
            "mcap": marketCap,
            "circulatingLumens": circulatingLumens,
            "reserveBalance": reserveBalance,
            "stakingBalance": stakingBalance,
            "warmupBalance": warmupBalance,
            "api": `https://api.soulswap.finance/luxor`,
            "ftmscan": `https://ftmscan.com/address/${LuxorAddress}#code`,
            "image": `https://raw.githubusercontent.com/soulswapfinance/assets/master/blockchains/fantom/assets/${LuxorAddress}/logo.png`
        }
}

// async function getTreasuryInfo() {

//     // METHOD CALLS //
    
//     // reserveBalance =
//       // ftmBalance + daiBalance
    
//     const ftmBalance = await FtmContract.methods.balanceOf(TreasuryAddress).call();
//     const daiBalance = await DaiContract.methods.balanceOf(TreasuryAddress).call();

//     // liquidityBalance =
//      // luxFtmBalance + luxDaiBalance
//     const luxFtmBalance = await FtmLuxContract.methods.balanceOf(TreasuryAddress).call();

//     const luxDaiBalance = await DaiLuxContract.methods.balanceOf(TreasuryAddress).call();

//     // investBalance =
//      // ftmWlumBalance + ftmLendBalance +
//      // daiLendBalance + ftmDaiBalance
  
//     const ftmWlumBalance = await FtmWlumContract.methods.balanceOf(TreasuryAddress).call();
//     const ftmLendBalance = await DaiLendFtmContract.methods.balanceOf(TreasuryAddress).call();
//     const daiLendBalance = await FtmLendDaiContract.methods.balanceOf(TreasuryAddress).call();
//     const ftmDaiBalance = await FtmDaiContract.methods.balanceOf(TreasuryAddress).call();

//     return {
//             // "address": TreasuryAddress,
  
//             // "ftmBalance": ftmBalance,
//             // "daiBalance": daiBalance,
            
//             // "luxFtmBalance": luxFtmBalance,
//             // "luxDaiBalance": luxDaiBalance,
            
//             // "ftmWlumBalance": ftmWlumBalance,
//             // "daiLendBalance": daiLendBalance,
//             // "ftmLendBalance": ftmLendBalance,
//             "ftmDaiBalance": ftmDaiBalance,
         
//         }
// }


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
            "address": bondAddress,
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

async function getStakeInfo(ctx) {

    // METHOD CALLS //
    const userAddress = ctx.params.userAddress    
    const distribute = await LuxorStakeHelperContract.methods.distribute().call() / 1e9;
    const nextDistribution = await DistributorContract.methods.nextRewardFor(LuxorStakeAddress).call() / 1e9;
    
    const totalStaked = await LuxorContract.methods.balanceOf(LuxorStakeAddress).call() / 1e9
    
    const epochLength = await LuxorStakeHelperContract.methods.epochLength().call();
    const nextRebase = await LuxorStakeHelperContract.methods.nextRebase().call();
    const warmupExpiry = await LuxorStakeHelperContract.methods.warmupExpiry(userAddress).call();
    const warmupValue = await LuxorStakeHelperContract.methods.warmupValue(userAddress).call() / 1e9;
    
    const userStaked = await LumensContract.methods.balanceOf(userAddress).call() / 1e9 
    const userShare = (userStaked + warmupValue) / totalStaked

    const nextReward = userShare * nextDistribution

    return {
            "address": userAddress,
            "epochLength": epochLength,
            "nextRebase": nextRebase,
            "nextReward": nextReward,
            "userStaked": userStaked,
            "distribute": distribute,
            "warmupValue": warmupValue,
            "warmupExpiry": warmupExpiry,
    }
}

async function infos(ctx) {
    ctx.body = (await getInfo(ctx))
}

async function bondInfo(ctx) {
    ctx.body = (await getBondInfo(ctx))
}

async function userInfo(ctx) {
    ctx.body = (await getStakeInfo(ctx))
}

module.exports = { bondInfo, infos, userInfo };
