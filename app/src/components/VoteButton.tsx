'use client'

import { GovernorContract } from 'indexer/contracts'
import { EnhancedProposal } from 'indexer/types'
import { revalidatePath } from 'next/cache'
import { useEffect } from 'react'
import {
  useAccount,
  useBlockNumber,
  useReadContracts,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { bigintToFormattedString } from '@/lib/utils'

export function VoteButton({ proposal }: { proposal: EnhancedProposal }) {
  const { address } = useAccount()
  const { data: blockNumber } = useBlockNumber()
  const tx = useWriteContract()
  const receipt = useWaitForTransactionReceipt({ hash: tx.data })

  const multicall = useReadContracts({
    contracts: [
      {
        ...GovernorContract,
        functionName: 'hasVoted',
        // @ts-expect-error: the query is not run until the address and blockNumber are known
        args: [BigInt(proposal.id), address],
      },
      {
        ...GovernorContract,
        functionName: 'getVotes',
        // @ts-expect-error: the query is not run until the address and blockNumber are known
        args: [address, (blockNumber ?? BigInt(0)) - BigInt(1)],
      },
    ],
    query: {
      enabled: !!address && !!blockNumber,
    },
  })

  const hasVoted = multicall.data?.[0].result
  const votingPower = multicall.data?.[1].result

  useEffect(() => {
    if (receipt.isSuccess) {
      multicall.refetch()
      revalidatePath(`/proposal/${proposal.id}`)
    }
  }, [receipt.isSuccess])

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const choice = Number(formData.get('choice') as string)
    const reason = formData.get('reason') as string

    if (reason) {
      tx.writeContract({
        ...GovernorContract,
        functionName: 'castVoteWithReason',
        args: [BigInt(proposal.id), choice, reason],
      })
    } else {
      tx.writeContract({
        ...GovernorContract,
        functionName: 'castVote',
        args: [BigInt(proposal.id), choice],
      })
    }
  }

  if (!address) {
    return (
      <Button className="bg-primary-brand font-bold" disabled>
        Connect to Vote
      </Button>
    )
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="primary"
          className="font-bold"
          disabled={multicall.isLoading || hasVoted === true}
        >
          {hasVoted === true ? 'Already Voted' : 'Vote Now'}
        </Button>
      </DialogTrigger>

      <DialogContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold">
              Vote Onchain
            </DialogTitle>
            <DialogDescription className="text-base">
              Once submitted, your vote cannot be changed.
            </DialogDescription>
          </DialogHeader>

          {/* Select choice */}
          <div className="space-y-4">
            <RadioGroup defaultValue="1" name="choice" disabled={!!tx.data}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="1" id="1" />
                <Label htmlFor="1">For</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="0" id="0" />
                <Label htmlFor="0">Against</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="2" id="2" />
                <Label htmlFor="2">Abstain</Label>
              </div>
            </RadioGroup>

            <div className="space-y-0.5">
              <Label htmlFor="reason">Reason</Label>
              <Textarea
                id="reason"
                name="reason"
                placeholder="I believe..."
                disabled={!!tx.data}
              />
            </div>
          </div>

          <DialogFooter className="!flex-col items-end gap-1.5">
            <div className="flex items-center gap-2">
              <DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose>

              {receipt.isSuccess ? (
                <DialogClose asChild>
                  <Button className="bg-green-600 font-bold hover:bg-green-600/90">
                    Success!
                  </Button>
                </DialogClose>
              ) : (
                <Button
                  type="submit"
                  variant="primary"
                  className="font-bold"
                  isLoading={tx.isPending || receipt.isLoading}
                >
                  Vote with {bigintToFormattedString(votingPower ?? '0')} $ENS
                </Button>
              )}
            </div>

            {tx.data && (
              <a
                href={`https://etherscan.io/tx/${tx.data}`}
                target="_blank"
                className="flex items-center gap-1 text-sm text-muted-foreground hover:underline"
              >
                View on Etherscan
              </a>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
