import { useMutation } from '@tanstack/react-query'
import type {
  Abi,
  Address,
  EstimateContractGasParameters,
  PublicClient,
} from 'viem'
import { useAccount, usePublicClient, useWriteContract } from 'wagmi'

type EstimatedWriteContractParameters = {
  abi: Abi
  address: Address
  functionName: string
  args?: readonly unknown[]
  value?: bigint
}

// Wallets like MetaMask often overestimate gas, which makes transactions look
// (and sometimes be) more expensive than necessary. Estimating through our own
// RPC and attaching the results to the transaction makes wallets use them as
// the suggested values instead of estimating themselves.

// Headroom over the node's gas estimate so transactions don't run out of gas
// if state changes slightly between estimation and execution. Unused gas is
// refunded, so this doesn't increase the actual cost.
const GAS_LIMIT_BUFFER_PERCENT = BigInt(20)

async function estimateGasParameters(
  client: PublicClient | undefined,
  params: EstimateContractGasParameters
) {
  if (!client) return {}

  try {
    const [gas, fees] = await Promise.all([
      client.estimateContractGas(params),
      client.estimateFeesPerGas(),
    ])

    return {
      gas: (gas * (BigInt(100) + GAS_LIMIT_BUFFER_PERCENT)) / BigInt(100),
      maxFeePerGas: fees.maxFeePerGas,
      maxPriorityFeePerGas: fees.maxPriorityFeePerGas,
    }
  } catch (error) {
    // Fall back to the wallet's own estimation instead of blocking the tx
    console.error('Gas estimation failed:', error)
    return {}
  }
}

// Drop-in alternative to `useWriteContract` that estimates gas before writing.
// `isPending` covers both the estimation and the wallet confirmation.
export function useEstimatedWriteContract() {
  const { address } = useAccount()
  const publicClient = usePublicClient()
  const { writeContractAsync } = useWriteContract()

  const mutation = useMutation({
    mutationFn: async (params: EstimatedWriteContractParameters) => {
      const gasParams = await estimateGasParameters(publicClient, {
        ...params,
        account: address,
      })

      return writeContractAsync({ ...params, ...gasParams })
    },
  })

  return { ...mutation, writeContract: mutation.mutate }
}
