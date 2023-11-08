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

## Examples
---
- Price of Soul (by ticker)
  - Fantom: [https://api.soulswap.finance/price/soul](https://api.soulswap.finance/price/soul)
- Price of Soul (by address)
  - Fantom: [https://api.soulswap.finance/priceusd/0xe2fb177009ff39f52c0134e8007fa0e4baacbd07](https://api.soulswap.finance/priceusd/0xe2fb177009ff39f52c0134e8007fa0e4baacbd07)
