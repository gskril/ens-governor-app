import { ProposalStatus } from '@/components/ProposalStatus'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getProposals } from '@/hooks/useProposals'
import { formatStartDate, formatVotes } from '@/lib/utils'

export default async function Home() {
  const proposals = await getProposals()

  return (
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
            <TableCell>{proposal.title}</TableCell>
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
  )
}
