'use strict';
const {web3Factory} = require("../../utils/web3");
const { CHAIN_ID, RUBIC_ROUTER_ADDRESS } = require("../../constants");

const web3 = web3Factory( CHAIN_ID );

const RubicRouterABI = require('../../abis/RubicRouterABI.json');
const RubicContract = new web3.eth.Contract(RubicRouterABI, RUBIC_ROUTER_ADDRESS);

async function getCrossInfo(ctx) {
    const tokenAddress = web3.utils.toChecksumAddress(ctx.params.id);

    const routerAddress = web3.utils.toChecksumAddress(RUBIC_ROUTER_ADDRESS);
    const availableRouters = await RubicContract.methods.getAvailableRouters().call()

    const fixedFee = await RubicContract.methods.fixedCryptoFee().call()
    const cryptoFee = await RubicContract.methods.availableRubicCryptoFee().call()
    const tokenFee = await RubicContract.methods.availableRubicTokenFee(tokenAddress).call()
    
    // MIN // MAX //
    const minAmount = await RubicContract.methods.minTokenAmount(tokenAddress).call()
    const maxAmount = await RubicContract.methods.maxTokenAmount(tokenAddress).call()

    // TODO: MAYBE LATER //
    // NAME: integratorToFeeInfo(tokenAddress)
    // OUTPUT: isIntegrator bool, tokenFee uint32, RubicTokenShare uint32, RubicFixedCryptoShare uint32, fixedFeeAmount uint128


    if (!("id" in ctx.params))
        return {"name": "Crosschain"};
    else {
        return {
            "routerAddress": routerAddress,
            "tokenAddress": tokenAddress,
            "availableRouters": availableRouters,
            "fixedFee": fixedFee,
            "cryptoFee": cryptoFee,
            "tokenFee": tokenFee,
            "maxAmount": maxAmount,
            "minAmount": minAmount,
            "api": `https://api.soulswap.finance/crosschain/${tokenAddress}`,
        }
    }
}

async function crossInfo(ctx) {
    ctx.body = (await getCrossInfo(ctx))
}

module.exports = { crossInfo };
