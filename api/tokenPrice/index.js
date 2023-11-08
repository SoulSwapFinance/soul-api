const fetch = require('node-fetch')

// const getId = () =>{
//     return 
// }

async function getPrice(tokenSymbol) {
    const eligibleSymbols = [
        'soul', 'soulswap',
    ]

    const btcId = 'bitcoin'
    const ethId = 'ethereum'
    const ftmId = 'ethereum'
    const arbId = 'arbitrum'
    const crvId = 'curve-dao-token'
    const nexoId = 'nexo'

    const stableCoins = [
        'usdc', 'axlusdc', 'lzusdc', 'usdc.e',
        'dai', 'axldai', 'lzdai', 'dai.e',
        'usdt', 'usdt.e', 'lzusdt', 'axlusdt',
        'mim', 'frax'
    ]

    const SLUG_FROM_SYMBOL = {
        ['default']: '',

        ['soul']: 'soul-swap',
        ['soulswap']: 'soul-swap',

        /*/ TOP 100 TOKENS /*/
        // Bitcoin //
        ['btc']: btcId,
        ['wbtc']: btcId,
        ['btc.e']: btcId,
        ['btc.b']: btcId,
        ['btcb']: btcId,
        ['axlbtc']: btcId,
        ['lzbtc']: btcId,
        
        // Ethereum //
        ['eth']: ethId,
        ['weth']: ethId,
        ['axleth']: ethId,
        ['lzeth']: ethId,
        ['weth.e']: ethId,
        ['steth']: ethId,
    
        // Cardano //
        ['ada']: 'cardano',
        
        // Binance //
        ['bnb']: 'binancecoin',
        ['wbnb']: 'binancecoin',
        ['wbnb.e']: 'binancecoin',
        
        // Solana //
        ['sol']: 'solana',
        ['wsol']: 'solana',
        
        // Polkadot //
        ['dot']: 'polkadot',
        
        // Fantom //
        ['ftm']: ftmId,
        ['wftm']: ftmId,
        
        // Avalanche //
        ['avax']: 'avalanche-2',
        ['wavax']: 'avalanche-2',

        // Misc. //
        ['arb']: arbId
    }



    // const isDefault = !eligibleSymbols.includes(tokenSymbol)
    const isStablecoin = stableCoins.includes(tokenSymbol)
    // const symbol = isDefault ? 'default' : tokenSymbol

    // console.log('isDefault: %s', isDefault)

    const tokenSlug = SLUG_FROM_SYMBOL[tokenSymbol] ?? SLUG_FROM_SYMBOL['default']
    if (tokenSlug != '') {
        let response =
            await fetch(`https://api.coingecko.com/api/v3/coins/${tokenSlug}`, {
                method: 'GET'
            })
        const data = await response.json()
        const tokenPrice =
            isStablecoin ? '1'
            // @ts-ignore
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