'use strict';

const {web3Factory} = require("../../utils/web3");
const { 
    SOUL, CHAIN_ID, WNATIVE, NATIVE_SOUL, NATIVE_USDC, SOUL_USDC, NATIVE_BTC, NATIVE_ETH, SUMMONER_ADDRESS,
    USDC_DAI, SOUL_DAO, SEANCE, MULTICALL_ADDRESS, PRICE_FETCHER_ADDRESS, AUTOSTAKE_ADDRESS,
    NATIVE_DAI, NATIVE_BNB, BTC_ETH 
} = require("../../constants");
const web3 = web3Factory(CHAIN_ID);

const ERC20ContractABI = require('../../abis/ERC20ContractABI.json');
const PriceFetcherABI = require('../../abis/PriceFetcherABI.json');
const PairContractABI = require('../../abis/PairContractABI.json');
const MulticallContractABI = require('../../abis/MulticallContractABI.json');
const AutoStakeContractABI = require('../../abis/AutoStakeContractABI.json');
const SummonerContractABI = require('../../abis/SummonerContractABI.json');

// CONTRACTS //
const MulticallContract = new web3.eth.Contract(MulticallContractABI, MULTICALL_ADDRESS);
const AutoStakeContract = new web3.eth.Contract(AutoStakeContractABI, AUTOSTAKE_ADDRESS);
const SummonerContract = new web3.eth.Contract(SummonerContractABI, SUMMONER_ADDRESS);
const PriceFetcherContract = new web3.eth.Contract(PriceFetcherABI, PRICE_FETCHER_ADDRESS);

// Reserves //
const SoulContract = new web3.eth.Contract(ERC20ContractABI, SOUL);
const SeanceContract = new web3.eth.Contract(ERC20ContractABI, SEANCE);

// Protocol-Owned Liquidity (POL) //
const NativeUsdcContract = new web3.eth.Contract(PairContractABI, NATIVE_USDC);
const NativeSoulContract = new web3.eth.Contract(PairContractABI, NATIVE_SOUL);
const SoulUsdcContract = new web3.eth.Contract(PairContractABI, SOUL_USDC);
const NativeEthereumContract = new web3.eth.Contract(PairContractABI, NATIVE_ETH);
const UsdcDaiContract = new web3.eth.Contract(PairContractABI, USDC_DAI);
const NativeBitcoinContract = new web3.eth.Contract(PairContractABI, NATIVE_BTC);
const NativeDaiContract = new web3.eth.Contract(PairContractABI, NATIVE_DAI);
const NativeBinanceContract = new web3.eth.Contract(PairContractABI, NATIVE_BNB);
const BtcEthContract = new web3.eth.Contract(PairContractABI, BTC_ETH);

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
    const NativePrice = await PriceFetcherContract.methods.currentTokenUsdcPrice(WNATIVE).call() / 1e18;
    const marketCap = totalSupply * SoulPrice;
    
    // BALANCES //
    const SoulBalance = await SoulContract.methods.balanceOf(SOUL_DAO).call() / 1e18;
    const NativeBalance = await MulticallContract.methods.getEthBalance(SOUL_DAO).call() / 1e18;
    const NativeUsdcBalance = await NativeUsdcContract.methods.balanceOf(SOUL_DAO).call() / 1e18;
    const NativeSoulBalance = await NativeSoulContract.methods.balanceOf(SOUL_DAO).call() / 1e18;
    const SoulUsdcBalance = await SoulUsdcContract.methods.balanceOf(SOUL_DAO).call() / 1e18;
    const NativeEthereumBalance = await NativeEthereumContract.methods.balanceOf(SOUL_DAO).call() / 1e18;
    const UsdcDaiBalance = await UsdcDaiContract.methods.balanceOf(SOUL_DAO).call() / 1e18;
    const NativeBitcoinBalance = await NativeBitcoinContract.methods.balanceOf(SOUL_DAO).call() / 1e18;
    const NativeDaiBalance = await NativeDaiContract.methods.balanceOf(SOUL_DAO).call() / 1e18;
    const NativeBinanceBalance = await NativeBinanceContract.methods.balanceOf(SOUL_DAO).call() / 1e18;
    const BitcoinEthereumBalance = await BtcEthContract.methods.balanceOf(SOUL_DAO).call() / 1e18;

    // PRICES //
    const NativeUsdcPrice = await getPairPrice(NATIVE_USDC);
    const NativeSoulPrice = await getPairPrice(NATIVE_SOUL);
    const SoulUsdcPrice = await getPairPrice(SOUL_USDC);
    const NativeEthereumPrice = await getPairPrice(NATIVE_ETH);
    const UsdcDaiPrice = await getPairPrice(USDC_DAI);
    const NativeBitcoinPrice = await getPairPrice(NATIVE_BTC);
    const NativeDaiPrice = await getPairPrice(NATIVE_DAI);
    const NativeBinancePrice = await getPairPrice(NATIVE_BNB);
    const BitcoinEthereumPrice = await getPairPrice(BTC_ETH);

    // VALUES //
    const NativeValue = NativePrice * NativeBalance
    const SoulValue = SoulPrice * SoulBalance

    const NativeUsdcValue = NativeUsdcPrice * NativeUsdcBalance;
    const NativeSoulValue = NativeSoulPrice * NativeSoulBalance;
    const SoulUsdcValue = SoulUsdcPrice * SoulUsdcBalance;
    const NativeEthereumValue = NativeEthereumPrice * NativeEthereumBalance;
    const UsdcDaiValue = UsdcDaiPrice * UsdcDaiBalance;
    const NativeBitcoinValue = NativeBitcoinPrice * NativeBitcoinBalance;
    const NativeDaiValue = NativeDaiPrice * NativeDaiBalance;
    const NativeBinanceValue = NativeBinancePrice * NativeBinanceBalance;
    const BitcoinEthereumValue = BitcoinEthereumPrice * BitcoinEthereumBalance;
    
    const totalReserveValue = NativeValue + SoulValue
    // todo: update below
    const totalLiquidityValue = NativeUsdcValue + NativeSoulValue 
        + SoulUsdcValue + UsdcDaiValue + NativeEthereumValue 
        + NativeBitcoinValue + NativeDaiValue + NativeBinanceValue + BitcoinEthereumValue

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

            "NativeSoulValue": NativeSoulValue,
            "SoulUsdcValue": SoulUsdcValue,
            "NativeEthereumValue": NativeEthereumValue,
            "UsdcDaiValue": UsdcDaiValue,
            "NativeUsdcValue": NativeUsdcValue,
            "NativeBitcoinValue": NativeBitcoinValue,
            "NativeDaiValue": NativeDaiValue,
            "NativeBinanceValue": NativeBinanceValue,
            "NativeSeanceValue": 0,
            "BitcoinEthereumValue": BitcoinEthereumValue,

            "totalReserveValue": totalReserveValue,
            "totalLiquidityValue": totalLiquidityValue,
            "totalValue": totalReserveValue + totalLiquidityValue,

            "api": `https://api.soulswap.finance/soulswap`,
            "ftmscan": `https://snowtrace.io/address/${SOUL}#code`,
            "image": `https://raw.githubusercontent.com/soulswapfinance/assets/master/blockchains/avalanche/assets/${SOUL}/logo.png`
        }
}


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
    const withdrawFee = await AutoStakeContract.methods.withdrawFee().call() / 100
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
    const f = 1 // daily frequency(1x : 24H)
    const n = 365 // compound periods (daily, annualized)
    const apy = apr + (apr * 100 / n)

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

module.exports = { infos, userVaultInfo, vaultInfo };
