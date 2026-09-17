'use client'

import { useEffect, useState } from 'react'

import { PONDER_URL } from '@/lib/constants'

const CHECK_INTERVAL_MS = 15000

/**
 * Polls the Ponder indexer's `/ready` endpoint. Returns `true` when the
 * indexer responds with HTTP 200 (caught up) and `false` when it does not
 * (falling behind, erroring, or unreachable). Assumes ready until the first
 * check completes so we don't flash a warning on every page load.
 */
export function useIndexerStatus() {
  const [isReady, setIsReady] = useState(true)

  useEffect(() => {
    if (!PONDER_URL) return

    let cancelled = false

    const check = async () => {
      let ready = false

      try {
        const res = await fetch(new URL('ready', PONDER_URL).toString(), {
          method: 'GET',
          cache: 'no-store',
        })
        ready = res.status === 200
      } catch {
        ready = false
      }

      if (!cancelled) setIsReady(ready)
    }

    check()
    const interval = setInterval(check, CHECK_INTERVAL_MS)

    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])

  return isReady
}
