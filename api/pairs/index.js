'use strict';
const {web3Factory} = require("../../utils/web3");
const { FTM_CHAIN_ID, LUXOR_TREASURY_ADDRESS } = require("../../constants");

const web3 = web3Factory( FTM_CHAIN_ID );
const PairContractABI = require('../../abis/PairContractABI.json');
const BN = require('bn.js');

async function getPairInfo(ctx) {
    const pairAddress = web3.utils.toChecksumAddress(ctx.params.id);
    const PairContract = new web3.eth.Contract(PairContractABI, pairAddress);
    const treasuryAddress = LUXOR_TREASURY_ADDRESS;
    // METHOD CALLS //
    const totalSupply = await PairContract.methods.totalSupply().call();
    const luxorTreasuryBalance = await PairContract.methods.balanceOf(treasuryAddress).call();

    if (!("id" in ctx.params))
        return {"name": "Pairs"};
    else {
        return {
            "address": pairAddress,
            "supply": totalSupply,
            "luxorTreasuryBalance": luxorTreasuryBalance,
            "api": `https://api.soulswap.finance/info/tokens/${pairAddress}`,
        }
    }
}

async function pairInfo(ctx) {
    ctx.body = (await getPairInfo(ctx))
}

module.exports = {pairInfo};
