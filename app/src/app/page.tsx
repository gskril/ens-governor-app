import Link from 'next/link'

import { Footer } from '@/components/Footer'
import { ProposalStatus } from '@/components/ProposalStatus'
import { DiscourseIcon, XIcon } from '@/components/icons'
import { IconWrapper } from '@/components/icons/IconWrapper'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getProposals } from '@/hooks/useProposals'
import {
  bigintToFormattedString,
  formatTimestamp,
  getPercentageOfTotalVotes,
  getTotalVotes,
} from '@/lib/utils'

// Invalidate the cache when a request comes in, at most once every 10 seconds.
export const revalidate = 10

export default async function Home() {
  const proposals = await getProposals()

  return (
    <div className="container">
      <div className="mb-8 mt-6">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:gap-12">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <img
              src="/img/logo-filled.svg"
              alt="ENS Logo Mark"
              className="w-28 -rotate-3 rounded-3xl border-4 border-white shadow-[0_0_22px_0_#00000029] md:w-40"
            />

            <div className="space-y-3">
              <h1 className="space-y-3">
                <span className="line block text-2xl font-semibold leading-none text-primary-brand">
                  ENS
                </span>{' '}
                <span className="block text-3xl font-bold leading-none lg:text-5xl">
                  Executable Proposals
                </span>
              </h1>

              <h2 className="text-base font-medium text-zinc-500">
                View and vote on executable proposals from the ENS Protocol and
                DAO.
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <IconWrapper href="https://x.com/ENS_DAO" icon={<XIcon />} />
            <IconWrapper
              href="https://discuss.ens.domains"
              icon={<DiscourseIcon />}
              text="Forum"
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border shadow-[0_-4px_10px_0px_#00000008]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-36">Created</TableHead>
              <TableHead>Title</TableHead>
              <TableHead className="hidden w-36 lg:table-cell">
                Status
              </TableHead>
              <TableHead className="w-24 text-right">Votes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {proposals?.map((proposal) => (
              <TableRow key={proposal.id}>
                <TableCell>
                  <ProposalStatus
                    proposal={proposal}
                    className="table-cell lg:hidden"
                  />

                  {formatTimestamp(proposal.createdAtTimestamp)}
                </TableCell>
                {/* Not sure why max-w-0 is needed here, but it seems to work fine in all browsers */}
                <TableCell className="max-w-0 truncate">
                  <Link
                    href={`/proposal/${proposal.id}`}
                    className="font-medium hover:underline"
                  >
                    {proposal.title}
                  </Link>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <ProposalStatus proposal={proposal} />
                </TableCell>
                <TableCell className="space-y-1 text-right">
                  <span>
                    {bigintToFormattedString(getTotalVotes(proposal))}
                  </span>

                  <div className="flex items-center gap-1 text-xs font-semibold leading-none">
                    <span className="text-green-600">
                      {getPercentageOfTotalVotes(proposal.forVotes, proposal)}%
                    </span>
                    <span className="text-zinc-200">|</span>
                    <span className="text-destructive">
                      {getPercentageOfTotalVotes(
                        proposal.againstVotes,
                        proposal
                      )}
                      %
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Footer />
    </div>
  )
}
