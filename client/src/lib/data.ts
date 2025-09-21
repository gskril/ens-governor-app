import type { EnhancedProposal, EnhancedProposalWithVotes } from 'indexer/types'

export async function getProposals() {
  const path = '/proposals'
  const url = new URL(path, import.meta.env.PUBLIC_PONDER_URL).toString()

  const response = await fetch(url)
  const json = await response.json()
  const data = json as EnhancedProposal[]

  return data
}

export async function getProposal(id: string) {
  const path = `/proposals/${id}`
  const url = new URL(path, import.meta.env.PUBLIC_PONDER_URL).toString()

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Failed to fetch proposal')
  }
  const json = await response.json()
  const data = json as EnhancedProposalWithVotes

  return data
}
