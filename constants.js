const BN = require("bn.js");
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3002';

const FTM_RPC = process.env.FTM_RPC || 'https://rpc.ftm.tools';
const FTM_CHAIN_ID = 250;

// const FTM_VAULTS_ENDPOINT = '';

const _1E18 = new BN("1000000000000000000");

module.exports = {
  API_BASE_URL,
  _1E18,

  FTM_RPC,
  FTM_CHAIN_ID,
  // FTM_VAULTS_ENDPOINT
};
