import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Vraag een offerte op maat, plan een demo of stel je vraag over een GPS-teambuilding. We reageren binnen 1 werkdag.',
  alternates: { canonical: '/contact' },
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children
}
