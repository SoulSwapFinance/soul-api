'use strict';
const {web3Factory} = require("../../utils/web3");
const { CHAIN_ID, RUBIC_ROUTER_ADDRESS } = require("../../constants");

const web3 = web3Factory( CHAIN_ID );

const RubicRouterABI = require('../../abis/RubicRouterABI.json');
const RubicContract = new web3.eth.Contract(RubicRouterABI, RUBIC_ROUTER_ADDRESS);

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

async function aggregatorInfo(ctx) {
    ctx.body = (await getAggregatorInfo(ctx))
}

module.exports = { aggregatorInfo };
