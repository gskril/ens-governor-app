import { graphql } from '@ponder/core'
import { replaceBigInts } from '@ponder/utils'

import { ponder } from '@/generated'

import { EnhancedProposal } from '../types'
import { getPropQuorumReached } from '../utils'
import { getPropStatus } from '../utils'

ponder.use('/', graphql())

ponder.get('/proposals', async (c) => {
  const props = await c.db.query.proposal.findMany({
    limit: 15,
    orderBy: (table, { desc }) => [desc(table.createdAtBlock)],
  })

  if (!props) {
    return c.json({ error: 'Proposals not found' }, 404)
  }

  const propsWithStatus = props.map((prop) => {
    const status = getPropStatus(prop)
    const quorumReached = getPropQuorumReached(prop)
    return { status, quorumReached, ...prop }
  })

  return c.json(replaceBigInts(propsWithStatus, (v) => String(v)))
})

ponder.get('/proposals/:proposalId', async (c) => {
  const proposalId = c.req.param('proposalId')
  const prop = await c.db.query.proposal.findFirst({
    where: (table, { eq }) => eq(table.id, BigInt(proposalId)),
    with: { votes: true },
  })

  if (!prop) {
    return c.json({ error: 'Proposal not found' }, 404)
  }

  const status = getPropStatus(prop)
  const quorumReached = getPropQuorumReached(prop)

  const enhancedProposal: EnhancedProposal = replaceBigInts(
    {
      status,
      quorumReached,
      ...prop,
    },
    (v) => String(v)
  )

  return c.json(enhancedProposal)
})
