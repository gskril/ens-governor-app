import { EnhancedProposalWithVotes } from 'indexer/types'

import { Typography } from '@/components/ui/typography'
import {
  bigintToFormattedString,
  cn,
  getPercentageOfTotalVotes,
} from '@/lib/utils'

type Props = {
  proposal: EnhancedProposalWithVotes
  voteType: 'for' | 'against' | 'abstain'
}

export function VoteBar({ proposal, voteType }: Props) {
  const key = `${voteType}Votes` as const

  return (
    <div className="relative overflow-hidden rounded bg-zinc-100">
      <div className="relative z-10 flex justify-between gap-2 p-2 text-sm capitalize leading-none">
        <Typography className="font-medium">
          {bigintToFormattedString(proposal[key])}
        </Typography>

        <Typography>{voteType}</Typography>
      </div>

      <div
        className={cn(
          'absolute left-0 top-0 z-0 h-full rounded',
          voteType === 'for' && 'bg-green-600/40',
          voteType === 'against' && 'bg-destructive/40',
          voteType === 'abstain' && 'bg-zinc-200'
        )}
        style={{
          width: `${getPercentageOfTotalVotes(proposal[key], proposal)}%`,
        }}
      />
    </div>
  )
}
