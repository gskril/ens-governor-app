import type { EstimateContractGasParameters, PublicClient } from 'viem'

// Wallets like MetaMask often overestimate gas, which makes transactions look
// (and sometimes be) more expensive than necessary. Estimating through our own
// RPC and attaching the results to the transaction makes wallets use them as
// the suggested values instead of estimating themselves.

// Headroom over the node's gas estimate so transactions don't run out of gas
// if state changes slightly between estimation and execution. Unused gas is
// refunded, so this doesn't increase the actual cost.
const GAS_LIMIT_BUFFER_PERCENT = BigInt(20)

export type GasParameters = {
  gas?: bigint
  maxFeePerGas?: bigint
  maxPriorityFeePerGas?: bigint
}

export async function estimateGasParameters(
  client: PublicClient | undefined,
  params: EstimateContractGasParameters
): Promise<GasParameters> {
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
