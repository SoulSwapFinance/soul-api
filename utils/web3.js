const Web3 = require('web3');
const { RPC } = require("../constants");

const {
  CHAIN_ID,
} = require('../constants');

const clients = {ftm: []};

clients.ftm.push(new Web3(RPC));

const randomClient = () => clients.ftm[~~(clients.ftm.length * Math.random())];

module.exports = {
  get ftmWeb3() {
    return randomClient();
  },

  web3Factory: chainId => {
    switch (chainId) {
      case CHAIN_ID:
        return randomClient();
    }
  },
};
