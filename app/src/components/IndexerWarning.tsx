'use client'

import { useIndexerStatus } from '@/hooks/useIndexerStatus'

export function IndexerWarning() {
  const { data: indexerStatus } = useIndexerStatus()

  if (!indexerStatus?.isSyncing) {
    return null
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-yellow-100 p-2 text-center text-sm text-yellow-800">
      The indexer is syncing. Some data may be outdated.
    </div>
  )
}