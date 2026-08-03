import { useQuery } from '@tanstack/react-query'
import type { Address, Hex, PublicClient } from 'viem'
import { usePublicClient } from 'wagmi'

import { decodeCall } from '@/lib/decode'

type Params = {
  target: Address
  calldata: Hex
  signature?: string
}

/**
 * Decodes a proposal action into a human readable function call. Resolves to
 * `null` when the calldata can't be decoded, in which case the raw calldata is
 * all we have to show.
 */
export function useDecodedCalldata({ target, calldata, signature }: Params) {
  const client = usePublicClient()

  return useQuery({
    queryKey: ['decoded-calldata', target, calldata, signature],
    enabled: !!client,
    // Proposal calldata is immutable, so there's nothing to refetch
    staleTime: Infinity,
    retry: false,
    queryFn: async () => {
      return await decodeCall({
        target,
        calldata,
        signature,
        client: client as PublicClient,
      })
    },
  })
}
