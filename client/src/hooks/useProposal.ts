import { useQuery } from '@tanstack/react-query'
import { getProposal } from '@/lib/data'

export function useProposal(id: string) {
  return useQuery({
    queryKey: ['proposal', id],
    queryFn: async () => {
      return await getProposal(id)
    },
  })
}
