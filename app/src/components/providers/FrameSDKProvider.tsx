'use client'

import frameSDK, { type FrameContext } from '@farcaster/frame-sdk'
import { createContext, useEffect, useState } from 'react'

interface FrameContextValue {
  context: FrameContext | undefined
  isLoaded: boolean
}

const FrameSDKContext = createContext<FrameContextValue | undefined>(undefined)

export function FrameSDKProvider({ children }: { children: React.ReactNode }) {
  const [isFrameSDKLoaded, setIsFrameSDKLoaded] = useState(false)
  const [context, setContext] = useState<FrameContext>()

  useEffect(() => {
    const load = async () => {
      setContext(await frameSDK.context)
      frameSDK.actions.ready({})
    }
    if (frameSDK && !isFrameSDKLoaded) {
      setIsFrameSDKLoaded(true)
      load()
    }
  }, [isFrameSDKLoaded])

  return (
    <FrameSDKContext.Provider value={{ context, isLoaded: isFrameSDKLoaded }}>
      {children}
    </FrameSDKContext.Provider>
  )
}
