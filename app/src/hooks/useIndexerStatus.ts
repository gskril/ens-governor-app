import { useEffect, useState } from 'react'

export function useIndexerStatus() {
  const [isIndexerBehind, setIsIndexerBehind] = useState(false)

  useEffect(() => {
    const checkIndexerStatus = async () => {
      try {
        const response = await fetch(
          new URL('ready', process.env.NEXT_PUBLIC_PONDER_URL)
        )
        setIsIndexerBehind(!response.ok)
      } catch (error) {
        setIsIndexerBehind(true)
      }
    }

    // Check immediately
    checkIndexerStatus()

    // Then check every 30 seconds
    const interval = setInterval(checkIndexerStatus, 30000)

    return () => clearInterval(interval)
  }, [])

  return { isIndexerBehind }
}