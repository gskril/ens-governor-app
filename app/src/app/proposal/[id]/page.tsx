import { getProposal } from '@/hooks/useProposal'
import { BASE_URL } from '@/lib/constants'

import { ProposalPageClient } from './client'

type PageProps = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const proposalId = (await params).id
  const proposal = await getProposal(proposalId)

  return {
    title: proposal.title,
    other: {
      'fc:frame': JSON.stringify({
        version: 'next',
        imageUrl: `${BASE_URL}/img/opengraph.jpg`,
        button: {
          title: 'View Proposal',
          action: {
            type: 'launch_frame',
            name: 'ENS DAO Governance',
            url: `${BASE_URL}/proposal/${proposalId}`,
            splashImageUrl: `${BASE_URL}/img/logo-square.svg`,
            splashBackgroundColor: '#f7f7f7',
          },
        },
      }),
    },
  }
}

export default async function ProposalPage({ params }: PageProps) {
  const proposal = await getProposal((await params).id)

  return <ProposalPageClient proposal={proposal} />
}
