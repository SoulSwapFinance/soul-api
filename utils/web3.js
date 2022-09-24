const Web3 = require('web3');
const { RPC } = require("../constants");

const {
  CHAIN_ID,
} = require('../constants');

const clients = {avax: []};

clients.avax.push(new Web3(RPC));

const randomClient = () => clients.avax[~~(clients.avax.length * Math.random())];

module.exports = {
  get avaxWeb3() {
    return randomClient();
  },

  web3Factory: chainId => {
    switch (chainId) {
      case CHAIN_ID:
        return randomClient();
    }
  },
};
