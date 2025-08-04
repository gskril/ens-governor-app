import { Link } from 'react-router-dom'
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
import { useProposals } from '@/hooks/useProposals'
import {
  bigintToFormattedString,
  formatTimestamp,
  getPercentageOfTotalVotes,
  getTotalVotes,
} from '@/lib/utils'

// Invalidate the cache when a request comes in, at most once every 10 seconds.
export const revalidate = 10

export function Home() {
  const { data: proposals } = useProposals()

  return (
    <div className="container">
      <div className="mb-8 mt-6">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:gap-12">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <img
              src="/img/logo-filled.svg"
              alt="ENS Logo"
              width={160}
              height={160}
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

      <div className="shadow-custom-card rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-36">Created</TableHead>
              <TableHead>Title</TableHead>
              <TableHead className="hidden w-36 lg:table-cell">
                Status
              </TableHead>
              <TableHead className="hidden w-24 text-right md:table-cell">
                Votes
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(() => {
              const Row = ({ text }: { text: string }) => (
                <TableRow className="h-[50vh] animate-pulse">
                  <TableCell colSpan={4} className="text-center">
                    {text}
                  </TableCell>
                </TableRow>
              )

              if (!proposals) {
                return <Row text="Loading..." />
              }

              if (proposals.length === 0) {
                return <Row text="No proposals found" />
              }
            })()}

            {proposals?.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  No proposals found
                </TableCell>
              </TableRow>
            )}

            {proposals?.map((proposal) => (
              <TableRow key={proposal.id} className="group">
                <TableCell className="space-y-0.5">
                  <ProposalStatus
                    proposal={proposal}
                    className="table-cell lg:hidden"
                  />

                  <span className="block">
                    {formatTimestamp(proposal.createdAtTimestamp)}
                  </span>
                </TableCell>
                {/* Not sure why max-w-0 is needed here, but it seems to work fine in all browsers */}
                <TableCell className="md:max-w-0 md:truncate">
                  <Link
                    to={`/proposal/${proposal.id}`}
                    className="font-medium hover:underline group-hover:text-primary-brand"
                  >
                    {proposal.title}
                  </Link>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <ProposalStatus proposal={proposal} />
                </TableCell>
                <TableCell className="hidden text-right md:table-cell">
                  <span className="block pb-1">
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
