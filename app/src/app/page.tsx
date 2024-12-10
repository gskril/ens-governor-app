import Link from 'next/link'

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
import { formatStartDate, formatVotes } from '@/lib/utils'

export default async function Home() {
  const proposals = await getProposals()

  return (
    <main className="space-y-6 p-6">
      <Typography as="h1">ENS DAO Proposals</Typography>

      <div className="rounded border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-36">Date</TableHead>
              <TableHead>Title</TableHead>
              <TableHead className="w-36">Status</TableHead>
              <TableHead className="w-24 text-right">Votes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {proposals?.map((proposal) => (
              <TableRow key={proposal.id}>
                <TableCell className="font-medium">
                  {formatStartDate(proposal)}
                </TableCell>
                <TableCell>
                  <Link
                    href={`/proposal/${proposal.id}`}
                    className="hover:underline"
                  >
                    {proposal.title}
                  </Link>
                </TableCell>
                <TableCell>
                  <ProposalStatus proposal={proposal} />
                </TableCell>
                <TableCell className="text-right">
                  {formatVotes(proposal)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </main>
  )
}
