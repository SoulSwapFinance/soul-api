# Soul API

API configurations designed for the purposes of fulfilling data requests for CMC and CoinGecko.

---

## To Run
```
yarn
yarn start
```

---
---

## Endpoints

---

#### **/supply/total**: Used by [Coingecko](https://coingecko.com) to display SOUL total supply.

#### **/supply/circulating**: Used by [Coingecko](https://coingecko.com) to display SOUL's circulating supply.

#### **/supply/max**: Used by [Coingecko](https://coingecko.com) to display SOUL's max supply.


#### **/priceftm/token**: Used to display current derived price of token. **token** needs to be an address or the symbol of a token with enough liquidity.

#### **/priceusd/token**: Used to display current price in usdt of token. **token** needs to be an address or the symbol of a token with enough liquidity.
