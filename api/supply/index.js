'use strict';

const {web3Factory} = require("../../utils/web3");
const SoulContractABI = require('../../abis/SoulContractABI.json');
const {_1E18, FTM_CHAIN_ID} = require("../../constants");
const SOUL_ADDRESS = "0xe2fb177009FF39F52C0134E8007FA0e4BaAcBd07";
const BN = require('bn.js');

const web3 = web3Factory(FTM_CHAIN_ID);
const soulContract = new web3.eth.Contract(SoulContractABI, SOUL_ADDRESS);

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
            const maxSupply = 250_000_000 * 10**18;
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
                this.getTotalSupply(), // total supply [0]
                getBalanceOf("0xce6ccbB1EdAD497B4d53d829DF491aF70065AB5B"),    // SoulSummoner [1]
                getBalanceOf("0x124B06C5ce47De7A6e9EFDA71a946717130079E6"),    // SeanceCircle [2]
                getBalanceOf("0x8f1E15cD3d5a0bb85B8189d5c6B61BB64398E19b"),    // SOUL-SEANCE [3]
                getBalanceOf("0x1c63c726926197bd3cb75d86bcfb1daebcd87250"),    // DAO [4]
                getBalanceOf("0xa2527Af9DABf3E3B4979d7E0493b5e2C6e63dC57"),    // FTM-SOUL [5]
                getBalanceOf("0x8d3c3f3f3754Fa6cA088E1991616ca74FCfABFf1")     // EXCHANGE LIQ. [6]
            ])

            // TOTAL SUPPLY - STAKING REWARDS (SEANCE) - DAO RESERVES - EXCHANGE LIQUIDITY
            const circulatingSupply = new BN(results[0]).sub(new BN(results[2])).sub(new BN(results[4])).sub(new BN(results[6]))

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
