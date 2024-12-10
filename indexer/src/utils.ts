import { Tokens, marked } from 'marked'

import { proposal } from '../ponder.schema'

export function getTitle(description: string) {
  const tokens = marked.lexer(description)
  const firstHeading = tokens.find(
    (token) => token.type === 'heading' && token.depth === 1
  ) as Tokens.Heading

  return firstHeading?.text ?? description.slice(0, 60) + '...'
}

type Status =
  | 'pending'
  | 'active'
  | 'canceled'
  | 'defeated'
  | 'succeeded'
  | 'queued'
  | 'executed'
  | 'expired'

export function getPropStatus(prop: typeof proposal.$inferSelect): Status {
  const currentTimestamp = new Date().getTime() / 1000

  if (
    prop.startTimestamp <= currentTimestamp &&
    prop.endTimestamp >= currentTimestamp
  ) {
    return 'active'
  } else if (prop.startTimestamp > currentTimestamp) {
    return 'pending'
  } else if (prop.endTimestamp < currentTimestamp) {
    if (prop.executedAtTimestamp) {
      return 'executed'
    } else if (prop.canceledAtTimestamp) {
      return 'canceled'
    } else if (prop.queuedAtTimestamp) {
      return 'queued'
    } else {
      if (prop.forVotes > prop.againstVotes && getPropQuorumReached(prop)) {
        return 'succeeded'
      } else {
        return 'defeated'
      }
    }
  } else {
    return 'queued'
  }
}

export function getPropQuorumReached(prop: typeof proposal.$inferSelect) {
  const quorumVotes = prop.forVotes + prop.abstainVotes
  return quorumVotes >= prop.quorum
}
