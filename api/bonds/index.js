'use strict';

const {web3Factory} = require("../../utils/web3");
const { 
  FTM_CHAIN_ID, SOUL_DAO, SOUL_FTM_LP, FTM_ETH_LP, USDC_DAI_LP, 
  FTM_BTC_LP, SOUL_USDC_LP, FTM_USDC_LP, FTM_DAI_LP, SOUL_BOND,
  FTM_BNB_LP, SEANCE_FTM_LP, PRICE_FETCHER_ADDRESS
} = require("../../constants");
const web3 = web3Factory(FTM_CHAIN_ID);

const ERC20ContractABI = require('../../abis/ERC20ContractABI.json');
const PriceFetcherABI = require('../../abis/PriceFetcherABI.json');
const PairContractABI = require('../../abis/PairContractABI.json');
const BondContractABI = require('../../abis/BondContractABI.json');

// CONTRACTS //
const BondContract = new web3.eth.Contract(BondContractABI, SOUL_BOND);

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
    const SoulFantomBalance = await FantomSoulContract.methods.balanceOf(SOUL_BOND).call() / 1e18;
    const SoulUsdcBalance = await SoulUsdcContract.methods.balanceOf(SOUL_BOND).call() / 1e18;
    const SeanceFantomBalance = await FantomSeanceContract.methods.balanceOf(SOUL_BOND).call() / 1e18;
    const FantomUsdcBalance = await FantomUsdcContract.methods.balanceOf(SOUL_BOND).call() / 1e18;
    const FantomDaiBalance = await FantomDaiContract.methods.balanceOf(SOUL_BOND).call() / 1e18;
    const FantomBinanceBalance = await FantomBinanceContract.methods.balanceOf(SOUL_BOND).call() / 1e18;
    const FantomEthereumBalance = await FantomEthereumContract.methods.balanceOf(SOUL_BOND).call() / 1e18;
    const FantomBitcoinBalance = await FantomBitcoinContract.methods.balanceOf(SOUL_BOND).call() / 1e18;
    const UsdcDaiBalance = await UsdcDaiContract.methods.balanceOf(SOUL_BOND).call() / 1e18;

    // PRICES //
    const SoulFantomPrice = await getPairPrice(SOUL_FTM_LP);
    const SoulUsdcPrice = await getPairPrice(SOUL_USDC_LP);
    const SeanceFantomPrice = await getPairPrice(SEANCE_FTM_LP);
    const FantomUsdcPrice = await getPairPrice(FTM_USDC_LP);
    const FantomDaiPrice = await getPairPrice(FTM_DAI_LP);
    const FantomBinancePrice = await getPairPrice(FTM_BNB_LP);
    const FantomEthereumPrice = await getPairPrice(FTM_ETH_LP);
    const FantomBitcoinPrice = await getPairPrice(FTM_BTC_LP);
    const UsdcDaiPrice = await getPairPrice(USDC_DAI_LP);

    // VALUES //

    const SoulFantomValue = SoulFantomPrice * SoulFantomBalance;
    const SoulUsdcValue = SoulUsdcPrice * SoulUsdcBalance;
    const SeanceFantomValue = SeanceFantomPrice * SeanceFantomBalance;
    const FantomUsdcValue = FantomUsdcPrice * FantomUsdcBalance;
    const FantomDaiValue = FantomDaiPrice * FantomDaiBalance;
    const FantomBinanceValue = FantomBinancePrice * FantomBinanceBalance;
    const FantomEthereumValue = FantomEthereumPrice * FantomEthereumBalance;
    const FantomBitcoinValue = FantomBitcoinPrice * FantomBitcoinBalance;
    const UsdcDaiValue = UsdcDaiPrice * UsdcDaiBalance;
    
    const totalLiquidityValue 
        = SoulFantomValue + SoulUsdcValue + SeanceFantomValue 
        + FantomUsdcValue + FantomDaiValue + FantomBinanceValue 
        + FantomEthereumValue + FantomBitcoinValue + UsdcDaiValue

    // VALUES //
        return {
            "SoulFantomValue": SoulFantomValue,
            "SoulUsdcValue": SoulUsdcValue,
            "FantomEthereumValue": FantomEthereumValue,
            "UsdcDaiValue": UsdcDaiValue,
            "FantomUsdcValue": FantomUsdcValue,
            "FantomBitcoinValue": FantomBitcoinValue,
            "FantomDaiValue": FantomDaiValue,
            "FantomBinanceValue": FantomBinanceValue,
            "SeanceFantomValue": SeanceFantomValue,

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

    const pairPrice = await getPairPrice(pairAddress)
    const marketCap = pairPrice * pairSupply

    // VALUES //
    const pairTVL = await getPoolTvl(pairAddress)

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
            "mcap": marketCap,
            "tvl": pairTVL,

            "api": `https://api.soulswap.finance/bonds/${pid}`,
        }
}

async function getUserInfo(ctx) {
    // BOND PAIR INFO //
    const pid = ctx.params.pid
    const poolInfo = await BondContract.methods.poolInfo(pid).call()
    const pairAddress = poolInfo[0]
    const allocPoint = poolInfo[1]
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

    const pairPrice = await getPairPrice(pairAddress)
    const marketCap = pairPrice * pairSupply

    const totalAllocPoint = await BondContract.methods.totalAllocPoint().call()
    const allocShare = allocPoint / totalAllocPoint * 100

    const rawSoulPrice = await PriceFetcherContract.methods.currentTokenUsdcPrice(SOUL).call();    
    const soulPrice = rawSoulPrice / 1e18
    const annualRewardsSummoner = await BondContract.methods.dailySoul().call() / 1e18 * 365 
    const annualRewardsPool = allocShare * annualRewardsSummoner / 100

    // VALUES //
    const annualRewardsValue = soulPrice * annualRewardsPool
    const apr = annualRewardsValue / pairTVL * 100
    const pairTVL = await getPoolTvl(pairAddress)

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

    const pendingSoul = await BondContract.methods.pendingSoul(pid, userAddress).call()
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

    const pairPrice = await getPairPrice(pairAddress)
    const marketCap = pairPrice * pairSupply

    // VALUES //
    const stakedBalance = userInfo[0] / pairDivisor
    const userTVL = stakedBalance * pairPrice
    const pairTVL = await getPoolTvl(pairAddress)

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
            "pairPrice": pairPrice,
            "supply": pairSupply,
            "mcap": marketCap,
            "tvl": pairTVL,

            // USER VALUES
            "stakedBalance": stakedBalance,
            "pendingSoul": pendingSoul,
            "userTvl": userTVL,

            "api": `https://api.soulswap.finance/bonds/${pid}`,
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
