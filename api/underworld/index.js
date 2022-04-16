'use strict';
const {web3Factory} = require("../../utils/web3");
const { FTM_CHAIN_ID, MULTICALL_ADDRESS } = require("../../constants");

const web3 = web3Factory( FTM_CHAIN_ID );
const ERC20ContractABI = require('../../abis/ERC20ContractABI.json');
const UnderworldContractABI = require('../../abis/UnderworldContractABI.json');
const PriceFetcherABI = require('../../abis/PriceFetcherABI.json');
const MulticallContractABI = require('../../abis/MulticallContractABI.json');

const fetcherAddress = '0xba5da8aC172a9f014D42837EE1B678C4Ca96fB0E';
const BN = require('bn.js');

async function getPairInfo(ctx) {
    const pairAddress = web3.utils.toChecksumAddress(ctx.params.id);
    const PairContract = new web3.eth.Contract(UnderworldContractABI, pairAddress);
    const PriceFetcherContract = new web3.eth.Contract(PriceFetcherABI, fetcherAddress);

    // METHOD CALLS //
    const totalSupply = await PairContract.methods.totalSupply().call();
    const pairName = await PairContract.methods.name().call();
    const pairSymbol = await PairContract.methods.symbol().call();
    const pairDecimals = await PairContract.methods.decimals().call();
    const exchangeRate = await PairContract.methods.exchangeRate().call();
    const oracle = await PairContract.methods.oracle().call();
    const accrueInfo = await PairContract.methods.accrueInfo().call();
    const interestPerSecond = accrueInfo[0];
    const lastAccrued = accrueInfo[1];
    const feesEarnedFraction = accrueInfo[2];

    // ASSET DETAILS //
    const assetAddress = await PairContract.methods.asset().call();
    const assetAddressCS = web3.utils.toChecksumAddress(assetAddress);
    const AssetContract = new web3.eth.Contract(ERC20ContractABI, assetAddress);
    const assetTicker = await AssetContract.methods.symbol().call();
    const assetDecimals = await AssetContract.methods.decimals().call();
    const assetDivisor = 10**assetDecimals;
    const assetPrice = await PriceFetcherContract.methods.currentTokenUsdcPrice(assetAddress).call() / 1e18;

    const assetCall = await PairContract.methods.totalAsset().call();
    const totalAssetElastic = assetCall[0];
    const totalAssetBase = assetCall[1];

    // COLLATERAL DETAILS //
    const collateralAddress = await PairContract.methods.collateral().call();
    const collateralAddressCS = web3.utils.toChecksumAddress(collateralAddress);
    const CollateralContract = new web3.eth.Contract(ERC20ContractABI, collateralAddress);
    const collateralTicker = await CollateralContract.methods.symbol().call();
    const collateralDecimals = await CollateralContract.methods.decimals().call();
    const collateralDivisor = 10**collateralDecimals;
    const collateralPrice = await PriceFetcherContract.methods.currentTokenUsdcPrice(collateralAddress).call() / 1e18;

    // BORROW DETAILS
    const borrowElastic = await PairContract.methods.totalBorrow().call();
    const totalBorrowElastic = borrowElastic[0];
    const borrowBase = await PairContract.methods.totalBorrow().call();
    const totalBorrowBase = borrowBase[1];
    
 
    if (!("id" in ctx.params))
        return {"name": "Underworld Pairs"};
    else {
        return {
            "address": pairAddress,
            "name": pairName,
            "symbol": pairSymbol,
            "decimals": pairDecimals,
            "supply": totalSupply,
            "exchangeRate": exchangeRate,
            "oracle": oracle,
            "interestPerSecond": interestPerSecond,
            "lastAccrued": lastAccrued,
            "feesEarnedFraction": feesEarnedFraction,

            "assetTicker": assetTicker,
            "assetPrice": assetPrice,
            "assetAddress": assetAddress,
            "assetDecimals": assetDecimals,
            "assetDivisor": assetDivisor,
            "assetLogoURI": `https://raw.githubusercontent.com/soulswapfinance/assets/prod/blockchains/fantom/assets/${assetAddressCS}/logo.png`,            
            
            "assetTotalBase": totalAssetBase,
            "assetTotalElastic": totalAssetElastic,
            
            "collateralTicker": collateralTicker,
            "collateralAddress": collateralAddress,
            "collateralDecimals": collateralDecimals,
            "collateralPrice": collateralPrice,
            "collateralDivisor": collateralDivisor,
            "collateralLogoURI": `https://raw.githubusercontent.com/soulswapfinance/assets/prod/blockchains/fantom/assets/${collateralAddressCS}/logo.png`,            

            "borrowTotalBase": totalBorrowBase,
            "borrowTotalElastic": totalBorrowElastic,

            "api": `https://api.soulswap.finance/info/tokens/${pairAddress}`,
            "ftmscan": `https://ftmscan.com/address/${pairAddress}#code`,
        }
    }
}

async function getUserInfo(ctx) {
    const pairAddress = web3.utils.toChecksumAddress(ctx.params.id);
    const userAddress = web3.utils.toChecksumAddress(ctx.params.userAddress);
    const PairContract = new web3.eth.Contract(UnderworldContractABI, pairAddress);
    const PriceFetcherContract = new web3.eth.Contract(PriceFetcherABI, fetcherAddress);
    const MulticallContract = new web3.eth.Contract(MulticallContractABI, MULTICALL_ADDRESS);

    // PAIR DETAILS //
    const totalSupply = await PairContract.methods.totalSupply().call();
    const pairName = await PairContract.methods.name().call();
    const pairSymbol = await PairContract.methods.symbol().call();
    const pairDecimals = await PairContract.methods.decimals().call();
    const pairDivisor = 10**pairDecimals
    const exchangeRate = await PairContract.methods.exchangeRate().call();
    const oracleAddress = await PairContract.methods.oracle().call();
    const interestPerSecond = await PairContract.methods.accrueInfo().call()[0];
    const lastAccrued = await PairContract.methods.accrueInfo().call()[1];
    const feesEarnedFraction = await PairContract.methods.accrueInfo().call()[2];

    // ASSET DETAILS //
    const assetAddress = await PairContract.methods.asset().call();
    const AssetContract = new web3.eth.Contract(ERC20ContractABI, assetAddress);
    const assetTicker = await AssetContract.methods.symbol().call();
    const assetDecimals = await AssetContract.methods.decimals().call();
    const assetPrice 
        = await PriceFetcherContract.methods.currentTokenUsdcPrice(assetAddress).call()
            /  10**assetDecimals;
    
    // COLLATERAL DETAILS //
    const collateralAddress = await PairContract.methods.collateral().call();
    const CollateralContract = new web3.eth.Contract(ERC20ContractABI, collateralAddress);
    const collateralTicker = await CollateralContract.methods.symbol().call();
    const collateralDecimals = await CollateralContract.methods.decimals().call();
    const collateralPrice 
        = await PriceFetcherContract.methods.currentTokenUsdcPrice(collateralAddress).call()
            / 10**collateralDecimals;

    // TOTAL DETAILS //
    const totalBorrowElastic = await PairContract.methods.totalBorrow().call()[0];
    const totalBorrowBase = await PairContract.methods.totalBorrow().call()[1];
    const totalAssetElastic = await PairContract.methods.totalAsset().call()[0];
    const totalAssetBase = await PairContract.methods.totalAsset().call()[1];
    
    // USER DETAILS //
    const nativeBalance = await MulticallContract.methods.getEthBalance(userAddress).call() / 1e18;
    const userAssetBalance 
        = assetTicker == 'WFTM' 
            ? nativeBalance 
            : await AssetContract.methods.balanceOf(userAddress).call() / pairDivisor;
    const userBalance = await PairContract.methods.balanceOf(userAddress).call() / pairDivisor;
    const userBorrowPart = await PairContract.methods.userBorrowPart(userAddress).call();
    const userCollateralShare = await PairContract.methods.userCollateralShare(userAddress).call();

    if (!("id" in ctx.params))
        return {"name": "Underworld Pairs"};
    else {
        return {
            "address": pairAddress,
            "oracleAddress": oracleAddress,
            "userAddress": userAddress,
            "name": pairName,
            "symbol": pairSymbol,
            "decimals": pairDecimals,
            "supply": totalSupply / pairDivisor,

            "exchangeRate": exchangeRate,
            "interestPerSecond": interestPerSecond,
            "lastAccrued": lastAccrued,
            "feesEarnedFraction": feesEarnedFraction,

            "assetTicker": assetTicker,
            "assetPrice": assetPrice,
            "assetAddress": assetAddress,
            "assetDecimals": assetDecimals,
            "assetLogoURI": `https://raw.githubusercontent.com/soulswapfinance/assets/prod/blockchains/fantom/assets/${assetAddress}/logo.png`,
            "assetTotalBase": totalAssetBase,
            "assetTotalElastic": totalAssetElastic,
            
            "collateralTicker": collateralTicker,
            "collateralPrice": collateralPrice,
            "collateralAddress": collateralAddress,
            "collateralDecimals": collateralDecimals,
            "collateralLogoURI": `https://raw.githubusercontent.com/soulswapfinance/assets/prod/blockchains/fantom/assets/${collateralAddress}/logo.png`,            
            "borrowTotalBase": totalBorrowBase,
            "borrowTotalElastic": totalBorrowElastic,

            "userAssetBalance": userAssetBalance,
            "userBalance": userBalance,
            "userBorrowPart": userBorrowPart,
            "userCollateralShare": userCollateralShare,

            "api": `https://api.soulswap.finance/info/tokens/${pairAddress}`,
            "ftmscan": `https://ftmscan.com/address/${pairAddress}#code`,
        }
    }
}

async function pairInfo(ctx) {
    ctx.body = (await getPairInfo(ctx))
}

async function userInfo(ctx) {
    ctx.body = (await getUserInfo(ctx))
}

module.exports = { pairInfo, userInfo };


// pair.address = currentValue
//         pair.oracle = getOracle(chainId, pair.oracle, pair.oracle.data)
//         // @ts-ignore TYPE NEEDS FIXING
//         pair.asset = pairTokens[pair.asset]
//         // @ts-ignore TYPE NEEDS FIXING
//         pair.collateral = pairTokens[pair.collateral]

//         pair.elapsedSeconds = BigNumber.from(Date.now()).div('1000').sub(pair.accrueInfo.lastAccrued)

//         // The total collateral in the market (stable, doesn't accrue)
//         pair.totalCollateralAmount = easyAmount(toAmount(pair.collateral, pair.totalCollateralShare), pair.collateral)

//         // The total assets unborrowed in the market (stable, doesn't accrue)
//         pair.totalAssetAmount = easyAmount(toAmount(pair.asset, pair.totalAsset.elastic), pair.asset)

//         // The total assets borrowed in the market right now
//         pair.currentBorrowAmount = easyAmount(accrue(pair, pair.totalBorrow.elastic, true), pair.asset)

//         // The total amount of assets, both borrowed and still available right now
//         pair.currentAllAssets = easyAmount(pair.totalAssetAmount.value.add(pair.currentBorrowAmount.value), pair.asset)

//         pair.marketHealth = pair.totalCollateralAmount.value
//           .mulDiv(e10(18), maximum(pair.currentExchangeRate, pair.oracleExchangeRate, pair.spotExchangeRate))
//           .mulDiv(e10(18), pair.currentBorrowAmount.value)
        
//           // √ ACCURATE
//         console.log('currentAllAssets:%s', Number(pair.currentAllAssets.value))
//         console.log('pair.totalCollateralAmount.value:%s', Number(pair.totalCollateralAmount.value))
//         console.log('marketHealth:%s', Number(pair.marketHealth))

//         pair.currentTotalAsset = accrueTotalAssetWithFee(pair)

//         pair.currentAllAssetShares = toShare(pair.asset, pair.currentAllAssets.value)

//         // Maximum amount of assets available for withdrawal or borrow
//         pair.maxAssetAvailable = minimum(
//           pair.totalAsset.elastic.mulDiv(pair.currentAllAssets.value, pair.currentAllAssetShares),
//           toAmount(pair.asset, toElastic(pair.currentTotalAsset, pair.totalAsset.base.sub(1000), false))
//         )

//         pair.maxAssetAvailableFraction = pair.maxAssetAvailable.mulDiv(
//           pair.currentTotalAsset.base,
//           pair.currentAllAssets.value
//         )

//         // The percentage of assets that is borrowed out right now
//         pair.utilization = e10(18).mulDiv(pair.currentBorrowAmount.value, pair.currentAllAssets.value)

//         // Interest per year received by lenders as of now
//         pair.supplyAPR = takeFee(pair.interestPerYear.mulDiv(pair.utilization, e10(18)))

//         // Interest payable by borrowers per year as of now
//         pair.currentInterestPerYear = interestAccrue(pair, pair.interestPerYear)

//         // Interest per year received by lenders as of now
//         pair.currentSupplyAPR = takeFee(
//           pair.currentInterestPerYear.mulDiv(pair.utilization, e10(18)))

//         // The user's amount of collateral (stable, doesn't accrue)
//         pair.userCollateralAmount = easyAmount(toAmount(pair.collateral, pair.userCollateralShare), pair.collateral)

//         // The user's amount of assets (stable, doesn't accrue)
//         pair.currentUserAssetAmount = easyAmount(
//           pair.userAssetFraction.mulDiv(pair.currentAllAssets.value, pair.totalAsset.base),
//           pair.asset
//         )

//         // The user's amount borrowed right now
//         pair.currentUserBorrowAmount = easyAmount(
//           pair.userBorrowPart.mulDiv(pair.currentBorrowAmount.value, pair.totalBorrow.base),
//           pair.asset
//         )

//         // The user's amount of assets that are currently lent
//         pair.currentUserLentAmount = easyAmount(
//           pair.userAssetFraction.mulDiv(pair.currentBorrowAmount.value, pair.totalAsset.base),
//           pair.asset
//         )

//         // Value of protocol fees
//         pair.feesEarned = easyAmount(
//           pair.accrueInfo.feesEarnedFraction.mulDiv(pair.currentAllAssets.value, pair.totalAsset.base),
//           pair.asset
//         )

//         // The user's maximum borrowable amount based on the collateral provided, using all three oracle values
//         pair.maxBorrowable = {
//           oracle: pair.userCollateralAmount.value.mulDiv(e10(16).mul('75'), pair.oracleExchangeRate),
//           spot: pair.userCollateralAmount.value.mulDiv(e10(16).mul('75'), pair.spotExchangeRate),
//           stored: pair.userCollateralAmount.value.mulDiv(e10(16).mul('75'), pair.currentExchangeRate),
//         }

//         pair.maxBorrowable.minimum = minimum(
//           pair.maxBorrowable.oracle,
//           pair.maxBorrowable.spot,
//           pair.maxBorrowable.stored
//         )

//         pair.maxBorrowable.safe = pair.maxBorrowable.minimum.mulDiv('95', '100').sub(pair.currentUserBorrowAmount.value)

//         pair.maxBorrowable.possible = minimum(pair.maxBorrowable.safe, pair.maxAssetAvailable)

//         pair.safeMaxRemovable = Zero

//         pair.health = pair.currentUserBorrowAmount.value.mulDiv(e10(18), pair.maxBorrowable.minimum)

//         pair.netWorth = getUSDValue(
//           pair.currentUserAssetAmount.value.sub(pair.currentUserBorrowAmount.value),
//           pair.asset
//         ).add(getUSDValue(pair.userCollateralAmount.value, pair.collateral))

//         pair.search = pair.asset.symbol + '/' + pair.collateral.symbol

//         - pair.interestPerYear
//         pair.strategyAPY = {
//           asset: {
//             value: BigNumber.from(String(Math.floor((pair.asset.strategy?.apy ?? 0) * 1e16))),
//             string: String(pair.asset.strategy?.apy ?? 0),
//           },
//           collateral: {
//             value: BigNumber.from(String(Math.floor((pair.collateral.strategy?.apy ?? 0) * 1e16))),
//             string: String(pair.collateral.strategy?.apy ?? 0),
//           },
//         }
//         pair.utilization
//         pair.supplyAPR = {
//           value: pair.supplyAPR,
//           valueWithStrategy: pair.supplyAPR.add(pair.strategyAPY.asset.value.mulDiv(pair.utilization.value, e10(18))),
//           string: (pair.supplyAPR / 1e16).toString(),
//           stringWithStrategy:
//           (pair.strategyAPY.asset.value.add(
//             pair.supplyAPR.add(pair.strategyAPY.asset.value.mulDiv(pair.utilization.value, e10(18)))
//           ) / 1e16
//           ).toString(),
//         }
//         pair.currentSupplyAPR = {
//           value: pair.currentSupplyAPR,
//           valueWithStrategy: pair.currentSupplyAPR.add(
//             pair.strategyAPY.asset.value.mulDiv(pair.utilization.value, e10(18))
//           ),
//           string: (pair.currentSupplyAPR / 1e16).toString(),
//           stringWithStrategy:
//           (pair.currentSupplyAPR.add(pair.strategyAPY.asset.value.mulDiv(pair.utilization.value, e10(18)))
//             / 1e16
//           ).toString(),
//         }
//         pair.currentInterestPerYear
//         pair.health
//         pair.maxBorrowable = {
//           oracle: easyAmount(pair.maxBorrowable.oracle, pair.asset),
//           spot: easyAmount(pair.maxBorrowable.spot, pair.asset),
//           stored: easyAmount(pair.maxBorrowable.stored, pair.asset),
//           minimum: easyAmount(pair.maxBorrowable.minimum, pair.asset),
//           safe: easyAmount(pair.maxBorrowable.safe, pair.asset),
//           possible: easyAmount(pair.maxBorrowable.possible, pair.asset),
//         }

//         pair.safeMaxRemovable = easyAmount(pair.safeMaxRemovable, pair.collateral)
