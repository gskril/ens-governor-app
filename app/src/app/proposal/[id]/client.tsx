'use client'

import { EnhancedProposalWithVotes } from 'indexer/types'
import { ArrowDown, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useEnsName } from 'wagmi'

import { ProposalStatus } from '@/components/ProposalStatus'
import { Button, buttonVariants } from '@/components/ui/button'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
      <div>
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <ArrowLeft className="size-5" />
          All Proposals
        </Link>
      </div>

      <Card>
        <CardContent className="space-y-4 p-6">
          <ProposalStatus proposal={proposal} />
          <Typography as="h1">{proposal.title}</Typography>

          <hr />

          <Typography className="mb-2 flex">
            <span className="hidden sm:block">Proposed by</span>
            <span className="block sm:hidden">By</span>
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
            <span className="hidden sm:block">
              on {formatTimestamp(proposal.createdAtTimestamp)}
            </span>
          </Typography>
        </CardContent>
      </Card>

      <a
        href="#votes"
        className={buttonVariants({
          variant: 'default',
          size: 'lg',
          className: 'w-full lg:hidden',
        })}
      >
        <ArrowDown />
        Skip to Votes
      </a>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card className="h-fit overflow-x-auto">
          <Tabs defaultValue="body">
            <TabsList className="h-auto w-full justify-start rounded-none p-2">
              <TabsTrigger className="w-full" value="body">
                Description
              </TabsTrigger>
              <TabsTrigger className="w-full" value="calldata">
                <span className="hidden lg:block">Executable Code</span>
                <span className="block lg:hidden">Code</span>
              </TabsTrigger>
            </TabsList>

            <CardContent>
              {/* Proposal body */}
              <TabsContent value="body">
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
                    p: ({ children }) => (
                      <Typography as="p">{children}</Typography>
                    ),
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
                    thead: ({ children }) => (
                      <TableHeader>{children}</TableHeader>
                    ),
                    tbody: ({ children }) => <TableBody>{children}</TableBody>,
                    tfoot: ({ children }) => (
                      <TableFooter>{children}</TableFooter>
                    ),
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
              </TabsContent>

              {/* Executable code */}
              <TabsContent value="calldata">
                {proposal.targets.map((target, index) => (
                  <pre className="bg-muted my-6 max-w-full overflow-x-auto rounded-md p-4">
                    <code>
                      {JSON.stringify(
                        {
                          target,
                          calldata: proposal.calldatas[index],
                          value: proposal.values[index],
                          signature: proposal.signatures[index],
                        },
                        null,
                        2
                      )}
                    </code>
                  </pre>
                ))}
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>

        {/* Votes */}
        <Card className="sticky top-6 h-fit" id="votes">
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
    <div key={vote.id} className="space-y-1.5 text-sm font-medium">
      <div className="flex w-full justify-between gap-4">
        <div className="flex items-center gap-1">
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
            href={
              ensName
                ? `https://app.ens.domains/${ensName}`
                : `https://etherscan.io/address/${vote.voter}`
            }
            target="_blank"
            rel="noreferrer"
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
