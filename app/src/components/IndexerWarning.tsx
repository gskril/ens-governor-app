import { useIndexerStatus } from '@/hooks/useIndexerStatus'

export function IndexerWarning() {
  const { isIndexerBehind } = useIndexerStatus()

  if (!isIndexerBehind) return null

  return (
    <div className="bg-yellow-100 border-b border-yellow-200 p-2">
      <p className="text-center text-sm text-yellow-800">
        The data shown may be delayed as our indexer is currently catching up
      </p>
    </div>
  )
}