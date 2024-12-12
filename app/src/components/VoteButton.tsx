'use client'

import { EnhancedProposal } from 'indexer/types'

import { Button } from './ui/button'

export function VoteButton({ proposal }: { proposal: EnhancedProposal }) {
  return (
    <Button className="bg-primary-brand hover:bg-primary-brand/90 font-bold">
      Vote Now
    </Button>
  )
}
