'use strict';

const {web3Factory} = require("../../utils/web3");
const { 
  CHAIN_ID, SOUL, NATIVE_SOUL_LP, NATIVE_ETH_LP, USDC_DAI_LP, BTC,
  NATIVE_BTC_LP, SOUL_USDC_LP, NATIVE_USDC_LP, NATIVE_DAI_LP, SOUL_BOND,
  NATIVE_BNB_LP, NATIVE_SEANCE_LP, PRICE_FETCHER_ADDRESS, BTC_ORACLE_ADDRESS
} = require("../../constants");
const web3 = web3Factory(CHAIN_ID);

const ERC20ContractABI = require('../../abis/ERC20ContractABI.json');
const PriceFetcherABI = require('../../abis/PriceFetcherABI.json');
const PairContractABI = require('../../abis/PairContractABI.json');
const BondContractABI = require('../../abis/BondContractABI.json');
const UnderworldContractABI = require('../../abis/UnderworldContractABI.json');
const ChainlinkOracleABI = require('../../abis/ChainlinkOracleABI.json');
const BtcOracleContract = new web3.eth.Contract(ChainlinkOracleABI, BTC_ORACLE_ADDRESS)

// CONTRACTS //
const BondContract = new web3.eth.Contract(BondContractABI, SOUL_BOND);
  
// Protocol-Owned Liquidity (POL) //
const NativeUsdcContract = new web3.eth.Contract(PairContractABI, NATIVE_USDC_LP);
const NativeSoulContract = new web3.eth.Contract(PairContractABI, NATIVE_SOUL_LP);
const SoulUsdcContract = new web3.eth.Contract(PairContractABI, SOUL_USDC_LP);
const NativeEthereumContract = new web3.eth.Contract(PairContractABI, NATIVE_ETH_LP);
const UsdcDaiContract = new web3.eth.Contract(PairContractABI, USDC_DAI_LP);
const NativeBitcoinContract = new web3.eth.Contract(PairContractABI, NATIVE_BTC_LP);
const NativeDaiContract = new web3.eth.Contract(PairContractABI, NATIVE_DAI_LP);
const NativeBinanceContract = new web3.eth.Contract(PairContractABI, NATIVE_BNB_LP);
const NativeSeanceContract = new web3.eth.Contract(PairContractABI, NATIVE_SEANCE_LP);
const PriceFetcherContract = new web3.eth.Contract(PriceFetcherABI, PRICE_FETCHER_ADDRESS);

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

async function getPoolTvl(pairAddress) {
// Helpers //
const PairContract = new web3.eth.Contract(PairContractABI, pairAddress)
const PairBalance = await PairContract.methods.balanceOf(SOUL_BOND).call() / 1e18
const PairPrice = await getPairPrice(pairAddress)
const pairTVL = PairPrice * PairBalance

return pairTVL

}

async function getInfo(ctx) {

    // BALANCES //
    const NativeSoulBalance 
        = await NativeSoulContract.methods.balanceOf(SOUL_BOND).call() / 1e18
            // : await BondContract[chainId].methods.poolInfo(0).call()[4] // lpSupply

    const SoulUsdcBalance
        = await SoulUsdcContract.methods.balanceOf(SOUL_BOND).call() / 1e18
        // : await BondContract[chainId].methods.poolInfo(1).call()[4] // lpSupply

    const NativeSeanceBalance = await NativeSeanceContract.methods.balanceOf(SOUL_BOND).call() / 1e18;

    const NativeUsdcBalance 
        = await NativeUsdcContract.methods.balanceOf(SOUL_BOND).call() / 1e18
        // : await BondContract[chainId].methods.poolInfo(2).call()[4] // lpSupply

    const NativeDaiBalance = await NativeDaiContract.methods.balanceOf(SOUL_BOND).call() / 1e18;
    const NativeBinanceBalance = await NativeBinanceContract.methods.balanceOf(SOUL_BOND).call() / 1e18;

    const NativeBitcoinBalance 
        = await NativeBitcoinContract.methods.balanceOf(SOUL_BOND).call() / 1e18
        // : await BondContract[chainId].methods.poolInfo(3).call()[4] // lpSupply
    
    const NativeEthereumBalance 
        = await NativeEthereumContract.methods.balanceOf(SOUL_BOND).call() / 1e18
        // : await BondContract[chainId].methods.poolInfo(4).call()[4] // lpSupply
    
    const UsdcDaiBalance 
        = await UsdcDaiContract.methods.balanceOf(SOUL_BOND).call() / 1e18
        // : await BondContract[chainId].methods.poolInfo(5).call()[4] // lpSupply

    // PRICES //
    const NativeSoulPrice = await getPairPrice(NATIVE_SOUL_LP);
    const SoulUsdcPrice = await getPairPrice(SOUL_USDC_LP);
    const NativeSeancePrice = await getPairPrice(NATIVE_SEANCE_LP);
    const NativeUsdcPrice = await getPairPrice(NATIVE_USDC_LP);
    const NativeDaiPrice = await getPairPrice(NATIVE_DAI_LP);
    const NativeBinancePrice = await getPairPrice(NATIVE_BNB_LP);
    const NativeEthereumPrice = await getPairPrice(NATIVE_ETH_LP);
    const NativeBitcoinPrice = await getPairPrice(NATIVE_BTC_LP);
    const UsdcDaiPrice = await getPairPrice(USDC_DAI_LP);

    // VALUES //

    const NativeSoulValue = NativeSoulPrice * NativeSoulBalance;
    const SoulUsdcValue = SoulUsdcPrice * SoulUsdcBalance;
    const NativeSeanceValue = NativeSeancePrice * NativeSeanceBalance;
    const NativeUsdcValue = NativeUsdcPrice * NativeUsdcBalance;
    const NativeDaiValue = NativeDaiPrice * NativeDaiBalance;
    const NativeBinanceValue = NativeBinancePrice * NativeBinanceBalance;
    const NativeEthereumValue = NativeEthereumPrice * NativeEthereumBalance;
    const NativeBitcoinValue = NativeBitcoinPrice * NativeBitcoinBalance;
    const UsdcDaiValue = UsdcDaiPrice * UsdcDaiBalance;
    
    const totalLiquidityValue 
        = NativeSoulValue + SoulUsdcValue + NativeSeanceValue 
        + NativeUsdcValue + NativeDaiValue + NativeBinanceValue 
        + NativeEthereumValue + NativeBitcoinValue + UsdcDaiValue

    // VALUES //
        return {
            "NativeSoulValue": NativeSoulValue,
            "SoulUsdcValue": SoulUsdcValue,
            "NativeEthereumValue": NativeEthereumValue,
            "UsdcDaiValue": UsdcDaiValue,
            "NativeUsdcValue": NativeUsdcValue,
            "NativeBitcoinValue": NativeBitcoinValue,
            "NativeDaiValue": NativeDaiValue,
            "NativeBinanceValue": NativeBinanceValue,
            "NativeSeanceValue": NativeSeanceValue,

            "totalLiquidityValue": totalLiquidityValue,
            "totalValue": totalLiquidityValue,

            "api": `https://api.soulswap.finance/bonds`,
        }
}

async function getBondInfo(ctx) {

    // BOND PAIR INFO //
    const pid = ctx.params.pid
    const poolInfo = await BondContract.methods.poolInfo(pid).call()
    const pairAddress = poolInfo[0]
    const allocPoint = poolInfo[1]
    const totalAllocPoint = await BondContract.methods.totalAllocPoint().call()
    const allocShare = allocPoint / totalAllocPoint * 100
    // console.log('pairAddress: %s', pairAddress)
    const PairContract = new web3.eth.Contract(PairContractABI, pairAddress)
    const UnderworldContract = new web3.eth.Contract(UnderworldContractABI, pairAddress);
    const pairType
    = pid >=10 
          ? 'underworld' 
        : 'farm'

    const pairName = await PairContract.methods.name().call();
    const pairSymbol = await PairContract.methods.symbol().call();
    
    const token0
    = pairType == 'farm'
    ? await PairContract.methods.token0().call()
    : await UnderworldContract.methods.asset().call()

    const token1
    = pairType == 'farm'
        ? await PairContract.methods.token1().call()
        : await UnderworldContract.methods.collateral().call()
        
    const Token0Contract = new web3.eth.Contract(ERC20ContractABI, token0)
    const Token1Contract = new web3.eth.Contract(ERC20ContractABI, token1)

    const token0Symbol = await Token0Contract.methods.symbol().call();
    const token1Symbol = await Token1Contract.methods.symbol().call();

    // Abstracta Mathematica //
    const pairDecimals = await PairContract.methods.decimals().call()
    const token0Decimals = await Token0Contract.methods.decimals().call()
    const token1Decimals = await Token1Contract.methods.decimals().call()
    const pairDivisor = 10**(pairDecimals)
    const token0Divisor = 10**(token0Decimals)
    const token0Balance = await Token0Contract.methods.balanceOf(pairAddress).call() / token0Divisor;
    const pairSupply = await PairContract.methods.totalSupply().call() / pairDivisor;

    // const pairPrice = await getPairPrice(pairAddress)
    const token0Price 
    = token0 == BTC
        ? await BtcOracleContract.methods.latestAnswer().call() / token0Divisor
        : await PriceFetcherContract.methods.currentTokenUsdcPrice(token0).call() / 1E18
    const pairPrice 
        = pairType == 'farm'
        // 2x the value of half the pair.
        ? token0Price * token0Balance * 2
        // 100% of the asset token amount * asset token price
        : token0Price * await PairContract.methods.totalSupply().call() / pairDivisor

    const marketCap = pairPrice * pairSupply

    // Tótalîstá //
    const lpSupply = await PairContract.methods.totalSupply().call() / pairDivisor;
    const lpBalance = await PairContract.methods.balanceOf(SOUL_BOND).call() / pairDivisor;
    const lpShare = lpBalance / lpSupply * 100;

    // PRICES & VALUES //
    const annualRewards = await BondContract.methods.dailySoul().call() / 1e18 * 365 
    const annualRewardsPool = allocShare * annualRewards / 100

    const rawSoulPrice = await PriceFetcherContract.methods.currentTokenUsdcPrice(SOUL).call();    
    const soulPrice = rawSoulPrice / 1e18
    const annualRewardsValue = soulPrice * annualRewardsPool
    const lpValuePaired 
        = pairType == 'farm'
        // 2x the value of half the pair.
        ? token0Price * token0Balance * 2
        // 100% of the asset token amount * asset token price
        : token0Price * await PairContract.methods.totalSupply().call() / pairDivisor
    
    const lpPrice = lpValuePaired / lpSupply
    const pairTVL = lpPrice * lpBalance
       /* = pid == 8 // force fix for btc pools
        ? 2 * lpPrice * lpBalance
        : lpPrice * lpBalance */

    const apr = pairTVL == 0 ? 0 : annualRewardsValue / pairTVL * 100

    // VALUES //
        return {
            "address": pairAddress,
            "name": pairName,
            "symbol": pairSymbol,
            "token0": token0,
            "token1": token1,
            "token0Symbol": token0Symbol,
            "token1Symbol": token1Symbol,

            "decimals": pairDecimals,
            "supply": pairSupply,
            "mcap": marketCap,
            "tvl": pairTVL,
            "apr": apr,

            "api": `https://api.soulswap.finance/bonds/${pid}`,
        }
}

async function getUserInfo(ctx) {
    
    // BOND PAIR INFO //
    const pid = ctx.params.pid
    const userAddress = web3.utils.toChecksumAddress(ctx.params.userAddress);
    
    const poolInfo = await BondContract.methods.poolInfo(pid).call()
    const userInfo = await BondContract.methods.userInfo(pid, userAddress).call()
    
    const allocPoint = poolInfo[1]
    const totalAllocPoint = await BondContract.methods.totalAllocPoint().call()
    const allocShare = allocPoint / totalAllocPoint * 100

    const pendingSoul = await BondContract.methods.pendingSoul(pid, userAddress).call()
    const pairAddress = poolInfo[0]
    // console.log('pairAddress: %s', pairAddress)
    const PairContract = new web3.eth.Contract(PairContractABI, pairAddress)
    const UnderworldContract = new web3.eth.Contract(UnderworldContractABI, pairAddress);

    const pairName = await PairContract.methods.name().call();
    const pairSymbol = await PairContract.methods.symbol().call();
    const pairType
    = pid >=10 
          ? 'underworld' 
        : 'farm'

    const token0
    = pairType == 'farm'
    ? await PairContract.methods.token0().call()
    : await UnderworldContract.methods.asset().call()

    const token1
    = pairType == 'farm'
        ? await PairContract.methods.token1().call()
        : await UnderworldContract.methods.collateral().call()

    const Token0Contract = new web3.eth.Contract(ERC20ContractABI, token0)
    const Token1Contract = new web3.eth.Contract(ERC20ContractABI, token1)

    const token0Symbol = await Token0Contract.methods.symbol().call();
    const token1Symbol = await Token1Contract.methods.symbol().call();

    // const token1Balance = await Token1Contract.methods.balanceOf(pairAddress).call() / token1Divisor;


    // Abstracta Mathematica //
    const pairDecimals = await PairContract.methods.decimals().call()
    const token0Decimals = await Token0Contract.methods.decimals().call()
    const token1Decimals = await Token1Contract.methods.decimals().call()
    const pairDivisor = 10**(pairDecimals)
    const token0Divisor = 10**(token0Decimals)
    // const token1Divisor = 10**(token1Decimals)
    
    const token0Balance = await Token0Contract.methods.balanceOf(pairAddress).call() / token0Divisor;
    
    // Tótalîstá //
    const lpSupply = await PairContract.methods.totalSupply().call() / pairDivisor;
    const lpBalance = await PairContract.methods.balanceOf(SOUL_BOND).call() / pairDivisor;
    const lpShare = lpBalance / lpSupply * 100;

    // PRICES & VALUES //
    const annualRewards = await BondContract.methods.dailySoul().call() / 1e18 * 365 
    const annualRewardsPool = allocShare * annualRewards / 100

    const token0Price 
    = token0 == BTC
    ? await BtcOracleContract.methods.latestAnswer().call() / token0Divisor
    : await PriceFetcherContract.methods.currentTokenUsdcPrice(token0).call() / 1E18
    // const pairPrice 
    // = pairType == 'farm'
    // // 2x the value of half the pair.
    // ? token0Price * token0Balance * 2
    // // 100% of the asset token amount * asset token price
    // : token0Price * await PairContract.methods.totalSupply().call() / pairDivisor
    
    
    const rawSoulPrice = await PriceFetcherContract.methods.currentTokenUsdcPrice(SOUL).call();    
    const soulPrice = rawSoulPrice / 1e18
    const annualRewardsValue = soulPrice * annualRewardsPool
    const lpValuePaired 
        = pairType == 'farm'
        // 2x the value of half the pair.
        ? token0Price * token0Balance * 2
        // 100% of the asset token amount * asset token price
        : token0Price * await PairContract.methods.totalSupply().call() / pairDivisor
    
    const lpPrice = lpValuePaired / lpSupply
    
    const pairTVL = lpPrice * lpBalance
       /* = pid == 8 // force fix for btc pools
        ? 2 * lpPrice * lpBalance
        : lpPrice * lpBalance */
    
    const marketCap = lpPrice * lpSupply

    
    // USER INFO //
    const stakedBalance = userInfo[0] / pairDivisor
    const userBalance =  await PairContract.methods.balanceOf(userAddress).call() / pairDivisor
    const stakedValue = lpPrice * stakedBalance

    // const apr = pairTVL == 0 ? 0 : annualRewardsValue / pairTVL * 100

        return {
            "address": pairAddress,
            "name": pairName,
            "symbol": pairSymbol,
            "token0": token0,
            "token1": token1,
            "token0Symbol": token0Symbol,
            "token1Symbol": token1Symbol,

            // PAIR VALUES
            "decimals": pairDecimals,
            "pairPrice": lpPrice,
            "supply": lpSupply,
            "mcap": marketCap,
            "tvl": pairTVL,

            // USER VALUES
            "userBalance": userBalance,
            "stakedBalance": stakedBalance,
            "pendingSoul": pendingSoul,
            "userTvl": stakedValue,

            "api": `https://api.soulswap.finance/bonds/user/${userAddress}/${pid}`,
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
