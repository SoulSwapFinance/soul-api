'use strict';
const {web3Factory} = require("../../utils/web3");
const { FTM_CHAIN_ID } = require("../../constants");
const web3 = web3Factory(FTM_CHAIN_ID);
const BN = require('bn.js');
const tokenList = require('../../utils/tokenList.json')

// abis
const ERC20ContractABI = require('../../abis/ERC20ContractABI.json');
const FactoryContractABI = require('../../abis/FactoryContractABI.json');

// contracts address
const FACTORY_ADDRESS = "0x1120e150dA9def6Fe930f4fEDeD18ef57c0CA7eF"

// tokens address
const WFTM_ADDRESS = "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83"
const USDC_ADDRESS = "0x04068da6c83afcfa0e13ba15a6696662335d5b75"
const USDT_ADDRESS = "0x049d68029688eabf473097a2fc38ef61633a3c7a"

// pairs address
const WFTM_USDT_ADDRESS = "0xdC24814AD654986928F8E4aec48D37fa30bBC5BB"
const WFTM_USDC_ADDRESS = "0x160653F02b6597E7Db00BA8cA826cf43D2f39556"

// contracts
const FactoryContract = new web3.eth.Contract(FactoryContractABI, FACTORY_ADDRESS)

// constants
const E18 = new BN("10").pow(new BN("18"))
const EIGHTEEN = new BN("18")
const TWO = new BN("2")
const zeroAddress = "0x0000000000000000000000000000000000000000"


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

        if (pairAddress === zeroAddress) {
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

    async getFtmPrice() {
        if (WFTM_ADDRESS in this.cachedPrice) {
            if (this.cachedPrice[WFTM_ADDRESS].lastRequestTimestamp + this.minElapsedTimeInMs > Date.now()) {
                return this.cachedPrice[WFTM_ADDRESS].lastResult
            }
        }

        const result = await Promise.all([
            getReserves(WFTM_ADDRESS, USDC_ADDRESS, WFTM_USDC_ADDRESS),
            getReserves(WFTM_ADDRESS, USDT_ADDRESS, WFTM_USDT_ADDRESS)
        ])

        const priceUSDC = result[0].reserveToken1.mul(E18).div(result[0].reserveToken0)
        const priceUSDT = result[1].reserveToken1.mul(E18).div(result[1].reserveToken0)

        const ftmPrice = priceUSDC.add(priceUSDT).div(TWO)

        const lastRequestTimestamp = Date.now()
        const lastResult = ftmPrice
        this.cachedPrice[WFTM_ADDRESS] = {lastRequestTimestamp, lastResult}

        return ftmPrice
    }

    async getPrice(tokenAddress, derived) {
        if (!(tokenAddress in this.cachedPrice) ||
            this.cachedPrice[tokenAddress].lastRequestTimestamp + this.minElapsedTimeInMs < Date.now() // check if price needs to be updated
        ) {
            const pairAddress = await cache.getPair(tokenAddress)

            if (pairAddress === zeroAddress) {
                throw 'Error: Given address "' + tokenAddress + '" isn\'t paired with WFTM on SoulSwap.'
            }

            const reserves = derived ?
                await Promise.all([
                    getReserves(WFTM_ADDRESS, tokenAddress, pairAddress)
                ]) : await Promise.all([
                    getReserves(WFTM_ADDRESS, tokenAddress, pairAddress),
                    this.getFtmPrice()
                ])
            const price = reserves[0].reserveToken0.mul(E18).div(reserves[0].reserveToken1)

            const lastRequestTimestamp = Date.now()
            const lastResult = price
            this.cachedPrice[tokenAddress] = {lastRequestTimestamp, lastResult}
        } else if (!(WFTM_ADDRESS in this.cachedPrice) ||
            this.cachedPrice[WFTM_ADDRESS].lastRequestTimestamp + this.minElapsedTimeInMs < Date.now()) // check if price needs to be updated)
        {
            await this.getFtmPrice()
        }


        return derived ?
            this.cachedPrice[tokenAddress].lastResult :
            this.cachedPrice[WFTM_ADDRESS].lastResult.mul(this.cachedPrice[tokenAddress].lastResult).div(E18)
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
    if (tokenAddress === WFTM_ADDRESS) {
        return await cache.getFtmPrice()
    }

    return await cache.getPrice(tokenAddress, derived)
}


async function getPairAddress(tokenAddress) {
    return (
        tokenAddress ?
            (tokenAddress > WFTM_ADDRESS) ?
                await FactoryContract.methods.getPair(tokenAddress, WFTM_ADDRESS).call() :
                await FactoryContract.methods.getPair(WFTM_ADDRESS, tokenAddress).call()
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
                tokenAddress === WFTM_ADDRESS ?
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
