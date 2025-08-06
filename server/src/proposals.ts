// TODO: This is a copy of the client/src/hooks/useProposal.ts file so we should move that to `shared`
import type { EnhancedProposalWithVotes } from 'indexer/types'

const ponderUrl = 'https://ens-governor.ponder-dev.com/'

export async function getProposal(id: string) {
  const path = `/proposals/${id}`
  const url = new URL(path, ponderUrl).toString()

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Failed to fetch proposal')
  }
  const json = await response.json()
  const data = json as EnhancedProposalWithVotes

  return data
}
