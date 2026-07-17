// Insert de 7 geconverteerde AgentOS-artikelen in de IctusGo posts-tabel (Neon).
// Leest scripts/agentos_jobs_clean.json en doet een slug-upsert.
const { neon } = require('@neondatabase/serverless')
const fs = require('fs')

const ENV = fs.readFileSync('D:/APPS/IctusGo/.env.local', 'utf8')
const m = ENV.match(/DATABASE_URL=(postgresql:\/\/\S+)/)
if (!m) { console.error('DATABASE_URL niet gevonden in .env.local'); process.exit(1) }
const sql = neon(m[1])

const articles = JSON.parse(fs.readFileSync('D:/APPS/IctusGo/scripts/agentos_jobs_clean.json', 'utf8'))

async function main() {
  // Eerst de test-artikelen opruimen
  const cleaned = await sql`DELETE FROM posts WHERE slug IN ('logtest','probeclean','zz','probe-a','probe-b','probe-c','probe-final','probe-final2','probe-ok','probeclean','testictusgopublishroute') RETURNING slug`
  console.log(`Opgeruimde test-artikelen: ${cleaned.length}`)

  let ok = 0
  for (const a of articles) {
    try {
      const keywordsJson = JSON.stringify(a.keywords || [])
      await sql`
        INSERT INTO posts (slug, category, title, heading, description, body, excerpt, image, keywords, cluster, reading_time_min, seo_title, seo_description, source, status, cta)
        VALUES (${a.slug}, ${a.category}, ${a.title}, ${a.heading}, ${a.description}, ${a.body}, ${a.excerpt}, '', ${keywordsJson}::jsonb, ${a.cluster}, ${a.reading_time_min}, ${a.seo_title}, ${a.seo_description}, ${a.source}, ${a.status}, ${a.cta})
        ON CONFLICT (slug) DO UPDATE SET
          title=EXCLUDED.title, heading=EXCLUDED.heading, description=EXCLUDED.description,
          body=EXCLUDED.body, excerpt=EXCLUDED.excerpt, updated_at=NOW(),
          reading_time_min=EXCLUDED.reading_time_min, seo_title=EXCLUDED.seo_title,
          seo_description=EXCLUDED.seo_description, status=EXCLUDED.status, source=EXCLUDED.source
      `
      console.log(`OK  ${a.slug}`)
      ok++
    } catch (e) {
      console.log(`ERR ${a.slug}: ${e.message.slice(0, 120)}`)
    }
  }
  const cnt = await sql`SELECT count(*)::int AS n FROM posts`
  console.log(`\nKlaar: ${ok}/${articles.length} geinsert. Totaal posts in DB: ${cnt[0].n}`)
}
main().catch(e => { console.error('FATAL', e); process.exit(1) })
