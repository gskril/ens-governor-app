import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import { ProposalStatus } from '@/components/ProposalStatus'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Typography } from '@/components/ui/typography'
import { getProposal } from '@/hooks/useProposal'
import { formatStartDate, truncateAddress } from '@/lib/utils'

type PageProps = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const proposal = await getProposal((await params).id)

  return {
    title: proposal.title,
  }
}

export default async function ProposalPage({ params }: PageProps) {
  const proposal = await getProposal((await params).id)

  return (
    <main className="space-y-6 p-6">
      <Link href="/" className="flex items-center gap-2 font-semibold">
        <ArrowLeft className="size-4" />
        Home
      </Link>

      <Card>
        <CardContent className="space-y-4 p-6">
          <ProposalStatus proposal={proposal} />
          <Typography as="h1">{proposal.title}</Typography>

          <hr />

          <Typography className="mb-2 block">
            Proposed by{' '}
            <a
              href={`https://etherscan.io/address/${proposal.proposer}`}
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              {truncateAddress(proposal.proposer)}
            </a>{' '}
            on {formatStartDate(proposal)}
          </Typography>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <ReactMarkdown
            components={{
              h1: ({ children }) => (
                <Typography as="h1" className="mb-6">
                  {children}
                </Typography>
              ),
              h2: ({ children }) => (
                <Typography as="h2" className="mb-2">
                  {children}
                </Typography>
              ),
              h3: ({ children }) => <Typography as="h3">{children}</Typography>,
              h4: ({ children }) => <Typography as="h4">{children}</Typography>,
              h5: ({ children }) => <Typography as="h5">{children}</Typography>,
              h6: ({ children }) => <Typography as="h6">{children}</Typography>,
              p: ({ children }) => <Typography as="p">{children}</Typography>,
              a: ({ children, href }) => (
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="underline"
                >
                  {children}
                </a>
              ),
              ul: ({ children }) => (
                <ul className="my-6 ml-6 list-disc [&>li]:mt-2">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="my-6 ml-6 list-decimal [&>li]:mt-2">
                  {children}
                </ol>
              ),
              table: ({ children }) => (
                <div className="my-6 rounded border">
                  <Table>{children}</Table>
                </div>
              ),
              thead: ({ children }) => <TableHeader>{children}</TableHeader>,
              tbody: ({ children }) => <TableBody>{children}</TableBody>,
              tfoot: ({ children }) => <TableFooter>{children}</TableFooter>,
              tr: ({ children }) => <TableRow>{children}</TableRow>,
              th: ({ children }) => <TableHead>{children}</TableHead>,
              td: ({ children }) => <TableCell>{children}</TableCell>,
              caption: ({ children }) => (
                <TableCaption>{children}</TableCaption>
              ),
              hr: () => <hr className="my-6" />,
              pre: ({ children }) => (
                <pre className="bg-muted my-6 max-w-full overflow-x-auto rounded-md p-4">
                  {children}
                </pre>
              ),
            }}
            remarkPlugins={[remarkGfm]}
          >
            {proposal.description}
          </ReactMarkdown>
        </CardContent>
      </Card>
    </main>
  )
}
