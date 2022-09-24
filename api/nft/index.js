'use strict';

const { web3Factory } = require("../../utils/web3");
const { _1E18, CHAIN_ID, POP_NFT } = require("../../constants");
const BN = require('bn.js');
const web3 = web3Factory(CHAIN_ID);
const PopContractABI = require('../../abis/PopContractABI.json');
const PopContract = new web3.eth.Contract(PopContractABI, POP_NFT);

class Cache {
    minElapsedTimeInMs = 10000; // 10 seconds

    constructor() {
        this.cachedCirculatingSupply = undefined
        this.cachedMaxSupply = undefined
        this.cachedTotalSupply = undefined
    }

    async getSupply() {
        if (!this.cachedTotalSupply ||
            this.cachedTotalSupply.lastRequestTimestamp + this.minElapsedTimeInMs < Date.now() // check if supply needs to be updated
        ) {
            // const totalSupply = new BN(await PopContract.methods.maxSupply().call());
            const totalSupply = new BN(await PopContract.methods.totalSupply().call());
            const lastRequestTimestamp = Date.now();
            this.cachedTotalSupply = {totalSupply, lastRequestTimestamp}
        }

        return this.cachedTotalSupply.totalSupply
    }

    async getMaxSupply() {
        if (!this.cachedMaxSupply) {
            const maxSupply = 3333 * _1E18
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
                this.getSupply(), // total supply [0]
                getBalanceOf(POP_NFT),  // minted [1]
            ])

        
            const circulatingSupply = new BN(results[0])

            const lastRequestTimestamp = Date.now();
            this.cachedCirculatingSupply = {circulatingSupply, lastRequestTimestamp}
        }
        return this.cachedCirculatingSupply.circulatingSupply
    }
}

async function getBalanceOf(address) {
    return await PopContract.methods.balanceOf(address).call();
}

async function circulatingSupply(ctx) {
    ctx.body = (await cache.getCirculatingSupply()).toString();
}

async function totalSupply(ctx) {
    ctx.body = (await cache.getSupply()).toString();
}

async function maxSupply(ctx) {
    ctx.body = (await cache.getMaxSupply()).toString();
}

const cache = new Cache()
module.exports = { circulatingSupply, totalSupply, maxSupply };
