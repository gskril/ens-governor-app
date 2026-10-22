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

  try {
    const response = await fetch(url, { next: { revalidate: 10 } })
    if (!response.ok) return []

    const json = await response.json()
    // The indexer can return an error object instead of a list while it's down
    return Array.isArray(json) ? (json as EnhancedProposal[]) : []
  } catch {
    return []
  }
}
