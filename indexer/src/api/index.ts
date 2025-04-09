import { replaceBigInts } from '@ponder/utils'
import { Hono } from 'hono'
import { graphql } from 'ponder'
import { db } from 'ponder:api'
import schema from 'ponder:schema'

import { getPropQuorumReached } from '../utils'
import { getPropStatus } from '../utils'

const app = new Hono()

app.use('/', graphql({ db, schema }))
app.use('/graphql', graphql({ db, schema }))

app.get('/proposals', async (c) => {
  const props = await db.query.proposal.findMany({
    limit: 50,
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

app.get('/proposals/:proposalId', async (c) => {
  const proposalId = c.req.param('proposalId')
  const prop = await db.query.proposal.findFirst({
    where: (cols, { eq }) => eq(cols.id, BigInt(proposalId)),
    with: {
      votes: {
        orderBy: (cols, { desc }) => [desc(cols.weight)],
      },
    },
  })

  if (!prop) {
    return c.json({ error: 'Proposal not found' }, 404)
  }

  const status = getPropStatus(prop)
  const quorumReached = getPropQuorumReached(prop)

  const enhancedProposal = replaceBigInts(
    {
      status,
      quorumReached,
      ...prop,
    },
    (v) => String(v)
  )

  return c.json(enhancedProposal)
})

export default app
