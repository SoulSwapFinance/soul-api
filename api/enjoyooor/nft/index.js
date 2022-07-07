'use strict';

const {web3Factory} = require("../../utils/web3");
const { FTM_CHAIN_ID } = require("../../constants");
const web3 = web3Factory(FTM_CHAIN_ID);
const ERC721ContractABI = require('../../abis/ERC721ContractABI.json');

const BN = require('bn.js');

async function getItemInfo(ctx) {
    const collectionAddress = ctx.params.collection
    const item = ctx.params.id
    const CollectionContract = new web3.eth.Contract(ERC721ContractABI, collectionAddress);

    // METHOD CALLS //
    const totalSupply = await CollectionContract.methods.totalSupply().call();
    
    const ipfsUrl = await CollectionContract.methods.tokenURI(item).call();
    
    const owner = await CollectionContract.methods.ownerOf(item).call();
    
    if (!("id" in ctx.params))
        return {"name": "Enjoyooor NFT"};
    else {
        return {
            "collection": collectionAddress,
            "id": item,
            "external_url": 'https://api.soulswap.finance/enjoyoor/nft/${collection}/${item}',
            "name": 'ID: ${item}',
            "image": ipfsUrl
        }
    }
}

aync function getCollectionInfo(ctx) {
    if (!("id" in ctx.params))
        return {"name": "Enjoyooor NFT"};
    else {
        return {
            "collection": ctx.params.collection,
            "external_url": 'https://api.soulswap.finance/enjoyoor/nft/${collection}',
            "name": "NFT Collection"
        }
    }
}

function itemInfo(ctx) {
    ctx.body = getItemInfo(ctx)
}

function collectionInfo(ctx) {
    ctx.body = getCollectionInfo(ctx) 
}

module.exports = { itemInfo, collectionInfo }