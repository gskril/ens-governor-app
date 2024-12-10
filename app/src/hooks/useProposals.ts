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
  const baseUrl = 'http://localhost:42069'
  const path = '/proposals'
  const url = new URL(path, baseUrl).toString()

  const response = await fetch(url)
  const json = await response.json()
  const data = json as EnhancedProposal[]

  return data
}
