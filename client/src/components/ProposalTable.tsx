import { ProposalStatus } from '@/components/ProposalStatus'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  bigintToFormattedString,
  formatTimestamp,
  getPercentageOfTotalVotes,
  getTotalVotes,
} from '@/lib/utils'
import type { EnhancedProposal } from 'indexer/types'

export function ProposalTable({
  proposals,
}: {
  proposals: EnhancedProposal[]
}) {
  return (
    <div className="shadow-custom-card rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-36">Created</TableHead>
            <TableHead>Title</TableHead>
            <TableHead className="hidden w-36 lg:table-cell">Status</TableHead>
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
                <a
                  href={`/proposal/${proposal.id}`}
                  className="font-medium hover:underline group-hover:text-primary-brand"
                >
                  {proposal.title}
                </a>
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
                    {getPercentageOfTotalVotes(proposal.againstVotes, proposal)}
                    %
                  </span>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
