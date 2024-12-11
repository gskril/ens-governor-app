'use client'

import { EnhancedProposalWithVotes } from 'indexer/types'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useEnsName } from 'wagmi'

import { ProposalStatus } from '@/components/ProposalStatus'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import {
  bigintToFormattedString,
  cn,
  formatTimestamp,
  getPercentageOfTotalVotes,
  getQuorumProgress,
  truncateAddress,
} from '@/lib/utils'

type Props = {
  proposal: EnhancedProposalWithVotes
}

export function ProposalPageClient({ proposal }: Props) {
  const { data: proposerEnsName } = useEnsName({ address: proposal.proposer })

  return (
    <main className="container">
      <Link href="/" className="flex items-center gap-2 font-semibold">
        <ArrowLeft className="size-4" />
        Home
      </Link>

      <Card>
        <CardContent className="space-y-4 p-6">
          <ProposalStatus proposal={proposal} />
          <Typography as="h1">{proposal.title}</Typography>

          <hr />

          <Typography className="mb-2 flex">
            Proposed by{' '}
            <div className="mx-1.5 flex items-center gap-1">
              {proposerEnsName && (
                <img
                  src={`https://ens-api.gregskril.com/avatar/${proposerEnsName}?width=48`}
                  alt={proposerEnsName}
                  className="size-6 rounded-full object-cover"
                />
              )}
              <a
                href={`https://etherscan.io/address/${proposal.proposer}`}
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                {proposerEnsName ?? truncateAddress(proposal.proposer)}
              </a>
            </div>
            on {formatTimestamp(proposal.createdAtTimestamp)}
          </Typography>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[5fr_2fr]">
        {/* Proposal body */}
        <Card className="h-fit max-w-full overflow-x-auto">
          <CardContent className="max-w-full p-6">
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
                h3: ({ children }) => (
                  <Typography as="h3">{children}</Typography>
                ),
                h4: ({ children }) => (
                  <Typography as="h4">{children}</Typography>
                ),
                h5: ({ children }) => (
                  <Typography as="h5">{children}</Typography>
                ),
                h6: ({ children }) => (
                  <Typography as="h6">{children}</Typography>
                ),
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
                  <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
                    {children}
                  </ul>
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

        {/* Votes */}
        <Card className="sticky top-6 h-fit">
          <CardHeader className="space-y-2">
            <CardTitle>Votes</CardTitle>

            {/* Quorum bar */}
            <div className="space-y-1">
              <Typography className="text-sm text-zinc-500">
                Quorum progress: {getQuorumProgress(proposal)}%
              </Typography>
              <div className="h-2 overflow-hidden rounded bg-zinc-200">
                <div
                  className="h-full rounded bg-green-600"
                  style={{
                    width: `${getQuorumProgress(proposal)}%`,
                  }}
                />
              </div>
            </div>

            {/* For votes */}
            <div className="space-y-1">
              <Typography className="text-sm text-zinc-500">
                For votes: {bigintToFormattedString(proposal.forVotes)}
              </Typography>
              <div className="h-2 overflow-hidden rounded bg-zinc-200">
                <div
                  className="h-full rounded bg-green-600"
                  style={{
                    width: `${getPercentageOfTotalVotes(proposal.forVotes, proposal)}%`,
                  }}
                />
              </div>
            </div>

            {/* Against votes */}
            <div className="space-y-1">
              <Typography className="text-sm text-zinc-500">
                Against votes: {bigintToFormattedString(proposal.againstVotes)}
              </Typography>
              <div className="h-2 overflow-hidden rounded bg-zinc-200">
                <div
                  className="bg-destructive h-full rounded"
                  style={{
                    width: `${getPercentageOfTotalVotes(proposal.againstVotes, proposal)}%`,
                  }}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {proposal.votes.map((vote) => {
              return <Vote key={vote.id} vote={vote} />
            })}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

function Vote({ vote }: { vote: EnhancedProposalWithVotes['votes'][number] }) {
  const { data: ensName } = useEnsName({ address: vote.voter })

  return (
    <div key={vote.id} className="space-y-1.5 text-sm">
      <div className="flex w-full justify-between gap-4">
        <div className="flex items-center">
          <img
            src={
              ensName
                ? `https://ens-api.gregskril.com/avatar/${ensName}?width=48`
                : '/img/fallback-avatar.svg'
            }
            alt={ensName ?? truncateAddress(vote.voter)}
            className="size-6 rounded-full object-cover"
          />
          <a
            href={`https://etherscan.io/address/${vote.voter}`}
            target="_blank"
            rel="noreferrer"
            className="ml-1.5 mr-1"
          >
            {ensName ?? truncateAddress(vote.voter)}
          </a>
          <span
            className={cn(
              vote.support === 0 && 'text-destructive',
              vote.support === 1 && 'text-green-600',
              vote.support === 2 && 'text-zinc-500',
              'font-medium'
            )}
          >
            {vote.support === 0
              ? 'voted against'
              : vote.support === 1
                ? 'voted for'
                : 'abstained'}
          </span>
        </div>

        <div>{bigintToFormattedString(vote.weight)}</div>
      </div>

      {vote.reason && (
        <Typography as="span" className="block text-zinc-600">
          {vote.reason}
        </Typography>
      )}
    </div>
  )
}