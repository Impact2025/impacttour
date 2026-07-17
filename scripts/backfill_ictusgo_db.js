// Backfill: zet de 7 vastzittende AgentOS content-jobs in de IctusGo posts-tabel.
// Leest rechtstreeks uit AgentOS data/agentos.db, converteert HTML->Markdown
// (identiek aan src/app/api/publish/route.ts) en upsert naar Neon posts.
// Resultaat: artikelen staan in dezelfde DB die ictusgo.nl leest, dus ze
// renderen zodra de ictusgo.nl edge de huidige build serveert (en nu al op
// de deployment-URL).

const { neon } = require('@neondatabase/serverless')
const fs = require('fs')
const path = require('path')
const sqlite3 = require('sqlite3')

const AGENTOS_DB = 'D:/APPS/agentos/data/agentos.db'
const SITE_ID = 'a304b082-741e-4781-9d99-584903b7295c'

// ── HTML -> Markdown (port van route.ts) ───────────────────────────────────
function stripTags(s) { return s.replace(/<[^>]+>/g, '') }
function slugify(t) {
  return t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '').trim().replace(/[\s-]+/g, '-')
    .slice(0, 80).replace(/^-+|-+$/g, '')
}
function htmlToMarkdown(html) {
  let s = html.replace(/<(script|style)[\s\S]*?<\/(script|style)>/gi, '')
  s = s.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/, (_, c) => `# ${stripTags(c).trim()}\n\n`)
  s = s.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, (_, c) => `## ${stripTags(c).trim()}\n\n`)
  s = s.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, (_, c) => `### ${stripTags(c).trim()}\n\n`)
  s = s.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_, c) => `\n> ${stripTags(c).trim().replace(/\n+/g, '\n> ')}\n\n`)
  s = s.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (_, c) => {
    const items = (c.match(/<li[^>]*>([\s\S]*?)<\/li>/gi) || []).map(li => `- ${stripTags(li.replace(/<li[^>]*>/i, '').replace(/<\/li>/i, '')).trim()}`)
    return items.join('\n') + '\n\n'
  })
  s = s.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (_, c) => {
    const items = (c.match(/<li[^>]*>([\s\S]*?)<\/li>/gi) || []).map((li, i) => `${i + 1}. ${stripTags(li.replace(/<li[^>]*>/i, '').replace(/<\/li>/i, '')).trim()}`)
    return items.join('\n') + '\n\n'
  })
  s = s.replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, '**$1**')
  s = s.replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, '**$1**')
  s = s.replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, '*$1*')
  s = s.replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, '*$1*')
  s = s.replace(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, (_, href, txt) => `[${stripTags(txt).trim()}](${href})`)
  s = s.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (_, c) => `${stripTags(c).trim()}\n\n`)
  s = stripTags(s)
  return s.replace(/\n{3,}/g, '\n\n').replace(/[ \t]+\n/g, '\n').trim()
}
function deriveExcerpt(text, max = 200) {
  const clean = (text || '').replace(/\s+/g, ' ').trim()
  if (!clean) return ''
  const sentences = clean.match(/[^.!?]+[.!?]+/g) || [clean]
  let out = ''
  for (const sent of sentences) { const cand = (out + ' ' + sent).trim(); if (cand.length > max && out) break; out = cand }
  if (!out) out = clean.slice(0, max).replace(/\s+\S*$/, '')
  return out
}

async function main() {
  const envPath = 'D:/APPS/IctusGo/.env.local'
  const env = fs.readFileSync(envPath, 'utf8')
  const m = env.match(/DATABASE_URL=(postgresql:\/\/\S+)/)
  if (!m) { console.error('DATABASE_URL niet gevonden'); process.exit(1) }
  const sql = neon(m[1])

  const db = new sqlite3.Database(AGENTOS_DB, sqlite3.OPEN_READONLY)
  const rows = await new Promise((res, rej) => {
    db.all('SELECT id,title,slug,keyword,blog_html,seo_score FROM content_jobs WHERE site_id=?', [SITE_ID], (e, r) => e ? rej(e) : res(r))
  })
  db.close()
  console.log(`AgentOS jobs gevonden: ${rows.length}`)

  let ok = 0
  for (const r of rows) {
    let html = r.blog_html || ''
    html = html.replace(/<!--[\s\S]*?-->/g, '') // meta-commentaren eruit
    const isHtml = /<[a-z][\s\S]*>/i.test(html)
    const md = isHtml ? htmlToMarkdown(html) : html
    const plain = md.replace(/[#*_`>\-[\]()]/g, ' ').replace(/\s+/g, ' ').trim()
    const slug = slugify(r.slug) || slugify(r.title)
    const excerpt = deriveExcerpt(plain, 200)
    const reading = Math.max(1, Math.ceil(plain.split(/\s+/).length / 200))
    try {
      await sql`
        INSERT INTO posts (slug, category, title, heading, description, body, excerpt, image, keywords, cluster, reading_time_min, seo_title, seo_description, source, status, cta)
        VALUES (${slug}, 'blog', ${r.title.trim()}, ${r.title.trim()}, ${excerpt}, ${md}, ${excerpt}, '', ${[r.keyword].filter(Boolean)}, 'teambuilding', ${reading}, ${r.title.trim()}, ${excerpt}, 'agent-os', 'published', 'ictusgo')
        ON CONFLICT (slug) DO UPDATE SET
          title = EXCLUDED.title, heading = EXCLUDED.heading, description = EXCLUDED.description,
          body = EXCLUDED.body, excerpt = EXCLUDED.excerpt, updated_at = NOW(),
          reading_time_min = EXCLUDED.reading_time_min, seo_title = EXCLUDED.seo_title,
          seo_description = EXCLUDED.seo_description, status = 'published', source = 'agent-os'
      `
      console.log(`OK  ${slug.slice(0, 48).padEnd(50)} <- ${r.title.slice(0, 40)}`)
      ok++
    } catch (e) {
      console.log(`ERR ${slug.slice(0, 48)}: ${e.message.slice(0, 100)}`)
    }
  }
  console.log(`\nBackfill klaar: ${ok}/${rows.length} artikelen in posts-tabel.`)
  // tel na
  const cnt = await sql`SELECT count(*)::int AS n FROM posts`
  console.log(`Totaal posts in DB: ${cnt[0].n}`)
}
main().catch(e => { console.error('FATAL', e); process.exit(1) })
