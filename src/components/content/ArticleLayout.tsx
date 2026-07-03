import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Clock, Calendar } from 'lucide-react'
import type { Article } from '@/lib/content/types'
import { getRelatedArticles, CTA_CONTENT } from '@/lib/content'
import { extractToc, renderMarkdown } from '@/lib/content/markdown'

const CATEGORY_LABEL: Record<Article['category'], string> = {
  blog: 'Blog',
  kennisbank: 'Kennisbank',
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function ArticleLayout({ article }: { article: Article }) {
  const toc = extractToc(article.body)
  const related = getRelatedArticles(article)
  const cta = CTA_CONTENT[article.cta]

  return (
    <main className="min-h-screen bg-white">
      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-[#E2E8F0]">
        <div className="max-w-6xl mx-auto px-5 md:px-8 h-14 flex items-center justify-between">
          <Link href="/">
            <Image src="/images/IctusGo.png" alt="IctusGo" width={120} height={36} className="h-8 w-auto" />
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/blog" className="hidden md:block text-[#64748B] hover:text-[#0F172A] transition-colors">Blog</Link>
            <Link href="/kennisbank" className="hidden md:block text-[#64748B] hover:text-[#0F172A] transition-colors">Kennisbank</Link>
            <Link href="/tochten" className="text-xs font-bold bg-[#00E676] text-[#0F172A] px-4 py-2 rounded-xl hover:bg-[#00C853] transition-colors">
              Boek een Tocht
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Breadcrumb ── */}
      <div className="max-w-3xl mx-auto px-5 md:px-8 pt-8">
        <nav className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
          <Link href="/" className="hover:text-[#0F172A] transition-colors">Home</Link>
          <span>/</span>
          <Link href={`/${article.category}`} className="hover:text-[#0F172A] transition-colors">{CATEGORY_LABEL[article.category]}</Link>
          <span>/</span>
          <span className="text-[#475569]">{article.title}</span>
        </nav>
      </div>

      {/* ── Header ── */}
      <header className="max-w-3xl mx-auto px-5 md:px-8 pt-6 pb-8 border-b border-[#E2E8F0]">
        <span className="inline-block text-[10px] font-bold text-[#00A84A] bg-[#00A84A]/10 border border-[#00A84A]/20 rounded-full px-3 py-1 mb-4 uppercase tracking-widest">
          {CATEGORY_LABEL[article.category]}
        </span>
        <h1
          className="text-3xl md:text-5xl font-black text-[#0F172A] leading-tight mb-4"
          style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
        >
          {article.heading}
        </h1>
        <p className="text-[#64748B] text-base leading-relaxed mb-5">{article.description}</p>
        <div className="flex items-center gap-4 text-xs text-[#94A3B8]">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(article.updatedAt)}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {article.readingTimeMin} min leestijd
          </span>
        </div>
      </header>

      {/* ── Featured image ── */}
      <div className="max-w-3xl mx-auto px-5 md:px-8 pt-8">
        <div className="relative w-full aspect-[1.91/1] rounded-2xl overflow-hidden bg-[#F1F5F9]">
          <Image
            src={article.image}
            alt={article.heading}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 720px"
            className="object-cover"
          />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-5 md:px-8 py-10 grid grid-cols-1 lg:grid-cols-[1fr_200px] gap-10">
        {/* ── Body ── */}
        <article>
          {renderMarkdown(article.body)}

          {/* Author bio */}
          <div className="mt-12 flex gap-4 bg-[#F8FAFC] rounded-2xl p-5 border border-[#E2E8F0]">
            <div className="w-12 h-12 rounded-full bg-[#0F172A] flex items-center justify-center shrink-0 text-[#00E676] font-black text-sm">
              VM
            </div>
            <div>
              <p className="font-bold text-[#0F172A] text-sm">Vincent van Munster</p>
              <p className="text-[#64748B] text-xs leading-relaxed mt-1">
                Sociaal ondernemer sinds 2014 — WeAreImpact, Teambuildingmetimpact.nl en IctusGo. 25+ jaar ervaring op het snijvlak van commercie, sociaal domein en innovatie.
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-8 bg-[#0F172A] rounded-3xl p-8 text-center">
            <p
              className="text-xl font-black text-white mb-4"
              style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
            >
              {cta.text}
            </p>
            <a
              href={cta.href}
              className="inline-flex items-center gap-2 bg-[#00E676] text-[#0F172A] font-bold text-sm px-6 py-3 rounded-2xl hover:bg-[#00C853] transition-colors"
            >
              {cta.label} <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </article>

        {/* ── TOC sidebar ── */}
        {toc.length > 0 && (
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-3">Op deze pagina</p>
              <ul className="space-y-2 text-sm">
                {toc.map((entry) => (
                  <li key={entry.id} className={entry.level === 3 ? 'ml-3' : ''}>
                    <a href={`#${entry.id}`} className="text-[#64748B] hover:text-[#00A84A] transition-colors leading-snug block">
                      {entry.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        )}
      </div>

      {/* ── Related articles ── */}
      {related.length > 0 && (
        <section className="bg-[#F8FAFC] border-t border-[#E2E8F0] px-4 md:px-8 py-14">
          <div className="max-w-3xl mx-auto">
            <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-5">Lees ook</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/${r.category}/${r.slug}`}
                  className="bg-white rounded-2xl border border-[#E2E8F0] hover:border-[#00A84A]/40 transition-colors overflow-hidden"
                >
                  <div className="relative w-full aspect-[1.91/1] bg-[#F1F5F9]">
                    <Image src={r.image} alt={r.title} fill sizes="280px" className="object-cover" />
                  </div>
                  <div className="p-5">
                    <span className="text-[9px] font-bold text-[#00A84A] uppercase tracking-widest">{CATEGORY_LABEL[r.category]}</span>
                    <p className="font-bold text-[#0F172A] text-sm mt-2 leading-snug">{r.title}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Footer ── */}
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
            <Link href="/kennisbank" className="hover:text-white transition-colors">Kennisbank</Link>
            <Link href="/faq" className="hover:text-white transition-colors">FAQ</Link>
          </div>
        </div>
      </footer>
    </main>
  )
}
