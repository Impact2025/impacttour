import type { Article, ArticleCategory } from './types'
import { articles, getArticleBySlug } from './index'
import { getDbArticles, getDbArticleBySlug } from './db'

// Merge-laag: CMS-artikelen uit de DB krijgen voorrang op de in-repo
// geschreven artikelen (zodat Agent OS een artikel kan overschrijven),
// daarna worden de statische artikelen toegevoegd. Dubbele slugs worden
// op slug gefilterd zodat er nooit twee kaarten met dezelfde link staan.

let _dbCache: Article[] | null = null
let _dbCacheAt = 0

async function dbArticles(): Promise<Article[]> {
  const now = Date.now()
  // 60s cache binnen één server-render-cycle
  if (_dbCache && now - _dbCacheAt < 60_000) return _dbCache
  _dbCache = await getDbArticles()
  _dbCacheAt = now
  return _dbCache
}

export async function getAllArticles(): Promise<Article[]> {
  const db = await dbArticles()
  const dbSlugs = new Set(db.map((a) => a.slug))
  const merged = [...db]
  for (const a of articles) {
    if (!dbSlugs.has(a.slug)) merged.push(a)
  }
  return merged.sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1))
}

export async function getArticlesByCategoryMerged(
  category: ArticleCategory
): Promise<Article[]> {
  const all = await getAllArticles()
  return all.filter((a) => a.category === category)
}

export async function getArticleBySlugMerged(
  category: ArticleCategory,
  slug: string
): Promise<Article | undefined> {
  // DB eerst (Agent OS override)
  const dbHit = await getDbArticleBySlug(category, slug)
  if (dbHit) return dbHit
  return getArticleBySlug(category, slug)
}
