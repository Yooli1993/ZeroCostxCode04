import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/providers/ThemeProvider'
import { AgentProvider } from '@/providers/AgentProvider'
import { WorkspaceProvider } from '@/providers/WorkspaceProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ZeroCostxCode - Professional Agentic Platform',
  description: 'World-class agentic coding platform with real-time AI assistance',
  keywords: ['AI', 'coding', 'development', 'agents', 'automation'],
  authors: [{ name: 'ZeroCostxCode Team' }],
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-gray-950 text-gray-100 antialiased`}>
        <ThemeProvider>
          <AgentProvider>
            <WorkspaceProvider>
              {children}
            </WorkspaceProvider>
          </AgentProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}