const BN = require("bn.js");
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3002';

const FTM_RPC = process.env.FTM_RPC || 'https://rpc.ftm.tools';
const FTM_CHAIN_ID = 250;

const TREASURY_ADDRESS="0xDF2A28Cc2878422354A93fEb05B41Bd57d71DB24"

const LUX="0x6671E20b83Ba463F270c8c75dAe57e3Cc246cB2b"
const WLUM="0xa69557e01B0a6b86E5b29BE66d730c0Bfff68208"
const WFTM="0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83"
const DAI="0x8D11eC38a3EB5E956B052f67Da8Bdc9bef8Abf3E"

const FTM_DAI_LP="0xF3d6E8Ecece8647B456d57375Ce0B51B8F0cD40b"

const FTM_WLUM_LP="0xa670C1E02c7AE8B3D575293bfA1F7eBa90F81C99"

const FTM_LUX_LP="0x951BBB838e49F7081072895947735b0892cCcbCD"

const DAI_LUX_LP="0x46729c2AeeabE7774a0E710867df80a6E19Ef851"

const FTM_LEND_DAI="0xFD9BE6a83c7e9cFF48f6D9a3036bb6b20598ED61"

const DAI_LEND_FTM="0xF4Bfdd73FE65D1B46b9968A24443A77ab89908dd"



// CONTRACTS //

const LuxorContract = new web3.eth.Contract(ERC20ContractABI, LUX);

const PriceFetcherContract = new web3.eth.Contract(PriceFetcherABI, fetcherAddress);

// Reserves
const DaiContract = new web3.eth.Contract(ERC20ContractABI, DAI);
const FtmContract = new web3.eth.Contract(ERC20ContractABI, WFTM);

// Liquidity
const FtmLuxContract = new web3.eth.Contract(ERC20ContractABI, FTM_LUX_LP);

const DaiLuxContract = new web3.eth.Contract(ERC20ContractABI, DAI_LUX_LP);


// Investments
const FtmDaiContract = new web3.eth.Contract(ERC20ContractABI, FTM_DAI_LP);

const FtmWlumContract = new web3.eth.Contract(ERC20ContractABI, FTM_WLUM_LP);

const DaiLendFtmContract = new web3.eth.Contract(ERC20ContractABI, DAI_LEND_FTM);

const FtmLendDaiContract = new web3.eth.Contract(ERC20ContractABI, FTM_LEND_DAI);


// const FTM_VAULTS_ENDPOINT = '';

const _1E18 = new BN("1000000000000000000");


module.exports = {
  API_BASE_URL,
  _1E18,
  
  // erc20s
  LuxorContract,
  FtmContract,
  DaiContract,
  
  // liquidity
  DaiLuxContract,
  FtmLuxContract,
  
  // investments
  DaiLendFtmContract,
  FtmLendDaiContract,
  FtmDaiContract,
  FtmWlumContract,
  

  FTM_RPC,
  FTM_CHAIN_ID,
  // FTM_VAULTS_ENDPOINT
};
