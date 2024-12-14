import { replaceBigInts } from '@ponder/utils'
import { keccak256, toHex } from 'viem/utils'

import { ponder } from '@/generated'

import {
  proposal,
  proposalCanceledEvent,
  proposalCreatedEvent,
  proposalExecutedEvent,
  proposalQueuedEvent,
  quorumNumeratorUpdatedEvent,
  timelockChangeEvent,
  voteCastEvent,
} from '../ponder.schema'
import { getTitle, removeTitle } from './utils'

ponder.on('Governor:ProposalCanceled', async ({ event, context }) => {
  await context.db.insert(proposalCanceledEvent).values({
    ...event.args,
    id: event.log.id,
    timestamp: event.block.timestamp,
  })

  await context.db.update(proposal, { id: event.args.proposalId }).set({
    canceledAtTimestamp: event.block.timestamp,
  })
})

ponder.on('Governor:ProposalCreated', async ({ event, context }) => {
  await context.db.insert(proposalCreatedEvent).values({
    ...event.args,
    id: event.log.id,
    timestamp: event.block.timestamp,
    values: replaceBigInts(event.args.values, (v) => String(v)),
  })

  // Delay, in blocks, between the proposal is created and the vote starts
  const votingDelay = await context.client.readContract({
    ...context.contracts.Governor,
    functionName: 'votingDelay',
  })

  // Delay, in blocks, between the vote start and vote ends
  const votingPeriod = await context.client.readContract({
    ...context.contracts.Governor,
    functionName: 'votingPeriod',
  })

  // Minimum number of cast voted required for a proposal to be successful
  const quorum = await context.client.readContract({
    ...context.contracts.Governor,
    functionName: 'quorumVotes',
  })

  // Assume 12 second block time
  const startTimestamp = event.block.timestamp + votingDelay * 12n
  const endTimestamp = startTimestamp + votingPeriod * 12n

  await context.db.insert(proposal).values({
    ...event.args,
    id: event.args.proposalId,
    title: getTitle(event.args.description),
    createdAtBlock: event.block.number,
    createdAtTimestamp: event.block.timestamp,
    startTimestamp,
    endTimestamp,
    quorum,
    forVotes: 0n,
    againstVotes: 0n,
    abstainVotes: 0n,
    createTransaction: event.transaction.hash,
    descriptionHash: keccak256(toHex(event.args.description)),

    // Format raw args
    values: replaceBigInts(event.args.values, (v) => String(v)),
    description: removeTitle(event.args.description),
  })
})

ponder.on('Governor:ProposalExecuted', async ({ event, context }) => {
  await context.db.insert(proposalExecutedEvent).values({
    ...event.args,
    id: event.log.id,
    timestamp: event.block.timestamp,
    transaction: event.transaction.hash,
  })

  await context.db.update(proposal, { id: event.args.proposalId }).set({
    executedAtTimestamp: event.block.timestamp,
    executeTransaction: event.transaction.hash,
  })
})

ponder.on('Governor:ProposalQueued', async ({ event, context }) => {
  await context.db.insert(proposalQueuedEvent).values({
    ...event.args,
    id: event.log.id,
    timestamp: event.block.timestamp,
  })

  await context.db.update(proposal, { id: event.args.proposalId }).set({
    queuedAtTimestamp: event.block.timestamp,
  })
})

ponder.on('Governor:QuorumNumeratorUpdated', async ({ event, context }) => {
  await context.db.insert(quorumNumeratorUpdatedEvent).values({
    ...event.args,
    id: event.log.id,
    timestamp: event.block.timestamp,
  })
})

ponder.on('Governor:TimelockChange', async ({ event, context }) => {
  await context.db.insert(timelockChangeEvent).values({
    ...event.args,
    id: event.log.id,
    timestamp: event.block.timestamp,
  })
})

ponder.on('Governor:VoteCast', async ({ event, context }) => {
  // 0 = for, 1 = against, 2 = abstain
  await context.db.insert(voteCastEvent).values({
    ...event.args,
    id: event.log.id,
    timestamp: event.block.timestamp,
    transaction: event.transaction.hash,
  })

  if (event.args.support === 0) {
    await context.db
      .update(proposal, { id: event.args.proposalId })
      .set((row) => ({
        againstVotes: row.againstVotes + event.args.weight,
      }))
  }

  if (event.args.support === 1) {
    await context.db
      .update(proposal, { id: event.args.proposalId })
      .set((row) => ({
        forVotes: row.forVotes + event.args.weight,
      }))
  }

  if (event.args.support === 2) {
    await context.db
      .update(proposal, { id: event.args.proposalId })
      .set((row) => ({
        abstainVotes: row.abstainVotes + event.args.weight,
      }))
  }
})
