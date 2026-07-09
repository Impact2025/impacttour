import { MetadataRoute } from 'next'
import { db } from '@/lib/db'
import { tours } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { articles } from '@/lib/content'
import { getSiteUrl } from '@/lib/seo/site-url'

const BASE = getSiteUrl()

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  // Static marketing pages — geen lastModified: deze route rendert dynamisch (db-call
  // hieronder), dus new Date() zou hier het moment van Google's fetch zijn, niet de
  // echte wijzigingsdatum. Een onjuiste lastmod ondermijnt het vertrouwen in dat signaal.
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE,                                changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${BASE}/over-ons`,                  changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/impact`,                    changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/prijzen`,                   changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/contact`,                   changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/tocht-op-maat`,             changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/tochten`,                   changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${BASE}/faq`,                       changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/voorwaarden`,               changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${BASE}/privacy`,                   changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${BASE}/organisaties`,              changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/jeugdtocht`,                changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/voetbalmissie`,             changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/blog`,                      changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${BASE}/kennisbank`,                changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${BASE}/teambuilding-hoofddorp`,     changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/teambuilding-haarlemmermeer`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/gps-teamuitje`,             changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/maatschappelijk-teamuitje`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/impact-vrijwilligers-dankdag`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/teambuilding-zonder-wkr`,   changeFrequency: 'monthly', priority: 0.8 },
  ]

  const articlePages: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${BASE}/${a.category}/${a.slug}`,
    lastModified: new Date(a.updatedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  // Dynamic tours from DB
  let tourPages: MetadataRoute.Sitemap = []
  try {
    const publishedTours = await db
      .select({ id: tours.id, updatedAt: tours.updatedAt })
      .from(tours)
      .where(eq(tours.isPublished, true))

    tourPages = publishedTours.map(t => ({
      url: `${BASE}/tochten/${t.id}`,
      lastModified: t.updatedAt ?? now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))
  } catch {
    // Sitemap works without DB during build
  }

  return [...staticPages, ...articlePages, ...tourPages]
}
