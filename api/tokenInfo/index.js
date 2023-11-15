const fetch = require('node-fetch')

const ID_FROM_SYMBOL = {
    ['btc']: 'bitcoin',
    ['eth']: 'ethereum',
    ['ftm']: 'fantom',
    ['arb']: 'arbitrum',
    ['crv']: 'curve-dao-token',
    ['nexo']: 'nexo',
    ['usdc']: 'usd-coin',
    ['usdt']: 'tether',
    ['dai']: 'dai',
    ['frax']: 'frax',
    ['bnb']: 'binancecoin',
}

const DATA_FROM_SYMBOL = {
    ['btc']: {
        "name": 'bitcoin',
        "symbol": 'btc',
        "logo": 'https://raw.githubusercontent.com/soulswapfinance/assets/master/logos/btc.png',
    }

    // ['eth']: 'ethereum',
    // ['ftm']: 'fantom',
    // ['arb']: 'arbitrum',
    // ['crv']: 'curve-dao-token',
    // ['nexo']: 'nexo',
    // ['usdc']: 'usd-coin',
    // ['usdt']: 'tether',
    // ['dai']: 'dai',
    // ['frax']: 'frax',
    // ['bnb']: 'binancecoin',
}

const SYMBOL_FROM_TOKEN_SYMBOL = {
    ['default']: 'default',
    ['soul']: 'soul',
    ['link']: 'link',

     // Bitcoin //
     ['btc']: 'btc',
     ['wbtc']: 'btc',
     ['wbtc.e']: 'btc',
     ['btc.b']: 'btc',
     ['btcb']: 'btc',
     ['axlwbtc']: 'btc',
     ['lzbtc']: 'btc',

     // Stablecoins //
    ['usdc']: 'usdc',
    ['usdc.e']: 'usdc',
    ['axlusdc']: 'usdc',
    ['lzusdc']: 'usdc',

    ['usdt']: 'usdt',
    ['usdt.e']: 'usdt',
    ['axlusdt']: 'usdt',
    ['lzusdt']: 'usdt',

    ['dai']: 'dai',
    ['axldai']: 'dai',
    ['lzdai']: 'dai',
    ['dai.e']: 'dai',

    ['mim']: 'mim',
    ['frax']: 'frax',
    ['frax.e']: 'frax',
    ['axlFrax']: 'frax',
    ['lzFrax']: 'frax',

    // Ethereum //
    ['eth']: 'eth',
    ['weth']: 'eth',
    ['axleth']: 'eth',
    ['lzeth']: 'eth',
    ['weth.e']: 'eth',
    ['steth']: 'eth',

    // Cardano //
    ['ada']: 'ada',
    
    // Binance //
    ['bnb']: 'bnb',
    ['wbnb']: 'bnb',
    ['wbnb.e']: 'bnb',
    
    // Solana //
    ['sol']: 'sol',
    ['wsol']: 'sol',
    
    // Polkadot //
    ['dot']: 'dot',
    
    // Fantom //
    ['ftm']: 'ftm',
    ['wftm']: 'ftm',
    
    // Avalanche //
    ['avax']: 'avax',
    ['wavax']: 'avax',

    // Arbitrum //
    ['arb']: 'arb',
}

const SLUG_FROM_SYMBOL = {
    ['default']: '',

    ['soul']: 'soul-swap',
    ['soulswap']: 'soul-swap',

    /*/ TOP 100 TOKENS /*/
    ['btc']: ID_FROM_SYMBOL['btc'],
    ['usdc']: ID_FROM_SYMBOL['usdc'],
    ['usdt']: ID_FROM_SYMBOL['usdt'],
    ['dai']: ID_FROM_SYMBOL['dai'],
    ['mim']: 'magic-internet-money',
    ['frax']: ID_FROM_SYMBOL['frax'],
    ['eth']: ID_FROM_SYMBOL['eth'],
    ['ada']: 'cardano',
    ['bnb']: ID_FROM_SYMBOL['bnb'],
    ['sol']: 'solana',
    ['dot']: 'polkadot',
    ['ftm']: ID_FROM_SYMBOL['ftm'],
    ['avax']: 'avalanche-2',
    ['arb']: ID_FROM_SYMBOL['arb']
}

async function getTokenLogo(tokenSymbol) {
    const symbol = SYMBOL_FROM_TOKEN_SYMBOL[tokenSymbol] ?? SYMBOL_FROM_TOKEN_SYMBOL['default']
    const tokenLogo = `https://raw.githubusercontent.com/soulswapfinance/assets/master/logos/${symbol}.png`
    return tokenLogo
}

async function getTokenPrice(tokenSymbol) {    
    const symbol = SYMBOL_FROM_TOKEN_SYMBOL[tokenSymbol] ?? SYMBOL_FROM_TOKEN_SYMBOL['default']
    const tokenSlug = SLUG_FROM_SYMBOL[symbol] ?? SLUG_FROM_SYMBOL['default']
    if (tokenSlug != '') {
        let response =
        await fetch(`https://api.coingecko.com/api/v3/coins/${tokenSlug}`, {
            method: 'GET'
        })
        const data = await response.json()
        const tokenPrice = await data.market_data.current_price.usd.toString()
        return tokenPrice
    } else {
        return 0
    }
}

async function getPrice(ctx) {
    let tokenSymbol;
    if (!("symbol" in ctx.params))
        ctx.body = "0"
    else {
        try {
            tokenSymbol = ctx.params.symbol.toLowerCase()

            ctx.body = (await getTokenPrice(tokenSymbol)).toString()

        } catch (e) {
            ctx.body = e.toString()
        }
    }
}

async function getLogo(ctx) {
    let tokenSymbol;
    if (!("symbol" in ctx.params))
        ctx.body = "0"
    else {
        try {
            tokenSymbol = ctx.params.symbol.toLowerCase()

            ctx.body = (await getTokenLogo(tokenSymbol)).toString()

        } catch (e) {
            ctx.body = e.toString()
        }
    }
}

async function getTokenInfo(ctx) {
    const tokenSymbol = ctx.params.symbol.toLowerCase()
    const symbol = SYMBOL_FROM_TOKEN_SYMBOL[tokenSymbol] ?? SYMBOL_FROM_TOKEN_SYMBOL['default']
    const logo = await getTokenLogo(symbol)
    const price = await getTokenPrice(symbol)

    if (!("symbol" in ctx.params))
        return {"name": "TokenInfo"};
    else {
        return {
            "symbol": symbol,
            "logo": logo,
            "price": price,
        }
    }
}

async function tokenPrice(ctx) {
    await getPrice(ctx)
}

async function tokenLogo(ctx) {
    await getLogo(ctx)
}

async function tokenInfo(ctx) {
    ctx.body = (await getTokenInfo(ctx))
}

module.exports = { tokenLogo, tokenPrice, tokenInfo };