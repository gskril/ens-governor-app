'use client'

import { useConnectModal } from '@rainbow-me/rainbowkit'
import { useAccount, useDisconnect, useEnsName } from 'wagmi'

import { Button } from '@/components/ui/button'
import { truncateAddress } from '@/lib/utils'

export function ConnectButton() {
  const { openConnectModal } = useConnectModal()
  const { disconnect } = useDisconnect()

  const { address } = useAccount()
  const { data: ensName } = useEnsName({ address })

  if (address) {
    return (
      <Button
        size="sm"
        className="h-auto rounded-full p-0.5 pr-3 font-semibold"
        onClick={() => disconnect()}
      >
        <img
          src={
            ensName
              ? `https://ens-api.gregskril.com/avatar/${ensName}?width=64`
              : '/img/fallback-avatar.svg'
          }
          alt={ensName ?? truncateAddress(address)}
          className="size-8 rounded-full object-cover"
        />

        {ensName ?? truncateAddress(address)}
      </Button>
    )
  }

  return (
    <Button size="sm" className="rounded-full px-4" onClick={openConnectModal}>
      Connect Wallet
    </Button>
  )
}
