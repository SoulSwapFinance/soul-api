'use strict';

const Router = require('koa-router');
const router = new Router();

const noop = require('./api/noop');
const supply = require('./api/supply');
const price = require('./api/price');
const tokens = require('./api/tokens');
const luxor = require('./api/luxor');
const nftSpider = require('./api/nft/spider');
const lending = require('./api/lending');

router.get('/supply/circulating', supply.circulatingSupply);
router.get('/supply/circulating-adjusted', supply.circulatingSupplyAdjusted);
router.get('/supply/total', supply.totalSupply);
router.get('/supply/total-adjusted', supply.totalSupplyAdjusted);
router.get('/supply/max', supply.maxSupply);
router.get('/nft/spider', nftSpider.infos);
router.get('/nft/spider/:id', nftSpider.infos);

router.get('/tokens', tokens.infos);
router.get('/tokens/:id', tokens.infos);
router.get('/priceftm/:tokenAddress', price.derivedPriceOfToken)
router.get('/priceusd/:tokenAddress', price.priceOfToken)
// router.get('/tokenSupply/:tokenAddress', tokens.getSupply)
router.get('/lending/supply', lending.totalSupply)
router.get('/luxor/total', luxor.totalLuxorSupply)
router.get('/luxor/warmupPeriod', luxor.warmupPeriod)
router.get('/luxor/epoch', luxor.epoch)
router.get('/', noop);

module.exports = router;
