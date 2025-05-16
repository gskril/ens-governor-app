import { createConfig } from 'ponder'
import { http } from 'viem'

import { GovernorContract } from './contracts'

export default createConfig({
  chains: {
    mainnet: {
      id: 1,
      rpc: http(process.env.PONDER_RPC_URL_1),
    },
  },
  contracts: {
    Governor: {
      ...GovernorContract,
      chain: 'mainnet',
    },
  },
})
