import type { Metadata } from 'next'

import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'sonner'
import './globals.css'

import { Geist_Mono, Montserrat as V0_Font_Montserrat, Geist_Mono as V0_Font_Geist_Mono, Bitter as V0_Font_Bitter } from 'next/font/google'
import { AuthProvider } from '@/contexts/auth-context'
import { DuePaymentsChecker } from '@/components/due-payments-checker'

// Initialize fonts
const _montserrat = V0_Font_Montserrat({ subsets: ['latin'], weight: ["100","200","300","400","500","600","700","800","900"] })
const _geistMono = V0_Font_Geist_Mono({ subsets: ['latin'], weight: ["100","200","300","400","500","600","700","800","900"] })
const _bitter = V0_Font_Bitter({ subsets: ['latin'], weight: ["100","200","300","400","500","600","700","800","900"] })

export const metadata: Metadata = {
  title: 'Pix+',
  description: 'Pix Payment System',
  generator: 'v0.app',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className={`font-sans antialiased`}>
        <AuthProvider>
          {children}
          <DuePaymentsChecker />
          <Toaster />
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
