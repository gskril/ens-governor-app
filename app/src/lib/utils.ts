import { type ClassValue, clsx } from 'clsx'
import { EnhancedProposal } from 'indexer/types'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatStartDate(proposal: EnhancedProposal) {
  return new Date(
    Number(proposal.createdAtTimestamp) * 1000
  ).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatVotes(proposal: EnhancedProposal) {
  const value =
    (BigInt(proposal.forVotes) +
      BigInt(proposal.againstVotes) +
      BigInt(proposal.abstainVotes)) /
    BigInt(1e18)

  return formatVoteCount(value)
}

export function formatVoteCount(count: bigint) {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(Number(count))
}

export function truncateAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function getColorForVote(support: number) {
  switch (support) {
    case 0:
      return 'text-destructive'
    case 1:
      return 'text-green-600'
    default:
      return 'text-zinc-500'
  }
}
