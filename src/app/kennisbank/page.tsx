import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { getArticlesByCategory } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Kennisbank — praktische gidsen over GPS-teambuilding',
  description:
    'Praktische gidsen over WKR, CSRD, psychologische veiligheid en het organiseren van een GPS-teamuitje. Alle antwoorden op basis van actuele wet- en regelgeving.',
  alternates: { canonical: '/kennisbank' },
}

export default function KennisbankIndexPage() {
  const posts = getArticlesByCategory('kennisbank')

  return (
    <main className="min-h-screen bg-white">
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-[#E2E8F0]">
        <div className="max-w-6xl mx-auto px-5 md:px-8 h-14 flex items-center justify-between">
          <Link href="/">
            <Image src="/images/IctusGo.png" alt="IctusGo" width={120} height={36} className="h-8 w-auto" />
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/blog" className="hidden md:block text-[#64748B] hover:text-[#0F172A] transition-colors">Blog</Link>
            <Link href="/tochten" className="text-xs font-bold bg-[#00E676] text-[#0F172A] px-4 py-2 rounded-xl hover:bg-[#00C853] transition-colors">
              Boek een Tocht
            </Link>
          </div>
        </div>
      </nav>

      <section className="bg-[#F8FAFC] border-b border-[#E2E8F0] px-4 md:px-8 py-14 md:py-20">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-3">Kennisbank</p>
          <h1
            className="text-3xl md:text-5xl font-black text-[#0F172A] mb-4"
            style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
          >
            Praktische gidsen, geen vage beloftes
          </h1>
          <p className="text-[#64748B] text-sm leading-relaxed">
            WKR, CSRD, psychologische veiligheid en organisatorische checklists — onderbouwd met actuele wet- en regelgeving.
          </p>
        </div>
      </section>

      <section className="px-4 md:px-8 py-12 md:py-16">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-5">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/kennisbank/${post.slug}`}
              className="bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] hover:border-[#00A84A]/40 transition-colors flex flex-col overflow-hidden"
            >
              <div className="relative w-full aspect-[1.91/1] bg-[#E2E8F0]">
                <Image src={post.image} alt={post.heading} fill sizes="(max-width: 768px) 100vw, 400px" className="object-cover" />
              </div>
              <div className="p-6 flex flex-col flex-1">
                <p className="text-[9px] font-bold text-[#00A84A] uppercase tracking-widest mb-2">{post.cluster.replace(/-/g, ' ')}</p>
                <h2 className="font-bold text-[#0F172A] text-lg leading-snug mb-2">{post.title}</h2>
                <p className="text-[#64748B] text-sm leading-relaxed flex-1">{post.description}</p>
                <p className="text-[#94A3B8] text-xs mt-4">{post.readingTimeMin} min leestijd</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <footer className="bg-[#0F172A] border-t border-white/5 px-4 md:px-8 py-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:justify-between gap-4 text-xs text-[#475569]">
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-lg px-2 py-1 inline-flex">
              <Image src="/images/IctusGo.png" alt="IctusGo" width={80} height={24} className="h-5 w-auto" />
            </div>
            <span>— onderdeel van TeambuildingMetImpact.nl</span>
          </div>
          <div className="flex gap-4">
            <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
            <Link href="/faq" className="hover:text-white transition-colors">FAQ</Link>
          </div>
        </div>
      </footer>
    </main>
  )
}
