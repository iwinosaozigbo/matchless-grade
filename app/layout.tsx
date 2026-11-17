import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import '@fontsource-variable/fredoka/wght.css'
import '@fontsource-variable/nunito/wght.css'
import { GameProvider } from '@/lib/game-store'
import './globals.css'

export const metadata: Metadata = {
  title: 'Matchless Grade — Your learning dashboard',
  description:
    'Access your purchased mathematics and English courses and SIMA Abacus lessons, track progress, and unlock more courses from one learning dashboard.',
  generator: 'v0.app',
  icons: {
    icon: '/icon.svg',
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#f5f8ff',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="light bg-background">
      <body className="antialiased">
        <GameProvider>{children}</GameProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
