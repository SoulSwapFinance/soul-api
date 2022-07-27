'use strict';
const {web3Factory} = require("../../utils/web3");
const { DAI, LUX, WLUM, FTM_CHAIN_ID, LUXOR_TREASURY_ADDRESS } = require("../../constants");

const web3 = web3Factory( FTM_CHAIN_ID );
const ERC20ContractABI = require('../../abis/ERC20ContractABI.json');
const PriceFetcherABI = require('../../abis/PriceFetcherABI.json');

const BN = require('bn.js');

async function getSorInfo() {
    const luxorTreasuryAddress = LUXOR_TREASURY_ADDRESS;
    const sorAddress = '0xEFFd4874AcA3Acd19a24dF3281b5cdAdD823801A';
    // const masterAddress = '0xfF1157CaCB174c012f68CDb0B7700597aae3D5A8';
    const minterAddress = '0x104b191008e56a0B79f25a828Ee18873AdD36C6c'
    const SorContract = new web3.eth.Contract(ERC20ContractABI, sorAddress);
    const DaiContract = new web3.eth.Contract(ERC20ContractABI, DAI);
    const LuxorContract = new web3.eth.Contract(ERC20ContractABI, LUX);
    const WLumensContract = new web3.eth.Contract(ERC20ContractABI, WLUM);
    const fetcherAddress = '0xba5da8aC172a9f014D42837EE1B678C4Ca96fB0E';
    const PriceFetcherContract = new web3.eth.Contract(PriceFetcherABI, fetcherAddress);

    // METHOD CALLS //
    const rawLuxorPrice = await PriceFetcherContract.methods.currentTokenUsdcPrice(LUX).call();
    const rawWrappedLumensPrice = await PriceFetcherContract.methods.currentTokenUsdcPrice(WLUM).call();
    const luxorPrice = rawLuxorPrice / 1e18
    const wlumPrice = rawWrappedLumensPrice / 1e18

    const totalSupply = await SorContract.methods.totalSupply().call() / 1e18;
    const luxorTreasuryBalance = await SorContract.methods.balanceOf(luxorTreasuryAddress).call() / 1e18;
    const sorMasterCollateral = await SorContract.methods.balanceOf(minterAddress).call() / 1e18;
    const daiMasterCollateral = await DaiContract.methods.balanceOf(minterAddress).call() / 1e18;
    const luxorMasterCollateral = await LuxorContract.methods.balanceOf(minterAddress).call() / 1e9;
    const wlumMasterCollateral = await WLumensContract.methods.balanceOf(minterAddress).call() / 1e9;

    const stableCollateralValue = sorMasterCollateral + daiMasterCollateral
    const luxorCollateralValue = luxorMasterCollateral * luxorPrice
    const wlumCollateralValue = wlumMasterCollateral * wlumPrice
    const luxCollateralValue = luxorCollateralValue + wlumCollateralValue
    const collateralValue = luxCollateralValue + stableCollateralValue
    const collateralization = collateralValue / totalSupply

        return {
            "address": sorAddress,
            "supply": totalSupply,
            "luxorTreasuryBalance": luxorTreasuryBalance,
            "sorCollateral": sorMasterCollateral,
            "daiCollateral": daiMasterCollateral,
            "stableCollateral": stableCollateralValue,
            "luxorCollateral": luxorMasterCollateral,
            "wlumCollateral": wlumMasterCollateral,
            "luxorCollateralValue": luxorCollateralValue,
            "wlumCollateralValue": wlumCollateralValue,
            "collateralValue": collateralValue,
            "collateralization": collateralization,
            "api": "https://api.soulswap.finance/sor",
        }
}

async function sorInfo(ctx) {
    ctx.body = (await getSorInfo(ctx))
}

module.exports = {sorInfo};
