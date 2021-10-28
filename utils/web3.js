const Web3 = require('web3');
const { FTM_RPC } = require("../constants");

const {
  FTM_CHAIN_ID,
} = require('../constants');

const clients = {ftm: []};

clients.ftm.push(new Web3(FTM_RPC));

const ftmRandomClient = () => clients.ftm[~~(clients.ftm.length * Math.random())];

module.exports = {
  get ftmWeb3() {
    return ftmRandomClient();
  },

  web3Factory: chainId => {
    switch (chainId) {
      case FTM_CHAIN_ID:
        return ftmRandomClient();
    }
  },
};
