import type { Metadata, Viewport } from 'next'
import { Barlow_Condensed, Inter } from 'next/font/google'
import { GoogleAnalytics } from '@next/third-parties/google'
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

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://ictusgo.nl'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
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
    url: SITE_URL,
    siteName: 'IctusGo',
    title: 'IctusGo — GPS Teambuilding met Sociale Impact',
    description:
      'GPS-gestuurd outdoor teambuilding met echte sociale impact. Meet verbinding, betekenis, plezier en groei.',
    images: [{ url: '/images/IctusGo.png', width: 1200, height: 630, alt: 'IctusGo — GPS Teambuilding' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/images/IctusGo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  other: {
    'google-site-verification': '...', // TODO: vul GSC verification code in
  },
}

export const viewport: Viewport = {
  themeColor: '#00E676',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'IctusGo',
  url: SITE_URL,
  logo: `${SITE_URL}/images/IctusGo.png`,
  description: 'GPS-gestuurd outdoor teambuilding platform met sociale impact. Ontwikkeld door WeAreImpact.',
  email: 'info@ictusgo.nl',
  foundingDate: '2010',
  areaServed: 'NL',
  founder: {
    '@type': 'Person',
    name: 'Vincent van Munster',
    url: 'https://weareimpact.nl',
  },
  sameAs: [
    SITE_URL,
    'https://weareimpact.nl',
  ],
}

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'IctusGo',
  url: SITE_URL,
  description: 'GPS-gestuurd outdoor teambuilding met echte sociale impact.',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SITE_URL}/contact?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body className="font-body">
        {children}
        <Toaster position="top-center" richColors />
        <PWARegister />
        <GoogleAnalytics gaId="G-W035B2QCXK" />
      </body>
    </html>
  )
}
