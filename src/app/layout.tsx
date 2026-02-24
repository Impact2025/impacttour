import type { Metadata, Viewport } from 'next'
import { Barlow_Condensed, Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import { PWARegister } from '@/components/layout/pwa-register'
import './globals.css'

const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'IctusGo — GPS Teambuilding met Sociale Impact',
    template: '%s | IctusGo',
  },
  description:
    'GPS-gestuurd outdoor teambuilding met echte sociale impact. Meet verbinding, betekenis, plezier en groei met de Geluksmomenten Score.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'IctusGo',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'nl_NL',
    url: 'https://impacttocht.nl',
    siteName: 'IctusGo',
    title: 'IctusGo — GPS Teambuilding met Sociale Impact',
    description:
      'GPS-gestuurd outdoor teambuilding met echte sociale impact. Meet verbinding, betekenis, plezier en groei.',
  },
}

export const viewport: Viewport = {
  themeColor: '#00E676',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="nl" suppressHydrationWarning className={`${barlowCondensed.variable} ${inter.variable}`}>
      <head>
        <link rel="icon" href="/images/Favicon.png" />
        <link rel="apple-touch-icon" href="/images/Favicon.png" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="font-body">
        {children}
        <Toaster position="top-center" richColors />
        <PWARegister />
      </body>
    </html>
  )
}
