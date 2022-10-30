'use strict';
const {web3Factory} = require("../../utils/web3");
const { CHAIN_ID, MULTICALL_ADDRESS, PRICE_FETCHER_ADDRESS, AURA, SEANCE, SOUL_DAO, SUMMONER_ADDRESS, AUTOSTAKE_ADDRESS, BTC} = require("../../constants");

const web3 = web3Factory( CHAIN_ID );
const ERC20ContractABI = require('../../abis/ERC20ContractABI.json');
const MulticallContractABI = require('../../abis/MulticallContractABI.json');
const PriceFetcherABI = require('../../abis/PriceFetcherABI.json');
const AutoStakeContract = new web3.eth.Contract(ERC20ContractABI, AUTOSTAKE_ADDRESS);
const MulticallContract = new web3.eth.Contract(MulticallContractABI, MULTICALL_ADDRESS);
const AuraContract = new web3.eth.Contract(ERC20ContractABI, AURA);

const BN = require('bn.js');

async function getUserInfo(ctx) {
    const userAddress = web3.utils.toChecksumAddress(ctx.params.id);
    const nativeBalance = await MulticallContract.methods.getEthBalance(userAddress).call() / 1e18;

    const votingPower = await AuraContract.methods.balanceOf(userAddress).call() / 1e18;

    const daoPower = await AuraContract.methods.balanceOf(SOUL_DAO).call() / 1e18
    const summonerPower = await AuraContract.methods.balanceOf(SUMMONER_ADDRESS).call() / 1e18
    const seancePower = await AuraContract.methods.balanceOf(SEANCE).call() / 1e18
    const ineligiblePower = daoPower + summonerPower + seancePower;
    
    const totalVotingPower = await AuraContract.methods.totalSupply().call() / 1e18;

    const eligiblePower = totalVotingPower - ineligiblePower;
    const stakedBalance =  await AutoStakeContract.methods.balanceOf(userAddress).call() / 1e18;
    const protocolOwnership =  votingPower / eligiblePower * 100
    if (!("id" in ctx.params))
        return {"name": "Users"};
    else {
        return {
            "address": userAddress,
            "votingPower": votingPower,
            "ineligiblePower": ineligiblePower,
            "eligiblePower": eligiblePower,
            "nativeBalance": nativeBalance,
            "stakedBalance": stakedBalance,
            "protocolOwnership": protocolOwnership,
            "api": `https://avax-api.soulswap.finance/info/users/${userAddress}`,
            "ftmscan": `https://snowtrace.io/address/${userAddress}`,
        }
    }
}

async function getTokenInfo(ctx) {
    const userAddress = web3.utils.toChecksumAddress(ctx.params.id);
    const tokenAddress = web3.utils.toChecksumAddress(ctx.params.tokenAddress);

    const TokenContract = new web3.eth.Contract(ERC20ContractABI, tokenAddress);
    const PriceFetcherContract = new web3.eth.Contract(PriceFetcherABI, PRICE_FETCHER_ADDRESS);

    // METHOD CALLS //
    const tokenSymbol = await TokenContract.methods.symbol().call();
    const tokenName = await TokenContract.methods.name().call();

    const tokenDecimals = await TokenContract.methods.decimals().call();
    const divisor = 10**tokenDecimals
    
    const tokenPrice 
        = tokenAddress == BTC
        ? await BtcOracleContract.methods.latestAnswer().call() / 1E8
        : await PriceFetcherContract.methods.currentTokenUsdcPrice(tokenAddress).call() / 1E18

    const totalSupply = await TokenContract.methods.totalSupply().call();
    const marketCap = totalSupply * tokenPrice / divisor    
    const tokenBalance = await TokenContract.methods.balanceOf(userAddress).call();
    const tokenValue = tokenPrice * tokenBalance
    
    if (!("id" in ctx.params))
        return {"name": "Users"};
    else {
        return {
            "address": tokenAddress,
            "name": tokenName,
            "symbol": tokenSymbol,
            "balance": tokenBalance,
            "price": tokenPrice,
            "value": tokenValue,
            "decimals": tokenDecimals,
            "supply": totalSupply,
            "mcap": marketCap,
            "api": `https://avax-api.soulswap.finance/info/users/${userAddress}/${tokenAddress}`,
            "ftmscan": `https://snowtrace.io/address/${tokenAddress}#code`,
            "image": `https://raw.githubusercontent.com/soulswapfinance/assets/master/blockchains/avalanche/assets/${tokenAddress}/logo.png`
        }
    }
}

async function userInfo(ctx) {
    ctx.body = (await getUserInfo(ctx))
}

async function tokenInfo(ctx) {
    ctx.body = (await getTokenInfo(ctx))
}

module.exports = { userInfo, tokenInfo };
