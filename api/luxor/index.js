'use strict';

const {web3Factory} = require("../../utils/web3");
const { FTM_CHAIN_ID } = require("../../constants");
const web3 = web3Factory(FTM_CHAIN_ID);

const StakeHelperABI = require('../../abis/StakeHelperABI.json');
// const { FTM_CHAIN_ID } = require("../../constants");
const LuxorAddress = "0x6671E20b83Ba463F270c8c75dAe57e3Cc246cB2b";
const LuxorStakeHelperAddress = "0x2Dd0D30f525e65641962904470660507e80940e4";
const ERC20ContractABI = require('../../abis/ERC20ContractABI.json');

const LuxorContract = new web3.eth.Contract(ERC20ContractABI, LuxorAddress);
const LuxorStakeHelperContract = new web3.eth.Contract(StakeHelperABI, LuxorStakeHelperAddress);
const BN = require('bn.js');

class Cache {
    minElapsedTimeInMs = 10000; // 10 seconds

    constructor() {
        // this.cachedTotalSupply = {}
        // this.cachedWarmupPeriod = {}
    }

    async getTotalLuxorSupply() {
        if (!this.cachedTotalSupply ||
            this.cachedTotalSupply.lastRequestTimestamp + this.minElapsedTimeInMs < Date.now() // check if supply needs to be updated
        ) {
            const totalSupply = new BN(await LuxorContract.methods.totalSupply().call());
            const lastRequestTimestamp = Date.now();
            this.cachedTotalSupply = {totalSupply, lastRequestTimestamp}
        }

        return this.cachedTotalSupply.totalSupply
    }

    async getWarmupPeriod() {
        if (!this.cachedWarmupPeriod ||
            this.cachedWarmupPeriod.lastRequestTimestamp + this.minElapsedTimeInMs < Date.now() // check if supply needs to be updated
        ) {
            const warmupPeriod = new BN(await LuxorStakeHelperContract.methods.warmupPeriod().call());
            const lastRequestTimestamp = Date.now();
            this.cachedWarmupPeriod = {warmupPeriod, lastRequestTimestamp}
        }

        return this.cachedWarmupPeriod.warmupPeriod
    }
    
    async getEpoch() {
        if (!this.cachedEpoch ||
            this.cachedEpoch.lastRequestTimestamp + this.minElapsedTimeInMs < Date.now() // check if supply needs to be updated
        ) {
            const epoch = new BN(await LuxorStakeHelperContract.methods.epoch().call());
            const lastRequestTimestamp = Date.now();
            this.cachedEpoch = {epoch, lastRequestTimestamp}
        }

        return this.cachedEpoch.epoch
    }

    // async reloadWarmupInfo(userAddress) {
    //     if (!this.cachedTotal ||
    //         this.cachedTotal.lastRequestTimestamp + this.minElapsedTimeInMs < Date.now() // check if supply needs to be updated
    //     ) {
    //         userAddress = web3.utils.toChecksumAddress(ctx.params.userAddress)
    //         const result = await LuxorContract.methods.warmupInfo(userAddress).call();
    //         const lastRequestTimestamp = Date.now();
    //         this.cachedTotal = {deposit: result[0], gons: result[1], expiry: result[2], lock: result[3], lastRequestTimestamp}
    //     }
    // }

}

async function totalLuxorSupply(ctx) {
    ctx.body = (await cache.getTotalLuxorSupply()).toString();
}

async function warmupPeriod(ctx) {
    ctx.body = (await cache.getWarmupPeriod()).toString();
}

async function epoch(ctx) {
    ctx.body = (await cache.getEpoch()).toString();
}

const cache = new Cache()
module.exports = { totalLuxorSupply, warmupPeriod, epoch };
