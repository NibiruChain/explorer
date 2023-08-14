/*
 * @Description: file
 * @Autor: dingyiming
 * @Date: 2021-11-20 15:26:27
 * @LastEditors: dingyiming
 * @LastEditTime: 2021-11-20 15:33:07
 */
import { sha256 } from '@cosmjs/crypto'
import { toHex } from '@cosmjs/encoding'

let chains = {}
const coingecko = {}
const configs = []

const PLAYGROUND_NETWORKS = 'https://networks.play.nibiru.fi/ping-pub'
const DEV_NETWORKS = 'https://networks.testnet.nibiru.fi/ping-pub'
const ITN_NETWORKS = 'https://networks.itn.nibiru.fi/ping-pub'
const ITN2_NETWORKS = 'https://networks.itn2.nibiru.fi/ping-pub'

try {
  const testnets = await fetch(ITN_NETWORKS).then(response => response.json())
  testnets.forEach((_, i) => {
    testnets[i].visible = true
  })
  configs.push(...testnets)
} catch (error) {
  console.log(error)
}

try {
  const testnets = await fetch(ITN2_NETWORKS).then(response => response.json())
  testnets.forEach((_, i) => {
    testnets[i].visible = true
  })
  configs.push(...testnets)
} catch (error) {
  console.log(error)
}

try {
  const devnets = await fetch(DEV_NETWORKS).then(response => response.json())
  devnets.forEach((_, i) => {
    devnets[i].visible = false
  })
  configs.push(...devnets)
} catch (error) {
  console.log(error)
}

try {
  const playnets = await fetch(PLAYGROUND_NETWORKS).then(response => response.json())
  playnets.forEach((_, i) => {
    playnets[i].visible = false
  })
  configs.push(...playnets)
} catch (error) {
  console.log(error)
}

const update = {}
configs.forEach(chain => {
  const c = chain
  c.chain_name = String(c.chain_name).toLowerCase()
  update[c.chain_name] = c
  if (Array.isArray(c.assets)) {
    c.assets.forEach(x => {
      if (x.coingecko_id && x.coingecko_id !== '') coingecko[x.coingecko_id] = String(x.symbol).toUpperCase()
    })
  }
})

chains = update
localStorage.setItem('chains', JSON.stringify(update))
const selected = chains.cosmos

const avatarcache = localStorage.getItem('avatars')

export default {
  namespaced: true,
  state: {
    config: chains,
    selected,
    avatars: avatarcache ? JSON.parse(avatarcache) : {},
    height: 0,
    ibcChannels: {},
    quotes: {},
    defaultWallet: localStorage.getItem('default-wallet'),
    denoms: {},
    ibcPaths: {},
  },
  getters: {
    getchains: state => state.chains,
    getAvatarById: state => id => state.avatars[id],
  },
  mutations: {
    setup_sdk_version(state, info) {
      state.chains.config[info.chain_name].sdk_version = info.version
    },
    select(state, args) {
      state.chains.selected = state.chains.config[args.chain_name]
    },
    cacheAvatar(state, args) {
      state.chains.avatars[args.identity] = args.url
      localStorage.setItem('avatars', JSON.stringify(state.chains.avatars))
    },
    setHeight(state, height) {
      state.chains.height = height
    },
    setChannels(state, { chain, channels }) {
      state.chains.ibcChannels[chain] = channels
    },
    setQuotes(state, quotes) {
      state.quotes = quotes
    },
    setDefaultWallet(state, defaultWallet) {
      if (defaultWallet && defaultWallet.length > 0) {
        localStorage.setItem('default-wallet', defaultWallet)
        state.chains.defaultWallet = defaultWallet
      } else {
        state.chains.defaultWallet = null
      }
    },
    setIBCDenoms(state, denoms) {
      state.denoms = { ...state.denoms, ...denoms }
    },
    setIBCPaths(state, paths) {
      state.ibcPaths = paths
    },
  },
  actions: {
    async getQuotes(context) {
      // fetch('https://price.ping.pub/quotes').then(data => data.json()).then(data => {
      //   context.commit('setQuotes', data)
      // })
      const keys = Object.keys(coingecko)
      if (keys.length > 0) {
        const currencies = 'usd,cny,eur,jpy,krw,sgd,hkd'
        fetch(`https://api.coingecko.com/api/v3/simple/price?include_24hr_change=true&vs_currencies=${currencies}&ids=${keys.join(',')}`).then(data => data.json()).then(data => {
          // use symbol as key instead of coingecko id
          const quotes = {}
          if (data && Object.keys(data)) {
            Object.keys(data).forEach(k => {
              quotes[coingecko[k]] = data[k]
            })
          }
          context.commit('setQuotes', quotes)
        })
      }
    },

    async getAllIBCDenoms(context, _this) {
      _this.$http.getAllIBCDenoms().then(x => {
        const denomsMap = {}
        const pathsMap = {}
        x.denom_traces.forEach(trace => {
          const hash = toHex(sha256(new TextEncoder().encode(`${trace.path}/${trace.base_denom}`)))
          const ibcDenom = `ibc/${hash.toUpperCase()}`
          denomsMap[ibcDenom] = trace.base_denom

          const path = trace.path.split('/')
          if (path.length >= 2) {
            pathsMap[ibcDenom] = {
              channel_id: path[path.length - 1],
              port_id: path[path.length - 2],
            }
          }
        })
        context.commit('setIBCDenoms', denomsMap)
        context.commit('setIBCPaths', pathsMap)
      })
    },
  },
}
