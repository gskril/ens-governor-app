import { useQuery } from '@tanstack/react-query'
import { EnhancedProposalWithVotes } from 'indexer/types'

export function useProposal(id: string) {
  return useQuery({
    queryKey: ['proposal', id],
    queryFn: async () => {
      return await getProposal(id)
    },
  })
}

export async function getProposal(id: string) {
  const path = `/proposals/${id}`
  const url = new URL(path, import.meta.env.VITE_PONDER_URL).toString()

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Failed to fetch proposal')
  }
  const json = await response.json()
  const data = json as EnhancedProposalWithVotes

  return data
}
