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

  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(Number(value))
}

export function truncateAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}
