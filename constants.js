const BN = require("bn.js")
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3002'
const CHAIN_ID = 43114
const RPC = process.env.RPC || `https://api.avax.network/ext/bc/C/rpc`

const SOUL_DAO = "0xf551D88fE8fae7a97292d28876A0cdD49dC373fa" // √
const SOUL_BOND = "0x6385BFD7A981021fF07845b2e7fDdD02901E25ea" // √
const SUMMONER_ADDRESS = '0xB1e330401c920077Ddf157AbA5594238d36b54B1' // √
const MULTICALL_ADDRESS = '0x2E138E5cAFfa287b4d96CD4b34A0Fb180Ae7eB84' // √
const FACTORY_ADDRESS = '0x5bb2a9984de4a69c05c996f7ef09597ac8c9d63a'
const ROUTER_ADDRESS = '0xa4594460A9d3D41e8B85542D34E23AdAbc3c86Ef'

const DAI = "0xd586E7F844cEa2F87f50152665BCbc2C279D8d70" // √
const BTC = "0x50b7545627a5162F82A992c33b87aDc75187B218" // √
const WNATIVE="0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7" // √
const SOUL="0x11d6DD25c1695764e64F439E32cc7746f3945543" // √
const SEANCE="0x97Ee3C9Cf4E5DE384f95e595a8F327e65265cC4E" // √

const SOUL_USDC = "0x922fcADa825Dc669798206A35D2D2B455f9A64E7" // √
const NATIVE_SOUL = '0x6Da1AD717C7577AAB46C19aB6d3d9C31aff32A00' // √
const NATIVE_USDC = "0x864384a54ea644852603778c0C200eF2D6F2Ac2f" // √
const NATIVE_DAI = "0xEF1D48b24E87F8ccfF97f7C295B31B92E30F372B" // √
const NATIVE_BTC = "0x8C162C3Bdd7354b5Cb1A0b18eDBB5725CFE762A3" // √
const NATIVE_ETH = "0x5796Bf89f6C7C47811E4E59Ecd7aCACC8A5B9dEF" // √
const NATIVE_BNB = "0xB3074D8b7f22439F337E2E2830864be9c8236866" // √

const USDC_DAI = "0xE9807645aDA66F2f3d4f2d2A79223701F3cC0903" // √
const BTC_ETH = "0x23a099d29d92c832B5AE528eE7f4E32d3a51b813" // √

const PRICE_FETCHER_ADDRESS = '0xbc83454171005a8eFd6aad89b637dDeB18473497' // √
const AUTOSTAKE_ADDRESS = '0x5647Ed56e3781D490182fcEaf090f9b43c7322c3' // √
const COFFINBOX_ADDRESS = '0xF539C37275e947F24480fAb9f7e302aE827570b2' // √
const AURA = "0x268D3D63088821C17c59860D6B9476680a4843d2" // √
const BTC_ORACLE_ADDRESS = '0x2779D32d5166BAaa2B2b658333bA7e6Ec0C65743'
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"
const _1E18 = new BN("1000000000000000000");

module.exports = {
  API_BASE_URL, SUMMONER_ADDRESS, MULTICALL_ADDRESS,
  _1E18, SOUL, WNATIVE, DAI, SEANCE, SOUL_DAO, AURA, FACTORY_ADDRESS, ROUTER_ADDRESS,
  SOUL_BOND, NATIVE_SOUL, NATIVE_ETH, USDC_DAI, NATIVE_BNB, BTC_ETH,
  NATIVE_BTC, SOUL_USDC, NATIVE_USDC, AUTOSTAKE_ADDRESS, COFFINBOX_ADDRESS, ZERO_ADDRESS,
  PRICE_FETCHER_ADDRESS, RPC, CHAIN_ID, NATIVE_DAI, BTC, BTC_ORACLE_ADDRESS
};
