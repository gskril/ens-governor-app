import { ponder } from '@/generated'

import {
  proposalCanceledEvent,
  proposalCreatedEvent,
  proposalExecutedEvent,
  proposalQueuedEvent,
  quorumNumeratorUpdatedEvent,
  timelockChangeEvent,
  voteCastEvent,
} from '../ponder.schema'
import { arrayToJsonb } from './utils'

ponder.on('Governor:ProposalCanceled', async ({ event, context }) => {
  await context.db.insert(proposalCanceledEvent).values({
    ...event.args,
    id: event.log.id,
    timestamp: event.block.timestamp,
  })
})

ponder.on('Governor:ProposalCreated', async ({ event, context }) => {
  await context.db.insert(proposalCreatedEvent).values({
    ...event.args,
    id: event.log.id,
    timestamp: event.block.timestamp,
    targets: arrayToJsonb(event.args.targets),
    values: arrayToJsonb(event.args.values),
    signatures: arrayToJsonb(event.args.signatures),
    calldatas: arrayToJsonb(event.args.calldatas),
  })
})

ponder.on('Governor:ProposalExecuted', async ({ event, context }) => {
  await context.db.insert(proposalExecutedEvent).values({
    ...event.args,
    id: event.log.id,
    timestamp: event.block.timestamp,
  })
})

ponder.on('Governor:ProposalQueued', async ({ event, context }) => {
  await context.db.insert(proposalQueuedEvent).values({
    ...event.args,
    id: event.log.id,
    timestamp: event.block.timestamp,
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
  await context.db.insert(voteCastEvent).values({
    ...event.args,
    id: event.log.id,
    timestamp: event.block.timestamp,
  })
})
