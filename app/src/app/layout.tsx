import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

import { ClientProviders } from '@/components/providers/ClientProviders'
import { IndexerWarning } from '@/components/IndexerWarning'
import { BASE_URL } from '@/lib/constants'

import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: {
    template: 'ENS DAO | %s',
    absolute: 'ENS DAO Proposals',
  },
  openGraph: {
    images: [{ url: '/img/opengraph.jpg' }],
  },
  description: 'View and participate in the governance of ENS DAO',
  metadataBase: new URL(BASE_URL),
  other: {
    'fc:frame': JSON.stringify({
      version: 'next',
      imageUrl: `${BASE_URL}/img/opengraph.jpg`,
      button: {
        title: 'View Proposals',
        action: {
          type: 'launch_frame',
          name: 'ENS DAO Governance',
          url: `${BASE_URL}`,
          splashImageUrl: `${BASE_URL}/img/logo-square.svg`,
          splashBackgroundColor: '#f7f7f7',
        },
      },
    }),
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} antialiased`}>
        <ClientProviders>
          <IndexerWarning />
          {children}
        </ClientProviders>
      </body>
    </html>
  )
}
