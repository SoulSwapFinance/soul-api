'use strict';

const {web3Factory} = require("../../utils/web3");
const { 
  FTM_CHAIN_ID, SOUL_DAO,
  LUX, WFTM, SOUL, SOUL_FTM_LP, FTM_ETH_LP, SOUL_FTM_LP, FTM_ETH_LP, 
  USDC_DAI_LP, SOUL_FTM_LP, FTM_ETH_LP, USDC_DAI_LP, 
  FTM_BTC_LP, SOUL_USDC_LP, FTM_USDC_LP, FTM_DAI_LP,
  FTM_BNB_LP, SEANCE_FTM_LP, USDC_FUSD_LP, BTC_ETH_LP
} = require("../../constants");
const web3 = web3Factory(FTM_CHAIN_ID);

const ERC20ContractABI = require('../../abis/ERC20ContractABI.json');
const PriceFetcherABI = require('../../abis/PriceFetcherABI.json');
const PairContractABI = require('../../abis/PairContractABI.json');
const fetcherAddress = '0xba5da8aC172a9f014D42837EE1B678C4Ca96fB0E';
const BN = require('bn.js');

// CONTRACTS //

// Reserves //
const SoulContract = new web3.eth.Contract(ERC20ContractABI, SOUL);
const SeanceContract = new web3.eth.Contract(ERC20ContractABI, SEANCE);
const FantomContract = new web3.eth.Contract(ERC20ContractABI, WFTM);

// Protocol-Owned Liquidity (POL) //
const SoulFantomContract = new web3.eth.Contract(PairContractABI, SOUL_FTM_LP);
const FantomEthereumContract = new web3.eth.Contract(PairContractABI, FTM_ETH_LP);
const UsdcDaiContract = new web3.eth.Contract(PairContractABI, USDC_DAI_LP);
const FantomBitcoinContract = new web3.eth.Contract(PairContractABI, FTM_BTC_LP);
const SoulUsdcContract = new web3.eth.Contract(PairContractABI, SOUL_USDC_LP);
const FantomUsdcContract = new web3.eth.Contract(PairContractABI, FTM_USDC_LP);
const FantomDaiContract = new web3.eth.Contract(PairContractABI, FTM_DAI_LP);
const FantomBinanceContract = new web3.eth.Contract(PairContractABI, FTM_BNB_LP);
const SeanceFantomContract = new web3.eth.Contract(PairContractABI, SEANCE_FTM_LP);
const UsdcFusdContract = new web3.eth.Contract(PairContractABI, USDC_FUSD_LP);
const BtcEthContract = new web3.eth.Contract(PairContractABI, BTC_ETH_LP);

// Helpers //
// const StakeHelperContract = new web3.eth.Contract(StakeHelperABI, StakeHelperAddress);
// const BondHelperContract = new web3.eth.Contract(BondHelperABI, BondHelperAddress);
const PriceFetcherContract = new web3.eth.Contract(PriceFetcherABI, fetcherAddress);

async function getInfo() {
    // SOUL -- TOKEN INFO //
    const totalSupply = await SoulContract.methods.totalSupply().call() / 1e18;
    const stakedSoul = await SeanceContract.methods.totalSupply().call() / 1e18;
    const soulPrice = await PriceFetcherContract.methods.currentTokenUsdcPrice(SOUL).call() / 1e18;
    const marketCap = totalSupply * soulPrice;
    
    // Balances //
    const SoulBalance = await SoulContract.methods.balanceOf(SOUL_DAO);
    const FantomBalance = await FantomContract.methods.balanceOf(SOUL_DAO);
    const SoulFantomBalance = await SoulFantomContract.methods.balanceOf(SOUL_DAO);
    const FantomEthereumBalance = await FantomEthereumContract.methods.balanceOf(SOUL_DAO);
    const UsdcDaiBalance = await UsdcDaiContract.methods.balanceOf(SOUL_DAO);
    const FantomBitcoinBalance = await FantomBitcoinContract.methods.balanceOf(SOUL_DAO);
    const SoulUsdcBalance = await SoulUsdcContract.methods.balanceOf(SOUL_DAO);
    const FantomUsdcBalance = await FantomUsdcContract.methods.balanceOf(SOUL_DAO);
    const FantomDaiBalance = await FantomDaiContract.methods.balanceOf(SOUL_DAO);
    const FantomBinanceBalance = await FantomBinanceContract.methods.balanceOf(SOUL_DAO);
    const SeanceFantomBalance = await SeanceFantomContract.methods.balanceOf(SOUL_DAO);
    const UsdcFusdBalance = await UsdcFusdContract.methods.balanceOf(SOUL_DAO);
    const BtcEthBalance = await BtcEthContract.methods.balanceOf(SOUL_DAO);

        return {
            "address": SOUL,
            "name": "Soul Power",
            "symbol": "SOUL",
            "stakedSoul": stakedSoul,
            "price": soulPrice,
            "decimals": 18,
            "supply": totalSupply,
            "mcap": marketCap,
            
            "SoulBalance": SoulBalance,
            "FantomBalance": FantomBalance,
            "SoulFantomBalance": SoulFantomBalance,
            "FantomEthereumBalance": FantomEthereumBalance,
            "UsdcDaiBalance": UsdcDaiBalance,
            "FantomBitcoinBalance": FantomBitcoinBalance,
            "FantomUsdcBalance": FantomUsdcBalance,
            "SoulUsdcBalance": SoulUsdcBalance,
            "FantomDaiBalance": FantomDaiBalance,
            "FantomBinanceBalance": FantomBinanceBalance,
            "SeanceFantomBalance": SeanceFantomBalance,
            "UsdcFusdBalance": UsdcFusdBalance,
            "BtcEthBalance": BtcEthBalance,

            "api": `https://api.soulswap.finance/info/tokens/${SOUL}`,
            "ftmscan": `https://ftmscan.com/address/${SOUL}#code`,
            "image": `https://raw.githubusercontent.com/soulswapfinance/assets/master/blockchains/fantom/assets/${SOUL}/logo.png`
        }
}

// async function getBondInfo(ctx) {

//     // METHOD CALLS //
//     const bondAddress = ctx.params.id
//     const tokenName = await SoulContract.methods.name().call();
//     const principle = await BondHelperContract.methods.principle(bondAddress).call();

//     const marketPrice = await PriceFetcherContract.methods.currentTokenUsdcPrice(SoulAddress).call();
//     const bondPrice = await BondHelperContract.methods.bondPriceUsd(bondAddress).call();
    
//     const minimumPrice = await BondHelperContract.methods.minimumPrice(bondAddress).call();
//     const pendingPayout = await BondHelperContract.methods.pendingPayout(bondAddress).call();
//     const maximumPayout = await BondHelperContract.methods.maximumPayout(bondAddress).call();
//     const totalDebt = await BondHelperContract.methods.totalDebt(bondAddress).call();
//     const maximumDebt = await BondHelperContract.methods.maximumDebt(bondAddress).call();
//     const vestingTerm = await BondHelperContract.methods.vestingTerm(bondAddress).call();
//     const remainingDebt = maximumDebt - totalDebt;
//     const status = remainingDebt > 0 ? 'Available' : 'Unavailable'
    
//     const delta = marketPrice - bondPrice
//     const discount = delta > 0 ? (delta / marketPrice) * 100 : 0

//     return {
//             "address": bondAddress,
//             "vestingTerm": vestingTerm,
//             "status": status,
//             "name": tokenName,
//             "principle": principle,
//             "price": bondPrice,
//             "marketPrice": marketPrice,
//             "discount": discount,
//             "minimumPrice": minimumPrice,
//             "pendingPayout": pendingPayout,
//             "maximumPayout": maximumPayout,
//             "totalDebt": totalDebt,
//             "maximumDebt": maximumDebt,
//             "remainingDebt": remainingDebt
//         }
// }

// async function getStakeInfo(ctx) {

//     // METHOD CALLS //
//     const userAddress = ctx.params.userAddress    
//     const distribute = await StakeHelperContract.methods.distribute().call() / 1e9;
//     const epochLength = await StakeHelperContract.methods.epochLength().call();
//     const nextRebase = await StakeHelperContract.methods.nextRebase().call();
//     const warmupExpiry = await StakeHelperContract.methods.warmupExpiry(userAddress).call();
//     const warmupValue = await StakeHelperContract.methods.warmupValue(userAddress).call() / 1e9;

//     return {
//             "address": userAddress,
//             "epochLength": epochLength,
//             "nextRebase": nextRebase,
//             "distribute": distribute,
//             "warmupValue": warmupValue,
//             "warmupExpiry": warmupExpiry,
//     }
// }

async function infos(ctx) {
    ctx.body = (await getInfo(ctx))
}

// async function bondInfo(ctx) {
//     ctx.body = (await getBondInfo(ctx))
// }

// async function userInfo(ctx) {
//     ctx.body = (await getStakeInfo(ctx))
// }

module.exports = { infos };
