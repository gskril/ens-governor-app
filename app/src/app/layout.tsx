import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

import { ClientProviders } from '@/components/providers/ClientProviders'

import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: {
    template: 'ENS DAO | %s',
    absolute: 'ENS DAO Proposals',
  },
  description: 'View and participate in the governance of ENS DAO',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} antialiased`}>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  )
}
