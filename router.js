'use strict';

const Router = require('koa-router');
const router = new Router();

const noop = require('./api/noop');
const supply = require('./api/supply');
const price = require('./api/price');
const tokens = require('./api/tokens');
const sor = require('./api/sor');
const nft = require('./api/nft');
const pairs = require('./api/pairs');
const users = require('./api/users');
const luxor = require('./api/luxor');
const underworld = require('./api/underworld');
const coffin = require('./api/coffinbox');
const summoner = require('./api/summoner');
const soulswap = require('./api/soulswap');
const bonds = require('./api/bonds');

router.get('/supply/circulating', supply.circulatingSupply);
router.get('/supply/circulating-adjusted', supply.circulatingSupplyAdjusted);
router.get('/supply/total', supply.totalSupply);
router.get('/supply/total-adjusted', supply.totalSupplyAdjusted);
router.get('/supply/max', supply.maxSupply);

router.get('/sor', sor.sorInfo);

router.get('/nft/pop/circulating', nft.circulatingSupply);

router.get('/tokens/:id', tokens.tokenInfo);

router.get('/pairs/:id', pairs.pairInfo);
router.get('/pairs/:userAddress/:id', pairs.userPairInfo);

router.get('/priceftm/:tokenAddress', price.derivedPriceOfToken)
router.get('/priceusd/:tokenAddress', price.priceOfToken)

router.get('/users/:id', users.userInfo)
router.get('/users/:id/:tokenAddress', users.tokenInfo)

router.get('/luxor', luxor.infos)
router.get('/luxor/:id', luxor.bondInfo)
router.get('/luxor/users/:userAddress', luxor.userInfo)

// router.get('/underworld', underworld.infos)
router.get('/underworld/:id', underworld.pairInfo)
router.get('/underworld/users/:userAddress/:id', underworld.userInfo)

// router.get('/coffin', coffin.infos)
router.get('/coffin/:id', coffin.coffinInfo)
router.get('/coffin/users/:userAddress/:id', coffin.userInfo)

router.get('/summoner', summoner.infos)
router.get('/summoner/stake/users/:userAddress', summoner.stakeInfo)
router.get('/summoner/:id', summoner.poolInfo)
router.get('/summoner/users/:userAddress/:id', summoner.userInfo)

router.get('/soulswap', soulswap.infos)
router.get('/soulswap/vault', soulswap.vaultInfo)
router.get('/soulswap/vault/users/:userAddress', soulswap.userVaultInfo)

router.get('/bonds', bonds.infos)
router.get('/bonds/:pid', bonds.bondInfo)
router.get('/bonds/users/:userAddress/:pid', bonds.userInfo)

// router.get('/lending/supply', lending.totalSupply)

router.get('/', noop);

module.exports = router;
