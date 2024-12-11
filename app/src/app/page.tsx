import Link from 'next/link'

import { Footer } from '@/components/Footer'
import { ProposalStatus } from '@/components/ProposalStatus'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Typography } from '@/components/ui/typography'
import { getProposals } from '@/hooks/useProposals'
import {
  bigintToFormattedString,
  formatTimestamp,
  getTotalVotes,
} from '@/lib/utils'

export default async function Home() {
  const proposals = await getProposals()

  return (
    <div className="container">
      <div className="mb-8 mt-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <img src="/img/logo.svg" alt="ENS Logo Mark" className="w-12" />
          <Typography as="h1">ENS Governance</Typography>
        </div>

        <Typography as="h2" className="mt-2 text-2xl text-zinc-500">
          Executable proposals that control the ENS Protocol and DAO.
        </Typography>
      </div>

      <div className="rounded border">
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
                    className="table-cell rounded-sm lg:hidden"
                  />

                  {formatTimestamp(proposal.createdAtTimestamp)}
                </TableCell>
                <TableCell>
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
                <TableCell className="text-right">
                  {bigintToFormattedString(getTotalVotes(proposal))}
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
