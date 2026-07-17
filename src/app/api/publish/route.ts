import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createHash, timingSafeEqual } from 'crypto'
import { neon } from '@neondatabase/serverless'
import { submitUrlsToIndexNow } from '@/lib/seo/indexnow'
import { getSiteUrl } from '@/lib/seo/site-url'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const SITE_URL = getSiteUrl()
const VALID_CATEGORIES = ['blog', 'kennisbank']

// Machine-endpoint voor volautomatische publicatie (Agent OS → live):
// artikel in de posts-tabel, pagina direct live (revalidate), IndexNow-ping.
// Auth: Authorization: Bearer <PUBLISH_API_KEY> (of een geldige admin-sessie).

const sql = neon(process.env.DATABASE_URL || 'postgresql://dummy:***@dummy.neon.tech/dummy')

async function isAuthorized(request: NextRequest): Promise<boolean> {
  const key = process.env.PUBLISH_API_KEY
  const auth = request.headers.get('authorization')
  if (key && auth?.startsWith('Bearer ')) {
    const provided = auth.slice(7)
    const a = createHash('sha256').update(provided).digest()
    const b = createHash('sha256').update(key).digest()
    if (timingSafeEqual(a, b)) return true
  }
  return false
}

// ── HTML → Markdown ──────────────────────────────────────────────────────────
// Agent OS levert HTML-body; de IctusGo-blog rendert Markdown via renderMarkdown.
// We converteren hier zodat DB-artikelen er identiek uitzien aan de 23 statische.
function htmlToMarkdown(html: string): string {
  let s = html
  // Verwijder script/style-inhoud
  s = s.replace(/<(script|style)[\s\S]*?<\/(script|style)>/gi, '')
  // H1 → # , H2 → ## , H3 → ###
  s = s.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/, (_, c) => `# ${stripTags(c).trim()}\n\n`)
  s = s.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, (_, c) => `## ${stripTags(c).trim()}\n\n`)
  s = s.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, (_, c) => `### ${stripTags(c).trim()}\n\n`)
  // Blockquote
  s = s.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_, c) =>
    `\n> ${stripTags(c).trim().replace(/\n+/g, '\n> ')}\n\n`
  )
  // Unordered lists
  s = s.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (_, c) => {
    const items = (c.match(/<li[^>]*>([\s\S]*?)<\/li>/gi) || []).map(
      (li: string) => `- ${stripTags(li.replace(/<li[^>]*>/i, '').replace(/<\/li>/i, '')).trim()}`
    )
    return items.join('\n') + '\n\n'
  })
  // Ordered lists
  s = s.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (_, c) => {
    const items = (c.match(/<li[^>]*>([\s\S]*?)<\/li>/gi) || []).map(
      (li: string, i: number) =>
        `${i + 1}. ${stripTags(li.replace(/<li[^>]*>/i, '').replace(/<\/li>/i, '')).trim()}`
    )
    return items.join('\n') + '\n\n'
  })
  // Strong / em
  s = s.replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, '**$1**')
  s = s.replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, '**$1**')
  s = s.replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, '*$1*')
  s = s.replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, '*$1*')
  // Links
  s = s.replace(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, (_, href, txt) => {
    const text = stripTags(txt).trim()
    return `[${text}](${href})`
  })
  // Paragraphs → blokken met lege regel ertussen
  s = s.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (_, c) => `${stripTags(c).trim()}\n\n`)
  // Resterende tags strippen
  s = stripTags(s)
  // Opruimen: dubbele witregels, trailing whitespace
  s = s.replace(/\n{3,}/g, '\n\n').replace(/[ \t]+\n/g, '\n').trim()
  return s
}

function stripTags(s: string): string {
  return s.replace(/<[^>]+>/g, '')
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s-]+/g, '-')
    .slice(0, 80)
    .replace(/^-+|-+$/g, '')
}

function deriveExcerpt(text: string, max = 200): string {
  const clean = (text || '').replace(/\s+/g, ' ').trim()
  if (!clean) return ''
  const sentences = clean.match(/[^.!?]+[.!?]+/g) || [clean]
  let out = ''
  for (const sent of sentences) {
    const cand = (out + ' ' + sent).trim()
    if (cand.length > max && out) break
    out = cand
  }
  if (!out) out = clean.slice(0, max).replace(/\s+\S*$/, '')
  return out
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const {
      title,
      content,
      slug: requestedSlug,
      category = 'blog',
      excerpt,
      seoTitle,
      seoDescription,
      keywords = [],
      cluster,
      image,
      source = 'agent-os',
      cta = 'ictusgo',
    } = body as {
      title?: string
      content?: string
      slug?: string
      category?: string
      excerpt?: string
      seoTitle?: string
      seoDescription?: string
      keywords?: string[]
      cluster?: string
      image?: string
      source?: string
      cta?: string
    }

    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json({ error: 'title en content zijn verplicht' }, { status: 400 })
    }

    const safeCategory = VALID_CATEGORIES.includes(category) ? category : 'blog'
    const baseSlug = slugify(requestedSlug?.trim() || title)
    if (!baseSlug) {
      return NextResponse.json({ error: 'kon geen geldige slug afleiden' }, { status: 400 })
    }

    // HTML → Markdown (Agent OS levert HTML)
    const isHtml = /<[a-z][\s\S]*>/i.test(content)
    const markdownBody = isHtml ? htmlToMarkdown(content) : content
    const plainText = markdownBody.replace(/[#*_`>\-\[\]()]/g, ' ').replace(/\s+/g, ' ').trim()

    const finalExcerpt = (
      excerpt?.trim() ||
      seoDescription?.trim() ||
      deriveExcerpt(plainText, 200)
    ).slice(0, 300).replace(/\s+\S*$/, '')

    const heading = title.trim()
    const readingTime = Math.max(1, Math.ceil(plainText.split(/\s+/).length / 200))

    // Upsert op slug
    const existing = await sql`
      SELECT id FROM posts WHERE slug = ${baseSlug} LIMIT 1
    `
    const isUpdate = (existing as unknown as { length: number }).length > 0

    let slug = baseSlug
    if (isUpdate) {
      await sql`
        UPDATE posts SET
          title = ${title.trim()},
          heading = ${heading},
          description = ${seoDescription?.trim() || finalExcerpt},
          body = ${markdownBody},
          excerpt = ${finalExcerpt},
          image = COALESCE(${image ?? null}, image),
          keywords = ${Array.isArray(keywords) ? keywords : []},
          cluster = COALESCE(${cluster ?? null}, cluster),
          updated_at = NOW(),
          reading_time_min = ${readingTime},
          seo_title = ${seoTitle?.trim() || title.trim()},
          seo_description = ${seoDescription?.trim() || finalExcerpt},
          source = ${source},
          status = 'published',
          cta = ${cta}
        WHERE slug = ${baseSlug}
      `
    } else {
      await sql`
        INSERT INTO posts (
          slug, category, title, heading, description, body, excerpt,
          image, keywords, cluster, reading_time_min, seo_title,
          seo_description, source, status, cta
        ) VALUES (
          ${baseSlug}, ${safeCategory}, ${title.trim()}, ${heading},
          ${seoDescription?.trim() || finalExcerpt}, ${markdownBody}, ${finalExcerpt},
          ${image ?? ''}, ${Array.isArray(keywords) ? keywords : []},
          ${cluster ?? ''}, ${readingTime}, ${seoTitle?.trim() || title.trim()},
          ${seoDescription?.trim() || finalExcerpt}, ${source}, 'published', ${cta}
        )
      `
    }

    const url = `${SITE_URL}/${safeCategory}/${slug}`

    // Direct live — niet wachten op ISR-window
    revalidatePath(`/${safeCategory}`)
    revalidatePath(`/${safeCategory}/${slug}`)
    revalidatePath('/sitemap.xml')

    // IndexNow ping (fouten loggen maar blokkeren niet)
    try {
      await submitUrlsToIndexNow([url])
    } catch (e) {
      console.error('[publish] IndexNow ping failed:', e)
    }

    return NextResponse.json(
      {
        success: true,
        slug,
        url,
        category: safeCategory,
        source,
        action: isUpdate ? 'updated' : 'created',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[publish] error:', error)
    return NextResponse.json(
      { error: 'Publiceren mislukt', detail: String(error).slice(0, 300) },
      { status: 500 }
    )
  }
}
