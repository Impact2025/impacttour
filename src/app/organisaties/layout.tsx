import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Locatiepartner worden — organisaties',
  description:
    'Meld je gratis aan als locatiepartner. IctusGo brengt bedrijfsteams naar jouw organisatie voor betekenisvolle GPS-teamdagen met echte impact.',
  alternates: { canonical: '/organisaties' },
}

export default function OrganisatiesLayout({ children }: { children: React.ReactNode }) {
  return children
}
