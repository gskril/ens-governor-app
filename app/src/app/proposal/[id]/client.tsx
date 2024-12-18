'use client'

import { EnhancedProposalWithVotes } from 'indexer/types'
import { ArrowDown, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useEnsName } from 'wagmi'

import { ConnectButton } from '@/components/ConnectButton'
import { Footer } from '@/components/Footer'
import { ProposalActionButton } from '@/components/ProposalActionButton'
import { ProposalStatus } from '@/components/ProposalStatus'
import { ProposalVote } from '@/components/ProposalVote'
import { VoteButton } from '@/components/VoteButton'
import { buttonVariants } from '@/components/ui/button'
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
  formatTimestamp,
  getPercentageOfTotalVotes,
  getQuorumProgress,
  nameWithFallback,
} from '@/lib/utils'

type Props = {
  proposal: EnhancedProposalWithVotes
}

export function ProposalPageClient({ proposal }: Props) {
  const { data: proposerEnsName } = useEnsName({ address: proposal.proposer })

  return (
    <div className="container">
      <div className="flex items-center justify-between">
        <Link href="/" className="flex w-fit items-center gap-2 font-semibold">
          <ArrowLeft className="size-5" />
          <span className="hidden sm:block">All Proposals</span>
          <span className="block sm:hidden">Home</span>
        </Link>

        <ConnectButton />
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4 p-6 pb-4">
          <div className="flex items-center gap-2">
            <ProposalStatus proposal={proposal} />
            <Typography className="text-sm text-zinc-500">
              Ends{' '}
              {formatTimestamp(proposal.endTimestamp, { includeTime: true })}
            </Typography>
          </div>

          <Typography as="h1" className="mb-2">
            {proposal.title}
          </Typography>

          <hr />

          <div className="flex flex-col justify-between gap-4 sm:flex-row">
            <Typography className="flex items-center">
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
                  {nameWithFallback(proposerEnsName, proposal.proposer)}
                </a>
              </div>
              <span className="hidden sm:block">
                on {formatTimestamp(proposal.createdAtTimestamp)}
              </span>
            </Typography>

            {proposal.status === 'active' && <VoteButton proposal={proposal} />}

            {proposal.status === 'succeeded' && (
              <ProposalActionButton proposal={proposal} action="queue" />
            )}

            {proposal.status === 'queued' && (
              <ProposalActionButton proposal={proposal} action="execute" />
            )}
          </div>
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

            <CardContent className="pb-4 pt-2">
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
                      <Typography as="p" className="break-words">
                        {children}
                      </Typography>
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
                    li: ({ children }) => (
                      <li className="break-words">{children}</li>
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
                      <pre className="my-6 max-w-full overflow-x-auto rounded-md bg-muted p-4">
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
                  <pre
                    key={index}
                    className="my-6 block max-w-full whitespace-pre-wrap break-all rounded-md bg-muted p-4"
                  >
                    <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-6">
                      <div>target:</div>
                      <div>{target}</div>

                      <div>calldata:</div>
                      <div>{proposal.calldatas[index]}</div>

                      <div>value:</div>
                      <div>{proposal.values[index]}</div>

                      {proposal.signatures[index] && (
                        <>
                          <div>signature:</div>
                          <div>{proposal.signatures[index]}</div>
                        </>
                      )}
                    </div>
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
                  className="h-full rounded bg-destructive"
                  style={{
                    width: `${getPercentageOfTotalVotes(proposal.againstVotes, proposal)}%`,
                  }}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {proposal.votes.map((vote) => {
              return <ProposalVote key={vote.id} vote={vote} />
            })}
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  )
}
