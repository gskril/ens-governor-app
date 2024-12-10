import { onchainTable } from '@ponder/core'

export const proposalCanceledEvent = onchainTable(
  'proposalCanceledEvent',
  (t) => ({
    id: t.text().primaryKey(),
    timestamp: t.bigint(),
    proposalId: t.bigint(),
  })
)

export const proposalCreatedEvent = onchainTable(
  'proposalCreatedEvent',
  (t) => ({
    id: t.text().primaryKey(),
    timestamp: t.bigint(),
    proposalId: t.bigint(),
    proposer: t.hex(),
    targets: t.jsonb(),
    values: t.jsonb(),
    signatures: t.jsonb(),
    calldatas: t.jsonb(),
    startBlock: t.bigint(),
    endBlock: t.bigint(),
    description: t.text(),
  })
)

export const proposalExecutedEvent = onchainTable(
  'proposalExecutedEvent',
  (t) => ({
    id: t.text().primaryKey(),
    timestamp: t.bigint(),
    proposalId: t.bigint(),
  })
)

export const proposalQueuedEvent = onchainTable('proposalQueuedEvent', (t) => ({
  id: t.text().primaryKey(),
  timestamp: t.bigint(),
  proposalId: t.bigint(),
  eta: t.bigint(),
}))

export const quorumNumeratorUpdatedEvent = onchainTable(
  'quorumNumeratorUpdatedEvent',
  (t) => ({
    id: t.text().primaryKey(),
    timestamp: t.bigint(),
    oldQuorumNumerator: t.bigint(),
    newQuorumNumerator: t.bigint(),
  })
)

export const timelockChangeEvent = onchainTable('timelockChangeEvent', (t) => ({
  id: t.text().primaryKey(),
  timestamp: t.bigint(),
  oldTimelock: t.hex(),
  newTimelock: t.hex(),
}))

export const voteCastEvent = onchainTable('voteCastEvent', (t) => ({
  id: t.text().primaryKey(),
  timestamp: t.bigint(),
  voter: t.hex(),
  proposalId: t.bigint(),
  support: t.integer(),
  weight: t.bigint(),
  reason: t.text(),
}))
