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

interface Props {
  proposal: EnhancedProposal
  action: 'execute' | 'queue'
}

export function ProposalActionButton({ proposal, action }: Props) {
  const { address } = useAccount()
  const tx = useWriteContract()
  const receipt = useWaitForTransactionReceipt({ hash: tx.data })

  const data = {
    ...GovernorContract,
    functionName: action,
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

  if (receipt.isSuccess) {
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
        className="w-full font-bold capitalize"
        isLoading={tx.isPending || receipt.isLoading}
      >
        {action}
      </Button>
    </form>
  )
}
