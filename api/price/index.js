'use strict';
const {web3Factory} = require("../../utils/web3");
const { CHAIN_ID, FACTORY_ADDRESS, NATIVE_USDC, ZERO_ADDRESS, NATIVE_DAI, USDC_ADDRESS, DAI_ADDRESS, WNATIVE_ADDRESS } = require("../../constants");
const web3 = web3Factory(CHAIN_ID);
const BN = require('bn.js');
const tokenList = require('../../utils/tokenList.json')

// abis
const ERC20ContractABI = require('../../abis/ERC20ContractABI.json');
const FactoryContractABI = require('../../abis/FactoryContractABI.json');
const ChainlinkOracleABI = require('../../abis/ChainlinkOracleABI.json');

// contracts
const FactoryContract = new web3.eth.Contract(FactoryContractABI, FACTORY_ADDRESS)

// constants
const E18 = new BN("10").pow(new BN("18"))
const EIGHTEEN = new BN("18")
const TWO = new BN("2")

class Cache {
    minElapsedTimeInMs = 60000; // 60 seconds

    constructor() {
        this.pair = {}
        this.decimals = {}
        this.contract = {}
        this.cachedPrice = {}
    }

    async getPair(tokenAddress) {
        if (tokenAddress in this.pair) {
            return this.pair[tokenAddress]
        }

        const pairAddress = await getPairAddress(tokenAddress)

        if (pairAddress === ZERO_ADDRESS) {
            return pairAddress
        }

        this.pair[tokenAddress] = pairAddress
        return pairAddress
    }

    async getDecimals(tokenAddress) {
        if (tokenAddress in this.decimals) {
            return this.decimals[tokenAddress]
        }

        const decimals = await this.getContract(tokenAddress).methods.decimals().call()

        this.decimals[tokenAddress] = decimals
        return decimals
    }

    getContract(tokenAddress) {
        if (tokenAddress in this.contract) {
            return this.contract[tokenAddress]
        }

        const tokenContract = getContractAsERC20(tokenAddress)
        this.contract[tokenAddress] = tokenContract
        return tokenContract
    }

    async getNativePrice() {
        if (WNATIVE_ADDRESS in this.cachedPrice) {
            if (this.cachedPrice[WNATIVE_ADDRESS].lastRequestTimestamp + this.minElapsedTimeInMs > Date.now()) {
                return this.cachedPrice[WNATIVE_ADDRESS].lastResult
            }
        }

        const result = await Promise.all([
            getReserves(WNATIVE_ADDRESS, USDC_ADDRESS, NATIVE_USDC),
            getReserves(WNATIVE_ADDRESS, DAI_ADDRESS, NATIVE_DAI),
        ])

        // reserveToken0 == WNATIVE, reserveToken1 == USDC
        const priceUSDC = result[0].reserveToken0.mul(E18).div(result[0].reserveToken1)

        // reserveToken0 == WNATIVE, reserveToken1 == DAI
        const priceDAI = result[1].reserveToken0.mul(E18).div(result[1].reserveToken1)

        const nativePrice = priceUSDC.add(priceDAI).div(TWO)

        const lastRequestTimestamp = Date.now()
        const lastResult = nativePrice
        this.cachedPrice[WNATIVE_ADDRESS] = {lastRequestTimestamp, lastResult}

        return nativePrice
    }

    async getPrice(tokenAddress, derived) {
        if (!(tokenAddress in this.cachedPrice) ||
            this.cachedPrice[tokenAddress].lastRequestTimestamp + this.minElapsedTimeInMs < Date.now() // check if price needs to be updated
        ) {
            const pairAddress = await cache.getPair(tokenAddress)

            if (pairAddress === ZERO_ADDRESS) {
                throw 'Error: Given address "' + tokenAddress + '" isn\'t paired with WNATIVE on SoulSwap.'
            }

            const reserves = derived ?
                await Promise.all([
                    getReserves(WNATIVE_ADDRESS, tokenAddress, pairAddress)
                ]) : await Promise.all([
                    getReserves(WNATIVE_ADDRESS, tokenAddress, pairAddress),
                    this.getNativePrice()
                ])
            const price = reserves[0].reserveToken0.mul(E18).div(reserves[0].reserveToken1)

            const lastRequestTimestamp = Date.now()
            const lastResult = price
            this.cachedPrice[tokenAddress] = {lastRequestTimestamp, lastResult}
        } else if (!(WNATIVE_ADDRESS in this.cachedPrice) ||
            this.cachedPrice[WNATIVE_ADDRESS].lastRequestTimestamp + this.minElapsedTimeInMs < Date.now()) // check if price needs to be updated)
        {
            await this.getNativePrice()
        }

        return derived ?
            this.cachedPrice[tokenAddress].lastResult :
            this.cachedPrice[WNATIVE_ADDRESS].lastResult.mul(this.cachedPrice[tokenAddress].lastResult).div(E18)
    }
}

function getContractAsERC20(tokenAddress) {
    return new web3.eth.Contract(ERC20ContractABI, tokenAddress)
}

async function getReserves(token0Address, token1Address, pairAddress) {
    const results = await Promise.all([
        cache.getDecimals(token0Address),
        cache.getDecimals(token1Address),
        cache.getContract(token0Address).methods.balanceOf(pairAddress).call(),
        cache.getContract(token1Address).methods.balanceOf(pairAddress).call()
    ])
    const reserveToken0 = new BN(results[2]).mul(get10PowN(EIGHTEEN.sub(new BN(results[0]))))
    const reserveToken1 = new BN(results[3]).mul(get10PowN(EIGHTEEN.sub(new BN(results[1]))))

    return {reserveToken0, reserveToken1}
}

function get10PowN(n) {
    return new BN("10").pow(new BN(n.toString()))
}

async function getPrice(tokenAddress, derived) {
    if (tokenAddress === WNATIVE_ADDRESS) {
        return await cache.getNativePrice()
    }

    return await cache.getPrice(tokenAddress, derived)
}

async function getPairAddress(tokenAddress) {
    return (
        tokenAddress ?
            (tokenAddress > WNATIVE_ADDRESS) ?
                await FactoryContract.methods.getPair(tokenAddress, WNATIVE_ADDRESS).call() :
                await FactoryContract.methods.getPair(WNATIVE_ADDRESS, tokenAddress).call()
            : undefined
    )
}

async function logics(ctx, derived) {
    let tokenAddress;
    if (!("tokenAddress" in ctx.params))
        ctx.body = ""
    else {
        try {
            if (ctx.params.tokenAddress in tokenList) {
                tokenAddress = tokenList[ctx.params.tokenAddress]
            } else {
                tokenAddress = web3.utils.toChecksumAddress(ctx.params.tokenAddress)
            }

            derived ?
                tokenAddress === WNATIVE_ADDRESS ?
                    ctx.body = E18.toString() :
                    ctx.body = (await getPrice(tokenAddress, derived)).toString() :
                ctx.body = (await getPrice(tokenAddress, derived)).toString()

        } catch (e) {
            ctx.body = e.toString()
        }
    }
}

async function priceOfToken(ctx) {
    await logics(ctx, false)
}

async function derivedPriceOfToken(ctx) {
    await logics(ctx, true)
}

const cache = new Cache()
module.exports = { priceOfToken, derivedPriceOfToken };
