import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Transparante Prijzen — Alle Varianten | ImpactTocht',
  description:
    'Bekijk prijzen voor WijkTocht, ImpactSprint, FamilieTocht, JeugdTocht en VoetbalMissie. Bereken eenvoudig de kosten per persoon of per groep.',
  openGraph: {
    title: 'Transparante Prijzen — Alle Varianten | ImpactTocht',
    description: 'Geen verrassingen. Eerlijke prijzen per persoon of vaste groepsprijs voor elke variant.',
    url: '/prijzen',
  },
}

export default function PrijzenLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
