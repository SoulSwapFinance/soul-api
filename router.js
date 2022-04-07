'use strict';

const Router = require('koa-router');
const router = new Router();

const noop = require('./api/noop');
const supply = require('./api/supply');
const price = require('./api/price');
const tokens = require('./api/tokens');
const sor = require('./api/sor');
const pairs = require('./api/pairs');
const users = require('./api/users');
const luxor = require('./api/luxor');
const nftSpider = require('./api/nft/spider');
const underworld = require('./api/underworld');
const coffin = require('./api/coffinbox');

router.get('/supply/circulating', supply.circulatingSupply);
router.get('/supply/circulating-adjusted', supply.circulatingSupplyAdjusted);
router.get('/supply/total', supply.totalSupply);
router.get('/supply/total-adjusted', supply.totalSupplyAdjusted);
router.get('/supply/max', supply.maxSupply);

router.get('/nft/spider', nftSpider.infos);
router.get('/nft/spider/:id', nftSpider.infos);

router.get('/sor', sor.sorInfo);

router.get('/tokens/:id', tokens.tokenInfo);

router.get('/pairs', pairs.pairInfo);
router.get('/pairs/:id', pairs.pairInfo);

router.get('/priceftm/:tokenAddress', price.derivedPriceOfToken)
router.get('/priceusd/:tokenAddress', price.priceOfToken)

router.get('/users/:userAddress/:id', users.tokenInfo)

router.get('/luxor', luxor.infos)
router.get('/luxor/:id', luxor.bondInfo)
router.get('/luxor/users/:userAddress', luxor.userInfo)

// router.get('/underworld', underworld.infos)
router.get('/underworld/:id', underworld.pairInfo)
router.get('/underworld/users/:userAddress/:id', underworld.userInfo)

// router.get('/coffin', coffin.infos)
router.get('/coffin/:id', coffin.coffinInfo)
router.get('/coffin/users/:userAddress/:id', coffin.userInfo)

// router.get('/lending/supply', lending.totalSupply)

router.get('/', noop);

module.exports = router;
