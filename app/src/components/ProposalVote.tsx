'use client'

import { EnhancedProposalWithVotes } from 'indexer/types'
import { useEnsName } from 'wagmi'

import { bigintToFormattedString, cn } from '@/lib/utils'
import { truncateAddress } from '@/lib/utils'

import { Typography } from './ui/typography'

type Props = { vote: EnhancedProposalWithVotes['votes'][number] }

export function ProposalVote({ vote }: Props) {
  const { data: ensName } = useEnsName({ address: vote.voter })

  return (
    <div key={vote.id} className="space-y-1.5 text-sm font-medium">
      <div className="flex w-full justify-between gap-4">
        <div className="flex items-center gap-1">
          <img
            src={
              ensName
                ? `https://ens-api.gregskril.com/avatar/${ensName}?width=48`
                : '/img/fallback-avatar.svg'
            }
            alt={ensName ?? truncateAddress(vote.voter)}
            className="size-6 rounded-full object-cover"
          />
          <a
            href={
              ensName
                ? `https://app.ens.domains/${ensName}`
                : `https://etherscan.io/address/${vote.voter}`
            }
            target="_blank"
            rel="noreferrer"
          >
            {ensName ?? truncateAddress(vote.voter)}
          </a>
          <span
            className={cn(
              vote.support === 0 && 'text-destructive',
              vote.support === 1 && 'text-green-600',
              vote.support === 2 && 'text-zinc-500',
              'font-medium'
            )}
          >
            {vote.support === 0
              ? 'voted against'
              : vote.support === 1
                ? 'voted for'
                : 'abstained'}
          </span>
        </div>

        <div>{bigintToFormattedString(vote.weight)}</div>
      </div>

      {vote.reason && (
        <Typography as="span" className="block text-zinc-600">
          {vote.reason}
        </Typography>
      )}
    </div>
  )
}
