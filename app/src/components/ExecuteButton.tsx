'use client'

import { GovernorContract } from 'indexer/contracts'
import { EnhancedProposal } from 'indexer/types'
import {
  useAccount,
  useSimulateContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi'

import { cn } from '@/lib/utils'

import { Button, buttonVariants } from './ui/button'

export function ExecuteButton({ proposal }: { proposal: EnhancedProposal }) {
  const { address } = useAccount()
  const tx = useWriteContract()
  const receipt = useWaitForTransactionReceipt({ hash: tx.data })

  const data = {
    ...GovernorContract,
    functionName: 'execute',
    args: [
      proposal.targets, // targets
      proposal.values.map((value) => BigInt(value)), // values
      proposal.calldatas, // calldatas
      proposal.descriptionHash, // descriptionHash
    ],
  } as const

  const simulate = useSimulateContract({
    ...data,
    query: { enabled: !!address },
  })

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    tx.writeContract(data)
  }

  if (!simulate.data) return null

  if (!receipt.isSuccess) {
    return (
      <a
        className={cn(
          buttonVariants(),
          'bg-green-600 font-bold hover:bg-green-600/90'
        )}
        href={`https://etherscan.io/tx/${tx.data}`}
        target="_blank"
      >
        Success!
      </a>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <Button
        type="submit"
        variant="primary"
        className="font-bold"
        isLoading={tx.isPending || receipt.isLoading}
      >
        Execute
      </Button>
    </form>
  )
}
