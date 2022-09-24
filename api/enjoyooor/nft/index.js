'use strict';

const {web3Factory} = require("../../../utils/web3");
const { CHAIN_ID } = require("../../../constants");
const web3 = web3Factory(CHAIN_ID);
const ERC721ContractABI = require('../../../abis/ERC721ContractABI.json');

async function getItemInfo(ctx) {
    const collectionAddress = ctx.params.collection
    const item = ctx.params.id
    const CollectionContract = new web3.eth.Contract(ERC721ContractABI, collectionAddress);

    // METHOD CALLS //
    const totalSupply = await CollectionContract.methods.totalSupply().call();
    const ipfsUrl = await CollectionContract.methods.tokenURI(item).call();
    const owner = await CollectionContract.methods.ownerOf(item).call();
    // const walletOfOwner 
    //     = await CollectionContract.methods.walletOfOwner(owner) != null
    //         ? await CollectionContract.methods.walletOfOwner(owner).call()
    //         : 'unknown';
    
        return {
            "collection": collectionAddress,
            "id": item,
            "supply": totalSupply,
            "owner": owner,
            // "ownerNfts": walletOfOwner,
            "api": `https://api.soulswap.finance/enjoyooor/nft/${collectionAddress}/${item}`,
            "name": `ID: ${item}`,
            "ipfsUrl": ipfsUrl
        }
}

async function getCollectionInfo(ctx) {
    const collectionAddress = ctx.params.collection
    const CollectionContract = new web3.eth.Contract(ERC721ContractABI, collectionAddress);

    // METHOD CALLS //
    const totalSupply = await CollectionContract.methods.totalSupply().call();
    const owner = await CollectionContract.methods.owner().call();
    const name = await CollectionContract.methods.name().call();
    const symbol = await CollectionContract.methods.symbol().call();
    // const maxSupply 
    //     = await CollectionContract.methods.maxSupply()?.call() != null 
    //         ? await CollectionContract.methods.maxSupply().call() 
    //         : 0;

    if (!("collection" in ctx.params))
        return {"name": "Enjoyooor NFT"};
    else {
        return {
            "collection": collectionAddress,
            "name": name,
            "symbol": symbol,
            "owner": owner,
            "supply": totalSupply,
            // "maxSupply": maxSupply,
            "api": `https://api.soulswap.finance/enjoyooor/nft/${collectionAddress}`,
        }
    }
}

// async function getEnumerableIndexInfo(ctx) {

//     const collectionAddress = ctx.params.collection
//     const index = ctx.params.index
//     const CollectionContract = new web3.eth.Contract(ERC721ContractABI, collectionAddress);

//     // METHOD CALLS //
//     const totalSupply = await CollectionContract.methods.totalSupply().call();
//     const collectionOwner = await CollectionContract.methods.owner().call();
//     const name = await CollectionContract.methods.name().call();
//     const symbol = await CollectionContract.methods.symbol().call();    
//     const tokenByIndex = await CollectionContract.methods.tokenByIndex(index).call();    

//     if (!("id" in ctx.params))
//         return {"name": "Enjoyooor NFT"};
//     else {
//         return {
//             "collection": collectionAddress,
//             "name": name,
//             "symbol": symbol,
//             "collectionOwner": collectionOwner,
//             "id": tokenByIndex,
//             "supply": totalSupply,
//             "api": `https://api.soulswap.finance/enjoyoor/nft/${collection}`,
//             "name": "NFT Collection"
//         }
//     }
// }


async function itemInfo(ctx) {
    ctx.body = (await getItemInfo(ctx))
}

async function collectionInfo(ctx) {
    ctx.body = (await getCollectionInfo(ctx))
}

module.exports = { itemInfo, collectionInfo }