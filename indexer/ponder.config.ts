import { createConfig } from 'ponder'
import { http } from 'viem'

import { GovernorContract } from './contracts'

export default createConfig({
  networks: {
    mainnet: {
      chainId: 1,
      transport: http(process.env.PONDER_RPC_URL_1),
    },
  },
  contracts: {
    Governor: {
      ...GovernorContract,
      network: 'mainnet',
    },
  },
})
