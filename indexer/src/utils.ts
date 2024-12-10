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
