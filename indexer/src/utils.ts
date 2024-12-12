import { Tokens, marked } from 'marked'

import { proposal } from '../ponder.schema'
import { Status } from './types'

function getFirstHeadingToken(description: string) {
  const tokens = marked.lexer(description)
  return tokens.find(
    (token) => token.type === 'heading' && token.depth === 1
  ) as Tokens.Heading | undefined
}

export function getTitle(description: string) {
  const firstHeading = getFirstHeadingToken(description)
  return firstHeading?.text ?? description.slice(0, 60) + '...'
}

export function removeTitle(description: string) {
  const firstHeading = getFirstHeadingToken(description)
  return description.slice(firstHeading?.raw.length)
}

// https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/governance/Governor.sol#L138
export function getPropStatus(prop: typeof proposal.$inferSelect): Status {
  const currentTimestamp = new Date().getTime() / 1000

  if (prop.executedAtTimestamp) return 'executed'
  if (prop.canceledAtTimestamp) return 'canceled'
  if (prop.queuedAtTimestamp) return 'queued'
  if (prop.startTimestamp > currentTimestamp) return 'pending'
  if (prop.endTimestamp >= currentTimestamp) return 'active'

  const quorumReached = getPropQuorumReached(prop)
  const positiveVote = prop.forVotes > prop.againstVotes

  if (positiveVote && quorumReached) return 'succeeded'
  return 'defeated'
}

export function getPropQuorumReached(prop: typeof proposal.$inferSelect) {
  const quorumVotes = prop.forVotes + prop.abstainVotes
  return quorumVotes >= prop.quorum
}
