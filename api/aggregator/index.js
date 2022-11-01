'use strict';
const {web3Factory} = require("../../utils/web3");
const { CHAIN_ID, RUBIC_ROUTER_ADDRESS, SWAP_INFO_ADDRESS } = require("../../constants");

const web3 = web3Factory( CHAIN_ID );

const RubicRouterABI = require('../../abis/RubicRouterABI.json');
const SwapInfoABI = require('../../abis/SwapInfoABI.json');
const RubicContract = new web3.eth.Contract(RubicRouterABI, RUBIC_ROUTER_ADDRESS);
const InfoContract = new web3.eth.Contract(SwapInfoABI, SWAP_INFO_ADDRESS);

async function getAggregatorInfo(ctx) {
    const tokenAddress = web3.utils.toChecksumAddress(ctx.params.id);
    const routerAddress = web3.utils.toChecksumAddress(RUBIC_ROUTER_ADDRESS);

    if (!("id" in ctx.params))
        return {"name": "Aggregator"};
    else {
        return {
            "routerAddress": routerAddress,
            "api": `https://api.soulswap.finance/aggregator/${tokenAddress}`,
        }
    }
}

async function getAmountsOut(ctx) {
    const inputAmount = ctx.params.inputAmount
    const fromAddress = web3.utils.toChecksumAddress(ctx.params.fromAddress);
    const toAddress = web3.utils.toChecksumAddress(ctx.params.toAddress);
    const fromAddressAsString = `${fromAddress}`
    const toAddressAsString = toAddress.toString()
    const path = [fromAddressAsString,toAddressAsString]
    const amountsOut = await InfoContract.methods.getAmountsOut(inputAmount, path).call()
    const SoulAmountOut = amountsOut[1]
    const SpookyAmountOut = amountsOut[3]
    const SpiritAmountOut = amountsOut[5]
    const OptimalDex 
        = SoulAmountOut >= SpookyAmountOut && SoulAmountOut >= SpiritAmountOut ? 'SoulSwap'
        : SpookyAmountOut > SoulAmountOut && SpookyAmountOut >= SpiritAmoutOut ? 'SpookySwap'
        : 'SpiritSwap'

    return {
        "infoAddress": SWAP_INFO_ADDRESS,
        "inputAmount": inputAmount,
        "fromAddress": fromAddress,
        "toAddress": toAddress,
        "SoulAmountOut": SoulAmountOut,
        "SpookyAmountOut": SpookyAmountOut,
        "SpiritAmountOut": SpiritAmountOut,
        "OptimalDex": OptimalDex,
        "api": `https://api.soulswap.finance/aggregator/${inputAmount}/${fromAddress}/${toAddress}`,
    }
}

async function aggregatorInfo(ctx) {
    ctx.body = (await getAggregatorInfo(ctx))
}

async function amountsOut(ctx) {
    ctx.body = (await getAmountsOut(ctx))
}

module.exports = { aggregatorInfo, amountsOut };
