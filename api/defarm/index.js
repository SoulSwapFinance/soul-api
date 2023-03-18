'use strict';

const {web3Factory} = require("../../utils/web3");
const { CHAIN_ID, DEFARM_ADDRESS, SOUL, BTC, PRICE_FETCHER_ADDRESS, BTC_ORACLE_ADDRESS } = require("../../constants");
const web3 = web3Factory(CHAIN_ID);

const ERC20ContractABI = require('../../abis/ERC20ContractABI.json');
const PairContractABI = require('../../abis/PairContractABI.json');
const DeFarmContractABI = require('../../abis/DeFarmContractABI.json');
const ManifestationContractABI = require('../../abis/ManifestationContractABI.json');
const PriceFetcherABI = require('../../abis/PriceFetcherABI.json');
const ChainlinkOracleABI = require('../../abis/ChainlinkOracleABI.json');
const BtcOracleContract = new web3.eth.Contract(ChainlinkOracleABI, BTC_ORACLE_ADDRESS)

// CONTRACTS //
const DeFarmContract = new web3.eth.Contract(DeFarmContractABI, DEFARM_ADDRESS);

// HELPERS //
const PriceFetcherContract = new web3.eth.Contract(PriceFetcherABI, PRICE_FETCHER_ADDRESS);

async function getInfo() {
    const totalManifestations = await DeFarmContract.methods.totalManifestations().call()
    const bloodSacrifice = await DeFarmContract.methods.bloodSacrifice().call()

        return {
            "address": DEFARM_ADDRESS,
            "poolLength": totalManifestations,
            "bloodSacrifice": bloodSacrifice,
            "api": `https://api.soulswap.finance/defarms`,
            "ftmscan": `https://ftmscan.com/address/${DEFARM_ADDRESS}#code`,
        }
}

async function getUserInfo(ctx) {

    const pid = ctx.params.id
    const userAddress = ctx.params.userAddress
    const DIVISOR = 1e18

    // Pool Info //
    const poolInfo = await DeFarmContract.methods.getInfo(pid).call()
    
    const mAddress = poolInfo[0]
    const daoAddress = poolInfo[1]
    const name = poolInfo[2]
    const symbol = poolInfo[3]
    const logoURI = poolInfo[4]
    const rewardAddress = poolInfo[5]
    const depositAddress = poolInfo[6]
    const rewardPerSecond = poolInfo[7]
    const rewardRemaining = poolInfo[8]
    const startTime = poolInfo[9]
    const endTime = poolInfo[10]
    const dailyReward = poolInfo[11]
    const feeDays = poolInfo[12]

    // Contracts //
    const PairContract = new web3.eth.Contract(PairContractABI, depositAddress)
    const ManifestationContract = new web3.eth.Contract(ManifestationContractABI, mAddress);
    const token0 = await PairContract.methods.token0().call()
    const Token0Contract = new web3.eth.Contract(ERC20ContractABI, token0);
    const token0Balance = await Token0Contract.methods.balanceOf(depositAddress).call() / DIVISOR

    // Manifestation Details //
    const duraDays = await ManifestationContract.methods.duraDays().call()

    // Reward Details //
    const rawRewardPrice = await PriceFetcherContract.methods.currentTokenUsdcPrice(rewardAddress).call();    
    const rewardPrice = rawRewardPrice / 1e18
    // const annualRewardsPool = Number(dailyReward) / DIVISOR * 365 
  
    const pendingRewards = await ManifestationContract.methods.getPendingRewards(userAddress).call() / DIVISOR
    const pendingValue = pendingRewards * rewardPrice
    
    // User Info //
    const userInfo = await ManifestationContract.methods.getUserInfo(userAddress).call()
    const amount = userInfo[1]
    const rewardDebt = userInfo[2] / DIVISOR
    const withdrawTime = userInfo[3]
    const depositTime = userInfo[4]
    // const timeDelta = userInfo[5]
    // const deltaDays = userInfo[6]
    
    const userDelta = await ManifestationContract.methods.getUserDelta(userAddress).call()
    const stakedBalance = amount / DIVISOR
    const walletBalance =  await PairContract.methods.balanceOf(userAddress).call() / DIVISOR
    
    // Pair Pricing //
    const token0Price // = await ManifestationContract.methods.getPricePerToken().call()
        = token0 == BTC
            ? await BtcOracleContract.methods.latestAnswer().call() / DIVISOR
            : await PriceFetcherContract.methods.currentTokenUsdcPrice(token0).call() / 1E18
    
    const lpValuePaired = token0Price * token0Balance * 2 // intuition: 2x the value of half the pair.
    
    const lpSupply = await PairContract.methods.totalSupply().call() / DIVISOR;
    const lpPrice = lpValuePaired / lpSupply
    const stakedValue = lpPrice * stakedBalance

    // Fee: Rate & Time Remaining //
    const feeSeconds = feeDays * 86_400
    const remainingSeconds = userDelta >= feeSeconds ? 0 : feeSeconds - userDelta
    const secondsRemaining = remainingSeconds <= 0 ? 0 : remainingSeconds
    const daysRemaining = secondsRemaining / 86_400
    const daysPast = feeDays - daysRemaining
    const rateMeow = feeDays - daysPast
    const currentRate = rateMeow == 0 ? 0 : rateMeow

    return {
            "userAddress": userAddress,
            "name": name,
            "pairAddress": depositAddress,
            "pendingRewards": pendingRewards,
            "pendingValue": pendingValue,
            "stakedBalance": stakedBalance,
            "walletBalance": walletBalance,
            "stakedValue": stakedValue,
            "lpPrice": lpPrice,
            "userDelta": userDelta,
            "rewardDebt": rewardDebt,
            "lastWithdrawTime": withdrawTime,
            "firstDepositTime": depositTime,
            "timeDelta": userDelta,
            "secondsRemaining": secondsRemaining,
            "currentRate": currentRate,
            "startTime": startTime,
            "endTime": endTime
    }
}

async function getPoolInfo(ctx) {

    // ABCs //
    const pid = ctx.params.id
    const poolInfo = await DeFarmContract.methods.getInfo(pid).call()
    
    const mAddress = poolInfo[0]
    const daoAddress = poolInfo[1]
    const name = poolInfo[2]
    const symbol = poolInfo[3]
    const logoURI = poolInfo[4]
    const rewardAddress = poolInfo[5]
    const depositAddress = poolInfo[6]
    const rewardPerSecond = poolInfo[7]
    const rewardRemaining = poolInfo[8]
    const startTime = poolInfo[9]
    const endTime = poolInfo[10]
    const dailyReward = poolInfo[11]
    const feeDays = poolInfo[12]
    
    const status = rewardRemaining == 0 ? 'inactive' : 'active'
    // Manifestation Contract //
    // const ManifestationContract = new web3.eth.Contract(ManifestationContractABI, mAddress)
    
    // Pair Pricing //
    const PairContract = new web3.eth.Contract(PairContractABI, depositAddress)
    const token0 = await PairContract.methods.token0().call()
    const token1 = await PairContract.methods.token1().call()
    
    // Create Contracts //
    const Token0Contract = new web3.eth.Contract(ERC20ContractABI, token0)
    const Token1Contract = new web3.eth.Contract(ERC20ContractABI, token1)
    const RewardTokenContract = new web3.eth.Contract(ERC20ContractABI, rewardAddress)

    // Reward Token Details //
    const rewardSymbol = await RewardTokenContract.methods.symbol().call()
    
    // Abstracta Mathematica //
    const DIVISOR = 1e18
    const annualRewardsPool = Number(dailyReward) / DIVISOR * 365 

    // Tótalîstá //
    const lpSupply = await PairContract.methods.totalSupply().call() / DIVISOR;
    const lpBalance = await PairContract.methods.balanceOf(mAddress).call() / DIVISOR;
    const lpShare = lpBalance / lpSupply * 100;
    
    const token0Balance = await Token0Contract.methods.balanceOf(depositAddress).call() / DIVISOR;
    const token1Balance = await Token1Contract.methods.balanceOf(depositAddress).call() / DIVISOR;
    
    // PRICES & VALUES //
    const rawRewardPrice = await PriceFetcherContract.methods.currentTokenUsdcPrice(rewardAddress).call();    
    const rewardPrice = rawRewardPrice / 1e18
    const annualRewardsValue = rewardPrice * annualRewardsPool
    const token0Price
        = token0 == BTC
            ? await BtcOracleContract.methods.latestAnswer().call() / DIVISOR
            : await PriceFetcherContract.methods.currentTokenUsdcPrice(token0).call() / 1E18
    const lpValuePaired = token0Price * token0Balance * 2
    const lpPrice = lpValuePaired / lpSupply
    const poolTVL = lpPrice * lpBalance

    const apr = poolTVL == 0 ? 0 : annualRewardsValue / poolTVL * 100

    return {
        "pid": pid,
        "name": name,
        "symbol": symbol,
        "rewardSymbol": rewardSymbol,
        "logoURI": logoURI,
        "mAddress": mAddress,
        "daoAddress": daoAddress,
        "lpAddress": depositAddress,
        "rewardToken": rewardAddress,
        "rewardRemaining": rewardRemaining,
        "status": status,
        "pairType": 'farm',
        "rewardPerSecond": rewardPerSecond,
        "startTime": startTime,
        "endTime": endTime,
        "dailyReward": dailyReward,
        "feeDays": feeDays,
        "token0": token0,
        "token1": token1,
        "token0Balance": token0Balance,
        "token1Balance": token1Balance,
        "totalSupply": lpSupply,
        "lpBalance": lpBalance,
        "lpShare": lpShare,
        "annualRewards": annualRewardsPool,
        "rewardsPrice": rewardPrice,
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

async function stakeInfo(ctx) {
    ctx.body = (await getStakeInfo(ctx))
}

async function poolInfo(ctx) {
    ctx.body = (await getPoolInfo(ctx))
}

module.exports = { infos, poolInfo, stakeInfo, userInfo };