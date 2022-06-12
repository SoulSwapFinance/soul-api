'use strict';

const {web3Factory} = require("../../utils/web3");
const { 
  FTM_CHAIN_ID, SOUL_DAO, WFTM, SOUL, SEANCE, SOUL_FTM_LP, FTM_ETH_LP, USDC_DAI_LP, 
  FTM_BTC_LP, SOUL_USDC_LP, FTM_USDC_LP, FTM_DAI_LP, MULTICALL_ADDRESS,
  FTM_BNB_LP, SEANCE_FTM_LP, BTC_ETH_LP, AUTOSTAKE_ADDRESS, SUMMONER_ADDRESS
} = require("../../constants");
const web3 = web3Factory(FTM_CHAIN_ID);

const ERC20ContractABI = require('../../abis/ERC20ContractABI.json');
const PriceFetcherABI = require('../../abis/PriceFetcherABI.json');
const PairContractABI = require('../../abis/PairContractABI.json');
const fetcherAddress = '0xba5da8aC172a9f014D42837EE1B678C4Ca96fB0E';
const MulticallContractABI = require('../../abis/MulticallContractABI.json');
const AutoStakeContractABI = require('../../abis/AutoStakeContractABI.json');
const SummonerContractABI = require('../../abis/SummonerContractABI.json');

// CONTRACTS //
const MulticallContract = new web3.eth.Contract(MulticallContractABI, MULTICALL_ADDRESS);
const AutoStakeContract = new web3.eth.Contract(AutoStakeContractABI, AUTOSTAKE_ADDRESS);
const SummonerContract = new web3.eth.Contract(SummonerContractABI, SUMMONER_ADDRESS);

// Reserves //
const SoulContract = new web3.eth.Contract(ERC20ContractABI, SOUL);
const SeanceContract = new web3.eth.Contract(ERC20ContractABI, SEANCE);
// const FantomContract = new web3.eth.Contract(ERC20ContractABI, WFTM);

// Protocol-Owned Liquidity (POL) //
const FantomUsdcContract = new web3.eth.Contract(PairContractABI, FTM_USDC_LP);
const FantomSoulContract = new web3.eth.Contract(PairContractABI, SOUL_FTM_LP);
const SoulUsdcContract = new web3.eth.Contract(PairContractABI, SOUL_USDC_LP);
const FantomEthereumContract = new web3.eth.Contract(PairContractABI, FTM_ETH_LP);
const UsdcDaiContract = new web3.eth.Contract(PairContractABI, USDC_DAI_LP);
const FantomBitcoinContract = new web3.eth.Contract(PairContractABI, FTM_BTC_LP);
const FantomDaiContract = new web3.eth.Contract(PairContractABI, FTM_DAI_LP);
const FantomBinanceContract = new web3.eth.Contract(PairContractABI, FTM_BNB_LP);
const FantomSeanceContract = new web3.eth.Contract(PairContractABI, SEANCE_FTM_LP);
const BtcEthContract = new web3.eth.Contract(PairContractABI, BTC_ETH_LP);
const PriceFetcherContract = new web3.eth.Contract(PriceFetcherABI, fetcherAddress);

async function getPairPrice(pairAddress) {
// Helpers //
const PairContract = new web3.eth.Contract(PairContractABI, pairAddress)

// Abstracta Mathematica //
const pairDecimals = await PairContract.methods.decimals().call()
const pairDivisor = 10**(pairDecimals)
const lpSupply = await PairContract.methods.totalSupply().call() / pairDivisor
const token0 = await PairContract.methods.token0().call()
const Token0Contract = new web3.eth.Contract(ERC20ContractABI, token0);
const token0Decimals = await Token0Contract.methods.decimals().call()
const token0Divisor = 10**(token0Decimals)

// Prices & Value Locked //
const token0Balance = await Token0Contract.methods.balanceOf(pairAddress).call() / token0Divisor;
const token0Price = await PriceFetcherContract.methods.currentTokenUsdcPrice(token0).call() / 1e18
const lpValuePaired = token0Price * token0Balance * 2 // intuition: 2x the value of half the pair.
const lpPrice = lpValuePaired / lpSupply

return lpPrice

}

async function getInfo(ctx) {
    // SOUL -- TOKEN INFO //
    const totalSupply = await SoulContract.methods.totalSupply().call() / 1e18;
    const stakedSoul = await SeanceContract.methods.totalSupply().call() / 1e18;
    const SoulPrice = await PriceFetcherContract.methods.currentTokenUsdcPrice(SOUL).call() / 1e18;
    const FtmPrice = await PriceFetcherContract.methods.currentTokenUsdcPrice(WFTM).call() / 1e18;
    const marketCap = totalSupply * SoulPrice;
    
    // BALANCES //
    const SoulBalance = await SoulContract.methods.balanceOf(SOUL_DAO).call() / 1e18;
    const NativeBalance = await MulticallContract.methods.getEthBalance(SOUL_DAO).call() / 1e18;
    const FantomUsdcBalance = await FantomUsdcContract.methods.balanceOf(SOUL_DAO).call() / 1e18;
    const SoulFantomBalance = await FantomSoulContract.methods.balanceOf(SOUL_DAO).call() / 1e18;
    const SoulUsdcBalance = await SoulUsdcContract.methods.balanceOf(SOUL_DAO).call() / 1e18;
    const FantomEthereumBalance = await FantomEthereumContract.methods.balanceOf(SOUL_DAO).call() / 1e18;
    const UsdcDaiBalance = await UsdcDaiContract.methods.balanceOf(SOUL_DAO).call() / 1e18;
    const FantomBitcoinBalance = await FantomBitcoinContract.methods.balanceOf(SOUL_DAO).call() / 1e18;
    const FantomDaiBalance = await FantomDaiContract.methods.balanceOf(SOUL_DAO).call() / 1e18;
    const FantomBinanceBalance = await FantomBinanceContract.methods.balanceOf(SOUL_DAO).call() / 1e18;
    const SeanceFantomBalance = await FantomSeanceContract.methods.balanceOf(SOUL_DAO).call() / 1e18;
    const BitcoinEthereumBalance = await BtcEthContract.methods.balanceOf(SOUL_DAO).call() / 1e18;

    // PRICES //
    const FantomUsdcPrice = await getPairPrice(FTM_USDC_LP);
    const SoulFantomPrice = await getPairPrice(SOUL_FTM_LP);
    const SoulUsdcPrice = await getPairPrice(SOUL_USDC_LP);
    const FantomEthereumPrice = await getPairPrice(FTM_ETH_LP);
    const UsdcDaiPrice = await getPairPrice(USDC_DAI_LP);
    const FantomBitcoinPrice = await getPairPrice(FTM_BTC_LP);
    const FantomDaiPrice = await getPairPrice(FTM_DAI_LP);
    const FantomBinancePrice = await getPairPrice(FTM_BNB_LP);
    const SeanceFantomPrice = await getPairPrice(SEANCE_FTM_LP);
    const BitcoinEthereumPrice = await getPairPrice(BTC_ETH_LP);

    // VALUES //
    const NativeValue = FtmPrice * NativeBalance
    const SoulValue = SoulPrice * SoulBalance

    const FantomUsdcValue = FantomUsdcPrice * FantomUsdcBalance;
    const SoulFantomValue = SoulFantomPrice * SoulFantomBalance;
    const SoulUsdcValue = SoulUsdcPrice * SoulUsdcBalance;
    const FantomEthereumValue = FantomEthereumPrice * FantomEthereumBalance;
    const UsdcDaiValue = UsdcDaiPrice * UsdcDaiBalance;
    const FantomBitcoinValue = FantomBitcoinPrice * FantomBitcoinBalance;
    const FantomDaiValue = FantomDaiPrice * FantomDaiBalance;
    const FantomBinanceValue = FantomBinancePrice * FantomBinanceBalance;
    const SeanceFantomValue = SeanceFantomPrice * SeanceFantomBalance;
    const BitcoinEthereumValue = BitcoinEthereumPrice * BitcoinEthereumBalance;
    
    const totalReserveValue = NativeValue + SoulValue
    const totalLiquidityValue = FantomUsdcValue + SoulFantomValue + SoulUsdcValue + FantomEthereumValue + UsdcDaiValue + FantomBitcoinValue + FantomDaiValue + FantomBinanceValue + SeanceFantomValue + BitcoinEthereumValue

    // VALUES //


        return {
            "address": SOUL,
            "name": "Soul Power",
            "symbol": "SOUL",
            "stakedSoul": stakedSoul,
            "price": SoulPrice,
            "decimals": 18,
            "supply": totalSupply,
            "mcap": marketCap,
            
            "SoulBalance": SoulBalance,
            "NativeBalance": NativeBalance,

            // VALUE //
            "NativeValue": NativeValue,
            "SoulValue": SoulValue,

            "SoulFantomValue": SoulFantomValue,
            "SoulUsdcValue": SoulUsdcValue,
            "FantomEthereumValue": FantomEthereumValue,
            "UsdcDaiValue": UsdcDaiValue,
            "FantomUsdcValue": FantomUsdcValue,
            "FantomBitcoinValue": FantomBitcoinValue,
            "FantomDaiValue": FantomDaiValue,
            "FantomBinanceValue": FantomBinanceValue,
            "SeanceFantomValue": SeanceFantomValue,
            "BitcoinEthereumValue": BitcoinEthereumValue,

            "totalReserveValue": totalReserveValue,
            "totalLiquidityValue": totalLiquidityValue,
            "totalValue": totalReserveValue + totalLiquidityValue,

            "api": `https://api.soulswap.finance/soulswap`,
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


async function getVaultInfo() {

    const rawSoulPrice = await PriceFetcherContract.methods.currentTokenUsdcPrice(SOUL).call();    
    const soulPrice = rawSoulPrice / 1e18

    // METHOD CALLS //
    const harvestRewards = await AutoStakeContract.methods.calculateHarvestSoulRewards().call() / 1e18;
    const totalSupply = await AutoStakeContract.methods.totalSupply().call() / 1e18;
    const available = await AutoStakeContract.methods.available().call() / 1e18;
    const pendingSoulRewards = await AutoStakeContract.methods.calculateTotalPendingSoulRewards().call() / 1e18;
    const soulTvl = await AutoStakeContract.methods.soulBalanceOf().call() / 1e18;
    const tvl = soulTvl * soulPrice

    const callFee = await AutoStakeContract.methods.callFee().call();
    const bounty = callFee * available / 10_000;
    const performanceFee = await AutoStakeContract.methods.performanceFee().call();
    const pricePerShare = await AutoStakeContract.methods.getPricePerFullShare().call() / 1e18;
    const withdrawFee = await AutoStakeContract.methods.withdrawFee().call() / 10_000;
    const withdrawFeePeriod = await AutoStakeContract.methods.withdrawFeePeriod().call();
    const withdrawFeeHours = withdrawFeePeriod / 3_600;

    const poolInfo = await SummonerContract.methods.poolInfo(0).call()
    const allocPoint = poolInfo[1]
    const totalAllocPoint = await SummonerContract.methods.totalAllocPoint().call()
    const allocShare = allocPoint / totalAllocPoint * 100
    const SoulContract = new web3.eth.Contract(ERC20ContractABI, SOUL);
    const annualRewardsSummoner = await SummonerContract.methods.dailySoul().call() / 1e18 * 365 
    const annualRewardsPool = allocShare * annualRewardsSummoner / 100
    const annualRewardsValue = soulPrice * annualRewardsPool
    const soulBalance = await SoulContract.methods.balanceOf(SUMMONER_ADDRESS).call() / 1e18;
    const poolTVL = soulPrice * soulBalance

    const apr = annualRewardsValue / poolTVL * 100
    const frequency = 1.25 // once every 18hra
    const apy = ((1 + apr / 100) ** (1 / frequency)) * frequency * 100

    return {
            "totalSupply": totalSupply,
            "available": available,
            "harvestRewards": harvestRewards,
            "soulTvl": soulTvl,
            "tvl": tvl,
            "apy": apy,
            "apr": apr,
            "pendingSoulRewards": pendingSoulRewards,
            "pricePerShare": pricePerShare,
            "callFee": callFee,
            "bounty": bounty,
            "performanceFee": performanceFee,
            "withdrawFee": withdrawFee,
            "withdrawFeePeriod": withdrawFeePeriod,
            "withdrawFeeHours": withdrawFeeHours,
            "soulPrice": soulPrice
    }
}

async function getUserVaultInfo(ctx) {
    const userAddress = ctx.params.userAddress    
    const rawSoulPrice = await PriceFetcherContract.methods.currentTokenUsdcPrice(SOUL).call();    
    const soulPrice = rawSoulPrice / 1e18

    // METHOD CALLS //
    const userBalance = await AutoStakeContract.methods.balanceOf(userAddress).call() / 1e18;
    const totalSupply = await AutoStakeContract.methods.totalSupply().call() / 1e18;
    const available = await AutoStakeContract.methods.available().call() / 1e18;
    const harvestRewards = await AutoStakeContract.methods.calculateHarvestSoulRewards().call() / 1e18;
    const pendingSoulRewards = await AutoStakeContract.methods.calculateTotalPendingSoulRewards().call() / 1e18;
    const soulTvl = await AutoStakeContract.methods.soulBalanceOf().call() / 1e18;
    const tvl = soulTvl * soulPrice

    const userInfo = await AutoStakeContract.methods.userInfo(userAddress).call()

    const lastDepositedTime = userInfo[0]
    const soulAtLastUserAction = userInfo[1] / 1e18
    const lastUserActionTime = userInfo[2]

    const callFee = await AutoStakeContract.methods.callFee().call();
    const bounty = callFee * available / 10_000;
    const performanceFee = await AutoStakeContract.methods.performanceFee().call();
    const pricePerShare = await AutoStakeContract.methods.getPricePerFullShare().call() / 1e18;
    const stakedBalance = userBalance * pricePerShare

    const withdrawFee = await AutoStakeContract.methods.withdrawFee().call() / 10_000;
    const withdrawFeePeriod = await AutoStakeContract.methods.withdrawFeePeriod().call();
    const withdrawFeeHours = withdrawFeePeriod / 3_600;

    return {
            "totalSupply": totalSupply,
            "userBalance": userBalance,
            "stakedBalance": stakedBalance,
            "lastDepositedTime": lastDepositedTime,
            "soulAtLastUserAction": soulAtLastUserAction,
            "lastUserActionTime": lastUserActionTime,
            "available": available,
            "harvestRewards": harvestRewards,
            "soulTvl": soulTvl,
            "tvl": tvl,
            "pendingSoulRewards": pendingSoulRewards,
            "pricePerShare": pricePerShare,
            "callFee": callFee,
            "bounty": bounty,
            "performanceFee": performanceFee,
            "withdrawFee": withdrawFee,
            "withdrawFeePeriod": withdrawFeePeriod,
            "withdrawFeeHours": withdrawFeeHours,
            "soulPrice": soulPrice
    }
}

async function infos(ctx) {
    ctx.body = (await getInfo(ctx))
}

async function vaultInfo(ctx) {
    ctx.body = (await getVaultInfo(ctx))
}

async function userVaultInfo(ctx) {
    ctx.body = (await getUserVaultInfo(ctx))
}

// async function bondInfo(ctx) {
//     ctx.body = (await getBondInfo(ctx))
// }

// async function userInfo(ctx) {
//     ctx.body = (await getStakeInfo(ctx))
// }

module.exports = { infos, userVaultInfo, vaultInfo };
