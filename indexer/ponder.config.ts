import { createConfig } from '@ponder/core'
import { http } from 'viem'

import { GovernorAbi } from './abis/GovernorAbi'

export default createConfig({
  networks: {
    mainnet: {
      chainId: 1,
      transport: http(process.env.PONDER_RPC_URL_1),
    },
  },
  contracts: {
    Governor: {
      abi: GovernorAbi,
      address: '0x323A76393544d5ecca80cd6ef2A560C6a395b7E3',
      network: 'mainnet',
      startBlock: 13533772,
    },
  },
})
