import { getProposal } from '@/hooks/useProposal'

import { ProposalPageClient } from './client'

type PageProps = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const proposal = await getProposal((await params).id)

  return {
    title: proposal.title,
  }
}

export default async function ProposalPage({ params }: PageProps) {
  const proposal = await getProposal((await params).id)

  return <ProposalPageClient proposal={proposal} />
}
