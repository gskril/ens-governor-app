import { Hono } from 'hono'
import { cors } from 'hono/cors'
import type { ApiResponse } from 'shared/dist'
import { generateHtml } from './html'
import { getProposal } from './proposals'

export const app = new Hono()
  .basePath('/api')

  .use(cors())

  .get('/', (c) => {
    return c.text('Hello Hono!')
  })

  .get('/hello', async (c) => {
    const data: ApiResponse = {
      message: 'Hello BHVR!',
      success: true,
    }

    return c.json(data, { status: 200 })
  })

  .get('/ssr', async (c) => {
    return c.html(
      // I wonder if the contents of the html page matter or just the meta tags ?
      generateHtml({
        title: 'ENS Executable Proposals',
        description:
          'View and vote on executable proposals from the ENS Protocol and DAO.',
      })
    )
  })

  .get('/ssr/proposal/:id', async (c) => {
    const id = c.req.param('id')
    const proposal = await getProposal(id)
    if (!proposal) return c.notFound()

    return c.html(
      generateHtml({
        title: proposal.title,
        description: 'An executable proposal to ENS DAO.',
      })
    )
  })

export default app
