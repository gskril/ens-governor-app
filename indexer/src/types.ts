import { proposal } from '../ponder.schema'

export type Status =
  | 'pending'
  | 'active'
  | 'canceled'
  | 'defeated'
  | 'succeeded'
  | 'queued'
  | 'executed'
  | 'expired'

type ReplaceBigInts<T> = T extends bigint
  ? string
  : T extends Array<infer U>
    ? Array<ReplaceBigInts<U>>
    : T extends object
      ? { [K in keyof T]: ReplaceBigInts<T[K]> }
      : T

export type EnhancedProposal = ReplaceBigInts<typeof proposal.$inferSelect> & {
  status: Status
  quorumReached: boolean
}
