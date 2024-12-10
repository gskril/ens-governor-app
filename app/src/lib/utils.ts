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

export function getQuorumProgress(proposal: EnhancedProposal) {
  const forVotes = BigInt(proposal.forVotes) / BigInt(1e18)
  const abstainVotes = BigInt(proposal.abstainVotes) / BigInt(1e18)
  const quorum = Number(BigInt(proposal.quorum) / BigInt(1e18))

  const countedVotes = Number(forVotes) + Number(abstainVotes)
  const progress = (countedVotes / quorum) * 100

  return Number(progress.toFixed(2))
}

export function getPercentageOfTotalVotes(
  numerator: string,
  proposal: EnhancedProposal
) {
  const againstVotes = BigInt(proposal.againstVotes) / BigInt(1e18)
  const forVotes = BigInt(proposal.forVotes) / BigInt(1e18)
  const abstainVotes = BigInt(proposal.abstainVotes) / BigInt(1e18)
  const totalVotes = againstVotes + forVotes + abstainVotes
  const num = BigInt(numerator) / BigInt(1e18)
  return (Number(num) / Number(totalVotes)) * 100
}
