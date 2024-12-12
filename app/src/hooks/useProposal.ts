import { useQuery } from '@tanstack/react-query'
import { EnhancedProposal, EnhancedProposalWithVotes } from 'indexer/types'

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
  const url = new URL(path, process.env.NEXT_PUBLIC_PONDER_URL).toString()

  const response = await fetch(url, { next: { revalidate: 10 } })
  const json = await response.json()
  const data = json as EnhancedProposalWithVotes

  return data
}
