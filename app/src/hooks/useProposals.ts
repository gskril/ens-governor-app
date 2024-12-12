import { useQuery } from '@tanstack/react-query'
import { EnhancedProposal } from 'indexer/types'

export function useProposals() {
  return useQuery({
    queryKey: ['proposals'],
    queryFn: async () => {
      return await getProposals()
    },
  })
}

export async function getProposals() {
  const path = '/proposals'
  const url = new URL(path, process.env.NEXT_PUBLIC_PONDER_URL).toString()

  const response = await fetch(url, { next: { revalidate: 10 } })
  const json = await response.json()
  const data = json as EnhancedProposal[]

  return data
}
