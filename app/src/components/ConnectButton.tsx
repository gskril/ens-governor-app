'use client'

import { useConnectModal } from '@rainbow-me/rainbowkit'
import { useAccount, useDisconnect, useEnsName } from 'wagmi'

import { Button, buttonVariants } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { truncateAddress } from '@/lib/utils'

export function ConnectButton() {
  const { openConnectModal } = useConnectModal()
  const { disconnect } = useDisconnect()

  const { address } = useAccount()
  const { data: ensName } = useEnsName({ address })

  if (address) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger
          className={buttonVariants({
            size: 'sm',
            className:
              'h-fit !gap-1.5 !rounded-full bg-primary pb-1 pl-1 pr-4 pt-1 text-primary-foreground hover:bg-primary/90',
          })}
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
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => disconnect()}>
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <Button className="rounded-full px-4" onClick={openConnectModal}>
      Connect Wallet
    </Button>
  )
}
