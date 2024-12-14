import { getDefaultWallets } from '@rainbow-me/rainbowkit'
import { createConfig, http } from 'wagmi'
import { mainnet } from 'wagmi/chains'

import { frameConnector } from '@/lib/frame-connector'

const WALLETCONNECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_ID

if (!WALLETCONNECT_ID) {
  throw new Error('Missing NEXT_PUBLIC_WALLETCONNECT_ID')
}

const { connectors } = getDefaultWallets({
  appName: '',
  projectId: WALLETCONNECT_ID,
})

const chains = [mainnet] as const

export const wagmiConfig = createConfig({
  chains,
  connectors: [...connectors, frameConnector()],
  transports: {
    [mainnet.id]: http(process.env.NEXT_PUBLIC_ETH_RPC_URL, {
      // Some RPC providers don't support batch requests
      // If you can enable it, you'll get improved performance on ENS lookups
      batch: false,
    }),
  },
})
