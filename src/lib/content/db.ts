import { neon } from '@neondatabase/serverless'
import type { Article, ArticleCategory } from './types'

// Directe DB-laag voor CMS-artikelen (Agent OS → posts-tabel).
// Leest de posts-tabel en mapt naar hetzelfde Article-type dat de 23
// in-repo artikelen gebruiken, zodat ArticleLayout/renderMarkdown één
// contract hebben — ongeacht de bron.

const sqlClient = neon(
  process.env.DATABASE_URL ||
    'postgresql://dummy:***@dummy.neon.tech/dummy'
)

interface PostRow {
  slug: string
  category: string
  title: string
  heading: string
  description: string
  body: string
  excerpt: string
  image: string
  keywords: string[]
  cluster: string
  published_at: string
  updated_at: string
  reading_time_min: number
  seo_title: string | null
  seo_description: string | null
  source: string
  status: string
  cta: string
}

function rowToArticle(r: PostRow): Article {
  return {
    slug: r.slug,
    category: (r.category === 'kennisbank' ? 'kennisbank' : 'blog') as ArticleCategory,
    title: r.title,
    description: r.description || r.excerpt || '',
    heading: r.heading || r.title,
    image: r.image || '/images/articles/default.png',
    keywords: Array.isArray(r.keywords) ? r.keywords : [],
    cluster: r.cluster || r.category,
    publishedAt: (r.published_at || new Date().toISOString()).slice(0, 10),
    updatedAt: (r.updated_at || r.published_at || new Date().toISOString()).slice(0, 10),
    readingTimeMin: r.reading_time_min || 3,
    body: r.body,
    relatedSlugs: [],
    // CTA validatie: alleen bekende waarden, anders ictusgo-fallback
    cta: (['ictusgo', 'teambuildingmetimpact', 'weareimpact', 'thee', 'lsp'] as const).includes(
      r.cta as never
    )
      ? (r.cta as Article['cta'])
      : 'ictusgo',
  }
}

/**
 * Haalt alle gepubliceerde CMS-artikelen uit de database.
 * Faalt nooit hard — bij een DB-probleem wordt een lege lijst teruggegeven
 * zodat de statische artikelen altijd blijven werken (pariteit met sitemap.ts).
 */
export async function getDbArticles(): Promise<Article[]> {
  try {
    const rows = (await sqlClient`
      SELECT slug, category, title, heading, description, body, excerpt,
             image, keywords, cluster, published_at, updated_at,
             reading_time_min, seo_title, seo_description, source, status, cta
      FROM posts
      WHERE status = 'published'
      ORDER BY published_at DESC
    `) as unknown as PostRow[]
    return rows.map(rowToArticle)
  } catch (e) {
    console.error('[content/db] getDbArticles failed:', e)
    return []
  }
}

export async function getDbArticleBySlug(
  category: ArticleCategory,
  slug: string
): Promise<Article | undefined> {
  try {
    const rows = (await sqlClient`
      SELECT slug, category, title, heading, description, body, excerpt,
             image, keywords, cluster, published_at, updated_at,
             reading_time_min, seo_title, seo_description, source, status, cta
      FROM posts
      WHERE slug = ${slug} AND status = 'published'
      LIMIT 1
    `) as unknown as PostRow[]
    const row = rows[0]
    if (!row) return undefined
    // Categorie-mismatch bescherming: een blog-slug hoort niet onder /kennisbank
    if (row.category !== category) return undefined
    return rowToArticle(row)
  } catch (e) {
    console.error('[content/db] getDbArticleBySlug failed:', e)
    return undefined
  }
}
