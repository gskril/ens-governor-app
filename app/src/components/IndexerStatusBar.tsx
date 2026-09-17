'use client'

import { AlertTriangle } from 'lucide-react'

import { useIndexerStatus } from '@/hooks/useIndexerStatus'

/**
 * Renders a warning banner at the top of the page when the Ponder indexer is
 * not reporting that it is caught up (i.e. its `/ready` endpoint is not 200).
 */
export function IndexerStatusBar() {
  const isReady = useIndexerStatus()

  if (isReady) return null

  return (
    <div
      role="status"
      className="flex w-full items-center justify-center gap-2 bg-amber-100 px-4 py-2 text-sm font-medium text-amber-900"
    >
      <AlertTriangle className="h-4 w-4" />
      Data may be delayed
    </div>
  )
}
