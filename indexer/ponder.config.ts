import { createConfig } from 'ponder'

import { GovernorContract } from './contracts'

export default createConfig({
  chains: {
    mainnet: {
      id: 1,
      rpc: process.env.PONDER_RPC_URL_1,
      ws: process.env.PONDER_WS_URL_1,
    },
  },
  contracts: {
    Governor: {
      ...GovernorContract,
      chain: 'mainnet',
    },
  },
})
