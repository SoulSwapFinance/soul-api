'use strict';

function getInfos(ctx) {
    if (!("id" in ctx.params))
        return {"name": "Spider NFT"};
    else {
        return {
            "id": ctx.params.id,
            "external_url": "https://api.soulswap.finance/nft/spider/" + ctx.params.id,
            "name": "Spider NFT #" + ctx.params.id,
            "description": "Redeemed a real SPIDER and burned 1 $SPIDER",
            "image": "https://ipfs.io/ipfs/"
        }
    }
}

function infos(ctx) {
    ctx.body = getInfos(ctx)
}

module.exports = {infos};
