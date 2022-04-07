'use strict';
const {web3Factory} = require("../../utils/web3");
const { DAI, LUX, FTM_CHAIN_ID, LUXOR_TREASURY_ADDRESS } = require("../../constants");

const web3 = web3Factory( FTM_CHAIN_ID );
const ERC20ContractABI = require('../../abis/ERC20ContractABI.json');
const PriceFetcherABI = require('../../abis/PriceFetcherABI.json');

const BN = require('bn.js');

async function getSorInfo() {
    const luxorTreasuryAddress = LUXOR_TREASURY_ADDRESS;
    const luxorAddress = LUX;
    const sorAddress = '0xEFFd4874AcA3Acd19a24dF3281b5cdAdD823801A';
    const masterAddress = '0xfF1157CaCB174c012f68CDb0B7700597aae3D5A8';
    const SorContract = new web3.eth.Contract(ERC20ContractABI, sorAddress);
    const DaiContract = new web3.eth.Contract(ERC20ContractABI, DAI);
    const LuxorContract = new web3.eth.Contract(ERC20ContractABI, LUX);
    const fetcherAddress = '0xba5da8aC172a9f014D42837EE1B678C4Ca96fB0E';
    const PriceFetcherContract = new web3.eth.Contract(PriceFetcherABI, fetcherAddress);

    // METHOD CALLS //
    const rawPrice = await PriceFetcherContract.methods.currentTokenUsdcPrice(luxorAddress).call();
    const luxorPrice = rawPrice / 1e18

    const totalSupply = await SorContract.methods.totalSupply().call() / 1e18;
    const luxorTreasuryBalance = await SorContract.methods.balanceOf(luxorTreasuryAddress).call() / 1e18;
    const sorMasterCollateral = await SorContract.methods.balanceOf(masterAddress).call() / 1e18;
    const daiMasterCollateral = await DaiContract.methods.balanceOf(masterAddress).call() / 1e18;
    const luxorMasterCollateral = await LuxorContract.methods.balanceOf(masterAddress).call();
    const stableCollateralValue = sorMasterCollateral + daiMasterCollateral
    const luxorCollateralValue = luxorMasterCollateral * luxorPrice / 1e9
    const collateralValue = luxorCollateralValue + stableCollateralValue
    const collateralization = collateralValue / totalSupply
    // TODO: burn SOR

        return {
            "address": sorAddress,
            "supply": totalSupply,
            "luxorTreasuryBalance": luxorTreasuryBalance,
            "sorCollateral": sorMasterCollateral,
            "daiCollateral": daiMasterCollateral,
            "stableCollateral": stableCollateralValue,
            "luxorCollateral": luxorMasterCollateral,
            "luxorCollateralValue": luxorCollateralValue,
            "luxorCollateralValue": luxorCollateralValue,
            "collateralValue": collateralValue,
            "collateralization": collateralization,
            "api": "https://api.soulswap.finance/sor",
        }
}

async function sorInfo(ctx) {
    ctx.body = (await getSorInfo(ctx))
}

module.exports = {sorInfo};
