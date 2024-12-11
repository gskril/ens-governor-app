import { EnhancedProposal } from 'indexer/types'

import { Badge, BadgeProps } from './ui/badge'

type Props = {
  proposal: EnhancedProposal
} & React.HTMLAttributes<HTMLDivElement>

export function ProposalStatus({ proposal, className }: Props) {
  let variant: BadgeProps['variant'] = 'default'

  const successBadge: EnhancedProposal['status'][] = ['succeeded', 'executed']
  const failedBadge: EnhancedProposal['status'][] = ['canceled', 'defeated']

  if (successBadge.includes(proposal.status)) {
    variant = 'success'
  } else if (failedBadge.includes(proposal.status)) {
    variant = 'destructive'
  }

  return (
    <Badge variant={variant} className={className}>
      {proposal.status.toUpperCase()}
    </Badge>
  )
}
