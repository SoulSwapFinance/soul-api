'use strict';
const {web3Factory} = require("../../utils/web3");
const { FTM_CHAIN_ID, LUM, SOR, AURA, MULTICALL_ADDRESS, SOUL_DAO, AUTOSTAKE_ADDRESS } = require("../../constants");

const web3 = web3Factory( FTM_CHAIN_ID );
const ERC20ContractABI = require('../../abis/ERC20ContractABI.json');
const MulticallContractABI = require('../../abis/MulticallContractABI.json');
const PriceFetcherABI = require('../../abis/PriceFetcherABI.json');
const fetcherAddress = '0xba5da8aC172a9f014D42837EE1B678C4Ca96fB0E';
const AuraContract = new web3.eth.Contract(ERC20ContractABI, AURA);
const AutoStakeContract = new web3.eth.Contract(ERC20ContractABI, AUTOSTAKE_ADDRESS);
const MulticallContract = new web3.eth.Contract(MulticallContractABI, MULTICALL_ADDRESS);

const BN = require('bn.js');

async function getUserInfo(ctx) {
    const userAddress = web3.utils.toChecksumAddress(ctx.params.id);
    const nativeBalance = await MulticallContract.methods.getEthBalance(userAddress).call() / 1e18;
    const votingPower =  await AuraContract.methods.balanceOf(userAddress).call() / 1e18;
    const ineligiblePower = await AuraContract.methods.balanceOf(SOUL_DAO).call() / 1e18;
    const totalVotingPower 
        = await AuraContract.methods.totalSupply().call() / 1e18;
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
            "api": `https://api.soulswap.finance/info/users/${userAddress}`,
            "ftmscan": `https://ftmscan.com/address/${userAddress}`,
        }
    }
}

async function getTokenInfo(ctx) {
    const userAddress = web3.utils.toChecksumAddress(ctx.params.id);
    const address = web3.utils.toChecksumAddress(ctx.params.tokenAddress);

    const TokenContract = new web3.eth.Contract(ERC20ContractABI, tokenAddress);
    const PriceFetcherContract = new web3.eth.Contract(PriceFetcherABI, fetcherAddress);

    // METHOD CALLS //
    const tokenSymbol = await TokenContract.methods.symbol().call();
    const tokenName = await TokenContract.methods.name().call();

    const tokenDecimals = await TokenContract.methods.decimals().call();
    const divisor = 10**tokenDecimals
    const rawPrice 
        = tokenAddress === LUM ? 0 
            : tokenAddress === SOR ? 0 
            : await PriceFetcherContract.methods
                .currentTokenUsdcPrice(tokenAddress).call() ?? 0;
    const totalSupply = await TokenContract.methods.totalSupply().call();
    const tokenPrice = rawPrice / 1e18
    const marketCap = totalSupply * tokenPrice / divisor    
    const tokenBalance = await TokenContract.methods.balanceOf(userAddress).call();
    const tokenValue = tokenPrice * tokenBalance

    if (!("id" in ctx.params))
        return {"name": "Users"};
    else {
        return {
            "address": address,
            "name": tokenName,
            "symbol": tokenSymbol,
            "balance": tokenBalance,
            "price": tokenPrice,
            "value": tokenValue,
            "decimals": tokenDecimals,
            "supply": totalSupply,
            "mcap": marketCap,
            "api": `https://api.soulswap.finance/info/users/${userAddress}/${tokenAddress}`,
            "ftmscan": `https://ftmscan.com/address/${address}#code`,
            "image": `https://raw.githubusercontent.com/soulswapfinance/assets/master/blockchains/fantom/assets/${ctx.params.id}/logo.png`
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
