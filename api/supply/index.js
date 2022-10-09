'use strict';

const {web3Factory} = require("../../utils/web3");
const SoulContractABI = require('../../abis/SoulContractABI.json');
const {_1E18, CHAIN_ID, SOUL, SOUL_DAO, NATIVE_SOUL } = require("../../constants");
const BN = require('bn.js');

const web3 = web3Factory(CHAIN_ID);
const soulContract = new web3.eth.Contract(SoulContractABI, SOUL);
const MAX_SUPPLY = 250_000_000 * 10**18

class Cache {
    minElapsedTimeInMs = 10000; // 10 seconds

    constructor() {
        this.cachedCirculatingSupply = undefined
        this.cachedMaxSupply = undefined
        this.cachedTotalSupply = undefined
    }

    async getTotalSupply() {
        if (!this.cachedTotalSupply ||
            this.cachedTotalSupply.lastRequestTimestamp + this.minElapsedTimeInMs < Date.now() // check if supply needs to be updated
        ) {
            const totalSupply = new BN(await soulContract.methods.totalSupply().call());
            const lastRequestTimestamp = Date.now();
            this.cachedTotalSupply = {totalSupply, lastRequestTimestamp}
        }

        return this.cachedTotalSupply.totalSupply
    }

    async getMaxSupply() {
        if (!this.cachedMaxSupply) {
            const maxSupply = MAX_SUPPLY;
            const lastRequestTimestamp = Date.now();
            this.cachedMaxSupply = {maxSupply, lastRequestTimestamp}
        }
        return this.cachedMaxSupply.maxSupply
    }

        async getCirculatingSupply() {
        if (!this.cachedCirculatingSupply ||
            this.cachedCirculatingSupply.lastRequestTimestamp + this.minElapsedTimeInMs < Date.now() // check if supply needs to be updated
        ) {
            const results = await Promise.all([
                this.getTotalSupply(),          // total supply [0]
                getBalanceOf(SOUL_SUMMONER),    // SoulSummoner [1]
                getBalanceOf(SEANCE),           // SeanceCircle [2]
                getBalanceOf(SOUL_DAO),         // DAO [3]
                getBalanceOf(NATIVE_SOUL),      // NATIVE-SOUL [4]
            ])

            // TOTAL SUPPLY - STAKING REWARDS (SEANCE) - DAO RESERVES - EXCHANGE LIQUIDITY
            const circulatingSupply = new BN(results[0]).sub(new BN(results[1])).sub(new BN(results[2])).sub(new BN(results[3])).sub(new BN(results[4]))

            const lastRequestTimestamp = Date.now();
            this.cachedCirculatingSupply = {circulatingSupply, lastRequestTimestamp}
        }
        return this.cachedCirculatingSupply.circulatingSupply
    }
}

async function getBalanceOf(address) {
    return await soulContract.methods.balanceOf(address).call();
}

async function circulatingSupply(ctx) {
    ctx.body = (await cache.getCirculatingSupply()).toString();
}

async function circulatingSupplyAdjusted(ctx) {
    ctx.body = ((await cache.getCirculatingSupply()).div(_1E18)).toString();
}

async function totalSupply(ctx) {
    ctx.body = (await cache.getTotalSupply()).toString();
}

async function totalSupplyAdjusted(ctx) {
    ctx.body = ((await cache.getTotalSupply()).div(_1E18)).toString();
}

async function maxSupply(ctx) {
    ctx.body = (await cache.getMaxSupply()).toString();
}

const cache = new Cache()
module.exports = { circulatingSupply, circulatingSupplyAdjusted, totalSupply, totalSupplyAdjusted, maxSupply };
