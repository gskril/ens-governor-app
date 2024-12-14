import { type ClassValue, clsx } from 'clsx'
import { EnhancedProposal } from 'indexer/types'
import { twMerge } from 'tailwind-merge'
import { Address } from 'viem'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTimestamp(
  timestamp: string,
  options: { includeTime?: boolean; includeYear?: boolean } = {
    includeTime: false,
    includeYear: true,
  }
) {
  const date = new Date(Number(timestamp) * 1000)
  const isCurrentYear = date.getFullYear() === new Date().getFullYear()

  const base = date.toLocaleDateString('en-US', {
    year: options?.includeYear && !isCurrentYear ? 'numeric' : undefined,
    month: 'short',
    day: 'numeric',
  })

  const time = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    timeZoneName: 'short',
  })

  if (options?.includeTime) {
    return `${base} at ${time}`
  }

  return base
}

export function getTotalVotes(proposal: EnhancedProposal) {
  return (
    BigInt(proposal.forVotes) +
    BigInt(proposal.againstVotes) +
    BigInt(proposal.abstainVotes)
  )
}

export function bigintToFormattedString(count: bigint | string) {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(parseVotes(count))
}

function truncateAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function nameWithFallback(
  name: string | undefined | null,
  address: Address
) {
  if (name) {
    return name.length > 25 ? `${name.slice(0, 25)}...` : name
  }

  return truncateAddress(address)
}

export function getQuorumProgress(proposal: EnhancedProposal) {
  const forVotes = parseVotes(proposal.forVotes)
  const abstainVotes = parseVotes(proposal.abstainVotes)
  const quorum = parseVotes(proposal.quorum)

  const countedVotes = forVotes + abstainVotes
  const progress = (countedVotes / quorum) * 100

  return Number(progress.toFixed(2))
}

export function getPercentageOfTotalVotes(
  numerator: string,
  proposal: EnhancedProposal
) {
  const againstVotes = parseVotes(proposal.againstVotes)
  const forVotes = parseVotes(proposal.forVotes)
  const abstainVotes = parseVotes(proposal.abstainVotes)
  const totalVotes = againstVotes + forVotes + abstainVotes
  const num = parseVotes(numerator)
  return (num / totalVotes) * 100
}

/**
 * @param votes (Stringified) bigint of the unformatted votes
 * @returns Votes in a formatted number
 */
export function parseVotes(votes: string | bigint): number {
  return Number(BigInt(votes) / BigInt(1e18))
}
