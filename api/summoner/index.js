'use strict';

const {web3Factory} = require("../../utils/web3");
const { 
  FTM_CHAIN_ID, SUMMONER_ADDRESS,
  SOUL, DAI, WFTM, PRICE_FETCHER_ADDRESS
} = require("../../constants");
const web3 = web3Factory(FTM_CHAIN_ID);

const ERC20ContractABI = require('../../abis/ERC20ContractABI.json');
const PairContractABI = require('../../abis/PairContractABI.json');
const UnderworldContractABI = require('../../abis/UnderworldContractABI.json');
const SummonerContractABI = require('../../abis/SummonerContractABI.json');
const PriceFetcherABI = require('../../abis/PriceFetcherABI.json');

const BN = require('bn.js');

// CONTRACTS //
const SummonerContract = new web3.eth.Contract(SummonerContractABI, SUMMONER_ADDRESS);

// HELPERS //
const PriceFetcherContract = new web3.eth.Contract(PriceFetcherABI, PRICE_FETCHER_ADDRESS);

async function getInfo() {

    const divisor = 1e18

    const dailySoul = await SummonerContract.methods.dailySoul().call() / divisor
    const soulPerSecond = await SummonerContract.methods.soulPerSecond().call() / divisor
    const startRate = await SummonerContract.methods.startRate().call() / divisor

    const totalAllocPoint = await SummonerContract.methods.totalAllocPoint().call()
    const weight = await SummonerContract.methods.weight().call()
    const weightTotal = await SummonerContract.methods.totalWeight().call()
    const weightShare = weight / weightTotal * 100

        return {
            "address": SUMMONER_ADDRESS,
            "dailySoul": dailySoul,
            "soulPerSecond": soulPerSecond,
            "soulPerYear": dailySoul * 365,
            "startRate": startRate,
            "totalAllocPoint": totalAllocPoint,
            "weight": weight,
            "weightTotal": weightTotal,
            "weightShare": weightShare,
            "api": `https://api.soulswap.finance/summoner`,
            "ftmscan": `https://ftmscan.com/address/${SUMMONER_ADDRESS}#code`,
        }
}

async function getUserInfo(ctx) {

    const pid = ctx.params.id
    const userAddress = ctx.params.userAddress
    const poolInfo = await SummonerContract.methods.poolInfo(pid).call()
    const pairAddress = poolInfo[0] // √

    const PairContract = new web3.eth.Contract(PairContractABI, pairAddress)
    const UnderworldContract = new web3.eth.Contract(UnderworldContractABI, pairAddress)

    const pairDecimals = await PairContract.methods.decimals().call()
    const pairDivisor = 10**pairDecimals
    const soulDivisor = 1e18

    const lpSupply = await PairContract.methods.totalSupply().call() / pairDivisor;

    const pairType 
        = (pid > 49 && pid < 53 && pid != 50)
            ? 'underworld' : 'farm'
    
    const token0Balance = await Token0Contract.methods.balanceOf(pairAddress).call() / token0Divisor

    // Pair Pricing //
    
    const token0
        = pairType == 'farm'
        ? await PairContract.methods.token0().call()
        : await UnderworldContract.methods.asset().call()

    const pendingSoul = await SummonerContract.methods.pendingSoul(pid, userAddress).call() / soulDivisor
    const Token0Contract = new web3.eth.Contract(ERC20ContractABI, token0);
    const token0Decimals = await Token0Contract.methods.decimals().call()
    const token0Divisor = 10**(token0Decimals)
    const userDelta = await SummonerContract.methods.userDelta(pid, userAddress).call()
    const userInfo = await SummonerContract.methods.userInfo(pid, userAddress).call()
    const stakedBalance = userInfo[0] / pairDivisor
    const token0Price = await PriceFetcherContract.methods.currentTokenUsdcPrice(token0).call() / 1e18

    const lpValuePaired 
            = pairType == 'farm'
            ? token0Price * token0Balance * 2 // intuition: 2x the value of half the pair.
            : token0Price * await PairContract.methods.totalSupply().call() / pairDivisor

    const lpPrice = lpValuePaired / lpSupply
    const rewardDebt = userInfo[1] / soulDivisor
    const rewardDebtAtTime = userInfo[2] / soulDivisor
    const lastWithdrawTime = userInfo[3]
    const firstDepositTime = userInfo[4]
    const timeDelta = userInfo[5]
    const lastDepositTime = userInfo[6]

    // Fee: Rate & Time Remaining //
    const feeDays = await SummonerContract.methods.startRate().call() / 1e18
    const feeSeconds = feeDays * 86_400
    const remainingSeconds = feeSeconds - userDelta
    const secondsRemaining = remainingSeconds <= 0 ? 0 : remainingSeconds
    const daysRemaining = secondsRemaining / 86_400
    const daysPast = feeDays - daysRemaining
    const rateMeow = feeDays - daysPast
    const currentRate = rateMeow <= 0 ? 0 : rateMeow

    return {
            "address": userAddress,
            "pendingSoul": pendingSoul,
            "stakedBalance": stakedBalance,
            "lpPrice": lpPrice,
            "userDelta": userDelta,
            "rewardDebt": rewardDebt,
            "rewardDebtAtTime": rewardDebtAtTime,
            "lastWithdrawTime": lastWithdrawTime,
            "firstDepositTime": firstDepositTime,
            "timeDelta": timeDelta,
            "lastDepositTime": lastDepositTime,
            "secondsRemaining": secondsRemaining,
            "currentRate": currentRate
    }
}

async function getPoolInfo(ctx) {
    
    // ABCs //
    const pid = ctx.params.id
    const poolInfo = await SummonerContract.methods.poolInfo(pid).call()
    const pairAddress = poolInfo[0] // √
    const allocPoint = poolInfo[1]
    const totalAllocPoint = await SummonerContract.methods.totalAllocPoint().call()
    const allocShare = allocPoint / totalAllocPoint * 100

    const status = allocPoint == 0 ? 'inactive' : 'active'
    // const lendingPids = [48, 49, 51, 52, 53]
    const pairType 
        = (pid > 49 && pid < 53 && pid != 50)
            ? 'underworld' : 'farm'

    // Pair Pricing //
    const PairContract = new web3.eth.Contract(PairContractABI, pairAddress);
    const UnderworldContract = new web3.eth.Contract(UnderworldContractABI, pairAddress);
    const token0
            = pairType == 'farm'
                ? await PairContract.methods.token0().call()
                : await UnderworldContract.methods.asset().call()

    const token1
        = pairType == 'farm'
        ? await PairContract.methods.token0().call()
        : await UnderworldContract.methods.collateral().call()
    
    // Create Contracts //
    const Token0Contract = new web3.eth.Contract(ERC20ContractABI, token0);
    const Token1Contract = new web3.eth.Contract(ERC20ContractABI, token1);

    const annualRewardsSummoner = await SummonerContract.methods.dailySoul().call() / 1e18 * 365 
    const annualRewardsPool = allocShare * annualRewardsSummoner / 100    

    // Abstracta Mathematica //
    const pairDecimals = await PairContract.methods.decimals().call()
    const token0Decimals = await Token0Contract.methods.decimals().call()
    const token1Decimals = await Token1Contract.methods.decimals().call()
    const pairDivisor = 10**(pairDecimals)
    const token0Divisor = 10**(token0Decimals)
    const token1Divisor = 10**(token1Decimals)

    // Tótalîstá //
    const lpSupply = await PairContract.methods.totalSupply().call() / pairDivisor;
    const lpBalance = await PairContract.methods.balanceOf(SUMMONER_ADDRESS).call() / pairDivisor;
    const lpShare = lpBalance / lpSupply * 100;
    
    const token0Balance = await Token0Contract.methods.balanceOf(pairAddress).call() / token0Divisor;
    const token1Balance = await Token1Contract.methods.balanceOf(pairAddress).call() / token1Divisor;
    
    // PRICES & VALUES //
    const rawSoulPrice = await PriceFetcherContract.methods.currentTokenUsdcPrice(SOUL).call();    
    const soulPrice = rawSoulPrice / 1e18
    const annualRewardsValue = soulPrice * annualRewardsPool
    const token0Price = await PriceFetcherContract.methods.currentTokenUsdcPrice(token0).call() / 1e18

    const lpValuePaired 
            = pairType == 'farm'
            ? token0Price * token0Balance * 2 // intuition: 2x the value of half the pair.
            : token0Price * await PairContract.methods.totalSupply().call() / pairDivisor

    const lpPrice = lpValuePaired / lpSupply
    const poolTVL = lpPrice * lpBalance
    const apr = annualRewardsValue / poolTVL * 100

    return {
        "pid": pid,
        "lpAddress": pairAddress,
        "allocPoint": allocPoint,
        "status": status,
        "pairType": pairType,
        "allocShare": allocShare,
        "token0": token0,
        "token1": token1,
        "token0Balance": token0Balance,
        "token1Balance": token1Balance,
        "totalSupply": lpSupply,
        "lpBalance": lpBalance,
        "lpShare": lpShare,
        "soulPerYear": annualRewardsPool,
        "rewardsPrice": soulPrice,
        "annualRewardsValue": annualRewardsValue,
        "lpValue": lpValuePaired,
        "lpPrice": lpPrice,
        "tvl": poolTVL,
        "apr": apr
    }
}

async function infos(ctx) {
    ctx.body = (await getInfo(ctx))
}

async function userInfo(ctx) {
    ctx.body = (await getUserInfo(ctx))
}

async function poolInfo(ctx) {
    ctx.body = (await getPoolInfo(ctx))
}

module.exports = { infos, poolInfo, userInfo };