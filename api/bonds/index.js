'use strict';

const {web3Factory} = require("../../utils/web3");
const { 
  CHAIN_ID, NATIVE_SOUL, NATIVE_ETH, USDC_DAI, 
  NATIVE_BTC, SOUL_USDC, NATIVE_USDC, SOUL_BOND,
  //, PRICE_FETCHER_ADDRESS
} = require("../../constants");
const web3 = web3Factory(CHAIN_ID);

const ERC20ContractABI = require('../../abis/ERC20ContractABI.json');
// const PriceFetcherABI = require('../../abis/PriceFetcherABI.json');
const PairContractABI = require('../../abis/PairContractABI.json');
const BondContractABI = require('../../abis/BondContractABI.json');

// CONTRACTS //
const BondContract = new web3.eth.Contract(BondContractABI, SOUL_BOND);
  
// Protocol-Owned Liquidity (POL) //
// const NativeUsdcContract = new web3.eth.Contract(PairContractABI, NATIVE_USDC);
// const NativeSoulContract = new web3.eth.Contract(PairContractABI, NATIVE_SOUL);
// const SoulUsdcContract = new web3.eth.Contract(PairContractABI, SOUL_USDC);
// const NativeEthereumContract = new web3.eth.Contract(PairContractABI, NATIVE_ETH);
// const UsdcDaiContract = new web3.eth.Contract(PairContractABI, USDC_DAI);
// const NativeBitcoinContract = new web3.eth.Contract(PairContractABI, NATIVE_BTC);
// const NativeDaiContract = new web3.eth.Contract(PairContractABI, NATIVE_DAI);
// const NativeBinanceContract = new web3.eth.Contract(PairContractABI, NATIVE_BNB);
// const NativeSeanceContract = new web3.eth.Contract(PairContractABI, NATIVE_SEANCE);
// const PriceFetcherContract = new web3.eth.Contract(PriceFetcherABI, PRICE_FETCHER_ADDRESS);

// async function getPairPrice(pairAddress) {
// // Helpers //
// const PairContract = new web3.eth.Contract(PairContractABI, pairAddress)

// // Abstracta Mathematica //
// const pairDecimals = await PairContract.methods.decimals().call()
// const pairDivisor = 10**(pairDecimals)
// const lpSupply = await PairContract.methods.totalSupply().call() / pairDivisor
// const token0 = await PairContract.methods.token0().call()
// const Token0Contract = new web3.eth.Contract(ERC20ContractABI, token0);
// const token0Decimals = await Token0Contract.methods.decimals().call()
// const token0Divisor = 10**(token0Decimals)

// // Prices & Value Locked //
// const token0Balance = await Token0Contract.methods.balanceOf(pairAddress).call() / token0Divisor;
// const token0Price = 0 
// // await PriceFetcherContract.methods.currentTokenUsdcPrice(token0).call() / 1e18
// const lpValuePaired = token0Price * token0Balance * 2 // intuition: 2x the value of half the pair.
// const lpPrice = lpValuePaired / lpSupply

// return lpPrice

// }

// async function getPoolTvl(pid) {
// // Helpers //
// const PairBalance
//     = await BondContract.methods.poolInfo(5).call()[4] // lpSupply 
// const PairPrice = await getPairPrice(pid)
// const pairTVL = PairPrice * PairBalance

// return pairTVL

// }

async function getInfo(ctx) {

    // BALANCES //
    // const NativeSoulBalance 
    //     = await BondContract.methods.poolInfo(0).call()[4] // lpSupply

    // const SoulUsdcBalance
    //     = await BondContract.methods.poolInfo(1).call()[4] // lpSupply

    // const NativeUsdcBalance = await BondContract.methods.poolInfo(2).call()[4] // lpSupply

    // const NativeBitcoinBalance 
    //     = await BondContract.methods.poolInfo(3).call()[4] // lpSupply
    
    // const NativeEthereumBalance 
    //     = await BondContract.methods.poolInfo(4).call()[4] // lpSupply
    
    // const UsdcDaiBalance 
    //     = await BondContract.methods.poolInfo(5).call()[4] // lpSupply 

    // PRICES //
    // const NativeSoulPrice = await getPairPrice(NATIVE_SOUL);
    // const SoulUsdcPrice = await getPairPrice(SOUL_USDC);
    // const NativeUsdcPrice = await getPairPrice(NATIVE_USDC);
    // const NativeEthereumPrice = await getPairPrice(NATIVE_ETH);
    // const NativeBitcoinPrice = await getPairPrice(NATIVE_BTC);
    // const UsdcDaiPrice = await getPairPrice(USDC_DAI);

    // VALUES //

    // const NativeSoulValue = NativeSoulPrice * NativeSoulBalance;
    // const SoulUsdcValue = SoulUsdcPrice * SoulUsdcBalance;
    // const NativeUsdcValue = NativeUsdcPrice * NativeUsdcBalance;
    // const NativeEthereumValue = NativeEthereumPrice * NativeEthereumBalance;
    // const NativeBitcoinValue = NativeBitcoinPrice * NativeBitcoinBalance;
    // const UsdcDaiValue = UsdcDaiPrice * UsdcDaiBalance;
    
    // const totalLiquidityValue 
    //     = NativeSoulValue + SoulUsdcValue + NativeUsdcValue 
    //     + NativeEthereumValue + NativeBitcoinValue + UsdcDaiValue

    // VALUES //
        return {
            "NativeSoulValue": 0,
            "SoulUsdcValue": 0,
            "NativeEthereumValue": 0,
            "UsdcDaiValue": 0,
            "NativeUsdcValue": 0,
            "NativeBitcoinValue": 0,
            "NativeDaiValue": 0,
            "NativeBinanceValue": 0,
            "NativeSeanceValue": 0,

            "totalLiquidityValue": 0,
            "totalValue": 0,

            "api": `https://avax-api.soulswap.finance/bonds`,
        }
}

async function getBondInfo(ctx) {

    // BOND PAIR INFO //
    const pid = ctx.params.pid
    const poolInfo = await BondContract.methods.poolInfo(pid).call()
    const pairAddress = poolInfo[0]
    // console.log('pairAddress: %s', pairAddress)
    const PairContract = new web3.eth.Contract(PairContractABI, pairAddress)
    const pairName = await PairContract.methods.name().call();
    const pairSymbol = await PairContract.methods.symbol().call();
    
    const token0Address = await PairContract.methods.token0().call();
    const token1Address = await PairContract.methods.token1().call();

    const Token0Contract = new web3.eth.Contract(ERC20ContractABI, token0Address)
    const Token1Contract = new web3.eth.Contract(ERC20ContractABI, token1Address)

    const token0Symbol = await Token0Contract.methods.symbol().call();
    const token1Symbol = await Token1Contract.methods.symbol().call();

    const pairDecimals = await PairContract.methods.decimals().call();
    const pairDivisor = 10**pairDecimals
    const pairSupply = await PairContract.methods.totalSupply().call() / pairDivisor;

    // const pairPrice = await getPairPrice(pairAddress)
    // const marketCap = pairPrice * pairSupply
    
    // VALUES //
    const rawSoulPrice = 0.01 // await PriceFetcherContract.methods.currentTokenUsdcPrice(SOUL).call();  // todo: update   
    // const soulPrice = rawSoulPrice / 1e18
    const annualRewardsSummoner = await BondContract.methods.dailySoul().call() / 1e18 * 365 
    
    const allocPoint = poolInfo[1]
    const totalAllocPoint = await BondContract.methods.totalAllocPoint().call()
    const allocShare = allocPoint / totalAllocPoint * 100
    const annualRewardsPool = allocShare * annualRewardsSummoner / 100

    // const annualRewardsValue = soulPrice * annualRewardsPool
    // const pairTVL = await getPoolTvl(pid)
    // const apr = annualRewardsValue / pairTVL * 100

    // VALUES //
        return {
            "address": pairAddress,
            "name": pairName,
            "symbol": pairSymbol,
            "token0": token0Address,
            "token1": token1Address,
            "token0Symbol": token0Symbol,
            "token1Symbol": token1Symbol,

            "decimals": pairDecimals,
            "supply": pairSupply,
            "mcap": 0,
            "tvl": 0,
            "apr": 0,

            "api": `https://avax-api.soulswap.finance/bonds/${pid}`,
        }
}

async function getUserInfo(ctx) {
    
    // BOND PAIR INFO //
    const pid = ctx.params.pid
    const userAddress = web3.utils.toChecksumAddress(ctx.params.userAddress);

    const poolInfo = await BondContract.methods.poolInfo(pid).call()
    const userInfo = await BondContract.methods.userInfo(pid, userAddress).call()

    const pendingSoul = await BondContract.methods.pendingSoul(pid, userAddress).call()
    const pairAddress = poolInfo[0]
    const PairContract = new web3.eth.Contract(PairContractABI, pairAddress)
    const pairName = await PairContract.methods.name().call();
    const pairSymbol = await PairContract.methods.symbol().call();
    
    const token0Address = await PairContract.methods.token0().call();
    const token1Address = await PairContract.methods.token1().call();

    const Token0Contract = new web3.eth.Contract(ERC20ContractABI, token0Address)
    const Token1Contract = new web3.eth.Contract(ERC20ContractABI, token1Address)

    const token0Symbol = await Token0Contract.methods.symbol().call();
    const token1Symbol = await Token1Contract.methods.symbol().call();

    const pairDecimals = await PairContract.methods.decimals().call();
    const pairDivisor = 10**pairDecimals
    const pairSupply = await PairContract.methods.totalSupply().call() / pairDivisor;

    // const pairPrice = await getPairPrice(pairAddress)
    // const marketCap = pairPrice * pairSupply

    // VALUES //
    const userBalance = await PairContract.methods.balanceOf(userAddress).call() / pairDivisor;
    const stakedBalance = userInfo[0] / pairDivisor
    // const userTVL = stakedBalance * pairPrice
    // const pairTVL = await getPoolTvl(pid)

        return {
            "address": pairAddress,
            "name": pairName,
            "symbol": pairSymbol,
            "token0": token0Address,
            "token1": token1Address,
            "token0Symbol": token0Symbol,
            "token1Symbol": token1Symbol,

            // PAIR VALUES
            "decimals": pairDecimals,
            "pairPrice": 0,
            "supply": pairSupply,
            "mcap": 0,
            "tvl": 0,

            // USER VALUES
            "userBalance": userBalance,
            "stakedBalance": stakedBalance,
            "pendingSoul": pendingSoul,
            "userTvl": userTVL,

            "api": `https://avax-api.soulswap.finance/bonds/${pid}`,
        }
}

async function infos(ctx) {
    ctx.body = (await getInfo(ctx))
}

async function bondInfo(ctx) {
    ctx.body = (await getBondInfo(ctx))
}

async function userInfo(ctx) {
    ctx.body = (await getUserInfo(ctx))
}

module.exports = { infos, bondInfo, userInfo };
