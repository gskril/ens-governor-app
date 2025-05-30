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
import { VoteBar } from '@/components/VoteBar'
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
  formatTimestamp,
  getQuorumProgress,
  nameWithFallback,
  parseVotes,
} from '@/lib/utils'

type Props = {
  proposal: EnhancedProposalWithVotes
}

export function ProposalPageClient({ proposal }: Props) {
  const { data: proposerEnsName } = useEnsName({ address: proposal.proposer })

  return (
    <div className="container">
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="flex w-fit items-center gap-2 font-semibold text-zinc-500"
        >
          <ArrowLeft className="size-5" />
          <span className="hidden sm:block">All Proposals</span>
          <span className="block sm:hidden">Home</span>
        </Link>

        <ConnectButton />
      </div>

      <div className="grid items-center gap-6 py-4 lg:grid-cols-[2fr_1fr]">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <ProposalStatus proposal={proposal} />
            <Typography className="text-sm text-zinc-500">
              {/* Show "ends" or "ended" depending on the time */}
              {Number(proposal.endTimestamp) > Date.now() / 1000
                ? 'Ends'
                : 'Ended'}{' '}
              {formatTimestamp(proposal.endTimestamp, { includeTime: true })}
            </Typography>
          </div>

          <Typography as="h1">{proposal.title}</Typography>

          <div className="flex flex-col justify-between gap-4 sm:flex-row">
            <Typography className="flex items-center text-sm">
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
                  className="font-semibold hover:underline"
                >
                  {nameWithFallback(proposerEnsName, proposal.proposer)}
                </a>
              </div>
              <span className="hidden sm:block">
                on {formatTimestamp(proposal.createdAtTimestamp)}
              </span>
            </Typography>
          </div>
        </div>

        {(() => {
          const buttonStatuses = ['active', 'succeeded', 'queued']
          const showButton = buttonStatuses.includes(proposal.status)

          if (!showButton) return null

          return (
            <div className="lg:w-fit lg:justify-self-end">
              {proposal.status === 'active' && (
                <VoteButton proposal={proposal} />
              )}

              {proposal.status === 'succeeded' && (
                <ProposalActionButton proposal={proposal} action="queue" />
              )}

              {proposal.status === 'queued' && (
                <ProposalActionButton proposal={proposal} action="execute" />
              )}
            </div>
          )
        })()}
      </div>

      {/* Mobile votes */}
      <Card className="lg:hidden">
        <VotingCardHeader proposal={proposal} />
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
        {/* Proposal */}
        <Card className="h-fit overflow-x-auto rounded-xl shadow-custom-card">
          <Tabs defaultValue="body" className="md:p-3">
            <TabsList className="h-auto w-full justify-start rounded-lg p-2">
              <TabsTrigger className="w-full" value="body">
                Description
              </TabsTrigger>
              <TabsTrigger className="w-full" value="calldata">
                <span className="hidden lg:block">Executable Code</span>
                <span className="block lg:hidden">Code</span>
              </TabsTrigger>
            </TabsList>

            <CardContent className="px-3 pb-4 pt-2">
              {/* Proposal body */}
              <TabsContent value="body">
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => (
                      <Typography as="h1" className="mb-6 lg:text-4xl">
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
                        className="text-primary-brand underline"
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
                  <div key={index} className="my-6 text-sm">
                    <pre className="max-w-full whitespace-pre-wrap break-all rounded-md bg-muted p-4">
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

                    <div className="mt-2 flex justify-end gap-2">
                      <a
                        href={`https://etherscan.io/address/${target}`}
                        target="_blank"
                        className={buttonVariants({
                          size: 'xs',
                        })}
                      >
                        View Contract
                      </a>

                      <a
                        href={`https://calldata.swiss-knife.xyz/decoder?calldata=${proposal.calldatas[index]}&chainId=1&address=${target}`}
                        target="_blank"
                        className={buttonVariants({
                          size: 'xs',
                        })}
                      >
                        Decode Calldata
                      </a>
                    </div>
                  </div>
                ))}
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>

        {/* Votes */}
        <Card
          className="sticky top-6 overflow-y-scroll rounded-xl shadow-custom-card lg:h-[calc(100svh-3rem)]"
          id="votes"
        >
          <VotingCardHeader proposal={proposal} />

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

function VotingCardHeader({
  proposal,
}: {
  proposal: EnhancedProposalWithVotes
}) {
  return (
    <CardHeader className="space-y-2">
      <CardTitle className="mb-4">Votes</CardTitle>

      <VoteBar proposal={proposal} voteType="for" />

      <VoteBar proposal={proposal} voteType="against" />

      {parseVotes(proposal.abstainVotes) > 0 && (
        <VoteBar proposal={proposal} voteType="abstain" />
      )}

      {/* Quorum bar */}
      <div className="relative overflow-hidden rounded bg-zinc-100">
        <div className="relative z-10 flex justify-between gap-2 p-2 text-sm capitalize leading-none">
          <Typography className="font-medium">
            {getQuorumProgress(proposal)}%
          </Typography>

          <Typography>Quorum</Typography>
        </div>

        <div
          className="absolute left-0 top-0 z-0 h-full rounded bg-zinc-200"
          style={{
            width: `${getQuorumProgress(proposal)}%`,
          }}
        />
      </div>
    </CardHeader>
  )
}
