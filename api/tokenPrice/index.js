const BN = require('bn.js');
const fetch = require('node-fetch');

async function getPrice(tokenSymbol) {
    const eligibleSymbols = [
        'soul', 'soulswap',
    ]

    const stableCoins = [
        'usdc'
    ]

    const SLUG_FROM_SYMBOL = {
        ['default']: '',

        ['soul']: 'soul-swap',
        ['soulswap']: 'soul-swap',

        // NETWORK TOKENS //
        ['eth']: 'ethereum',
        ['weth']: 'ethereum',
        ['weth.e']: 'ethereum',

        ['btc']: 'bitcoin',
        ['wbtc']: 'bitcoin',
        ['axlbtc']: 'bitcoin'
    }



    // const isDefault = !eligibleSymbols.includes(tokenSymbol)
    const isStablecoin = stableCoins.includes(tokenSymbol)
    // const symbol = isDefault ? 'default' : tokenSymbol
    const symbol = tokenSymbol

    // console.log('isDefault: %s', isDefault)

    const tokenSlug = SLUG_FROM_SYMBOL[symbol] ?? SLUG_FROM_SYMBOL['default']
    if (tokenSlug != '') {
        let response =
            await fetch(`https://api.coingecko.com/api/v3/coins/${tokenSlug.toLowerCase()}`, {
                method: 'GET'
            })
        const data = await response.json() ?? { market_data: { current_price: { usd: 0 } } }
        const tokenPrice =
            isStablecoin ? '1'
                : await data.market_data.current_price.usd.toString()
        return tokenPrice
    } else {
        return 0
    }
}

async function logics(ctx) {
    let tokenSymbol;
    if (!("symbol" in ctx.params))
        ctx.body = "0"
    else {
        try {
            tokenSymbol = ctx.params.symbol.toLowerCase()

            ctx.body = (await getPrice(tokenSymbol)).toString()

        } catch (e) {
            ctx.body = e.toString()
        }
    }
}
async function tokenPrice(ctx) {
    await logics(ctx)
}

module.exports = { tokenPrice };