import { onchainTable, relations } from '@ponder/core'

export const proposal = onchainTable('proposal', (t) => ({
  id: t.bigint().primaryKey(),
  title: t.text().notNull(),
  createdAtBlock: t.bigint().notNull(),
  createdAtTimestamp: t.bigint().notNull(),
  startTimestamp: t.bigint().notNull(),
  endTimestamp: t.bigint().notNull(),
  queuedAtTimestamp: t.bigint(),
  executedAtTimestamp: t.bigint(),
  canceledAtTimestamp: t.bigint(),
  quorum: t.bigint().notNull(),
  forVotes: t.bigint().notNull(),
  againstVotes: t.bigint().notNull(),
  abstainVotes: t.bigint().notNull(),
  createTransaction: t.hex().notNull(),
  executeTransaction: t.hex(),

  // Raw from contract
  proposer: t.hex().notNull(),
  targets: t.jsonb().notNull(),
  values: t.jsonb().notNull(),
  signatures: t.jsonb().notNull(),
  calldatas: t.jsonb().notNull(),
  startBlock: t.bigint().notNull(),
  endBlock: t.bigint().notNull(),
  description: t.text().notNull(),
}))

export const proposalRelations = relations(proposal, ({ many }) => ({
  votes: many(voteCastEvent),
}))

export const proposalCanceledEvent = onchainTable(
  'proposalCanceledEvent',
  (t) => ({
    id: t.text().primaryKey(),
    timestamp: t.bigint().notNull(),
    proposalId: t.bigint().notNull(),
  })
)

export const proposalCreatedEvent = onchainTable(
  'proposalCreatedEvent',
  (t) => ({
    id: t.text().primaryKey(),
    timestamp: t.bigint().notNull(),
    proposalId: t.bigint().notNull(),
    proposer: t.hex().notNull(),
    targets: t.jsonb().notNull(),
    values: t.jsonb().notNull(),
    signatures: t.jsonb().notNull(),
    calldatas: t.jsonb().notNull(),
    startBlock: t.bigint().notNull(),
    endBlock: t.bigint().notNull(),
    description: t.text().notNull(),
  })
)

export const proposalExecutedEvent = onchainTable(
  'proposalExecutedEvent',
  (t) => ({
    id: t.text().primaryKey(),
    timestamp: t.bigint().notNull(),
    transaction: t.hex().notNull(),
    proposalId: t.bigint().notNull(),
  })
)

export const proposalQueuedEvent = onchainTable('proposalQueuedEvent', (t) => ({
  id: t.text().primaryKey(),
  timestamp: t.bigint().notNull(),
  proposalId: t.bigint().notNull(),
  eta: t.bigint().notNull(),
}))

export const quorumNumeratorUpdatedEvent = onchainTable(
  'quorumNumeratorUpdatedEvent',
  (t) => ({
    id: t.text().primaryKey(),
    timestamp: t.bigint().notNull(),
    oldQuorumNumerator: t.bigint().notNull(),
    newQuorumNumerator: t.bigint().notNull(),
  })
)

export const timelockChangeEvent = onchainTable('timelockChangeEvent', (t) => ({
  id: t.text().primaryKey(),
  timestamp: t.bigint().notNull(),
  oldTimelock: t.hex().notNull(),
  newTimelock: t.hex().notNull(),
}))

export const voteCastEvent = onchainTable('voteCastEvent', (t) => ({
  id: t.text().primaryKey(),
  timestamp: t.bigint().notNull(),
  transaction: t.hex().notNull(),
  voter: t.hex().notNull(),
  proposalId: t.bigint().notNull(),
  support: t.integer().notNull(),
  weight: t.bigint().notNull(),
  reason: t.text().notNull(),
}))

export const voteCastEventRelations = relations(voteCastEvent, ({ one }) => ({
  proposal: one(proposal, {
    fields: [voteCastEvent.proposalId],
    references: [proposal.id],
  }),
}))
