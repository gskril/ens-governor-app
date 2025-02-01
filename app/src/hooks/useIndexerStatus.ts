'use client'

import { useQuery } from '@tanstack/react-query'

interface IndexerStatus {
  isSyncing: boolean
  latestBlock: number
  chainHeadBlock: number
}

export function useIndexerStatus() {
  return useQuery({
    queryKey: ['indexer-status'],
    queryFn: async () => {
      const path = '/status'
      const url = new URL(path, process.env.NEXT_PUBLIC_PONDER_URL).toString()

      const response = await fetch(url, { next: { revalidate: 10 } })
      const data = (await response.json()) as IndexerStatus

      return data
    },
  })
}