import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArticleLayout } from '@/components/content/ArticleLayout'
import { articles, getArticleBySlug } from '@/lib/content'
import { getArticleBySlugMerged } from '@/lib/content/resolve'
import { getSiteUrl } from '@/lib/seo/site-url'

const SITE_URL = getSiteUrl()

// Agent OS publiceert naar de DB (posts-tabel); die slugs zitten NIET in de
// statische generateStaticParams. Zonder dynamicParams=true geeft Next.js voor
// een nieuwe DB-slug altijd 404 — ook al staat de post wel in de DB.
export const dynamicParams = true

export function generateStaticParams() {
  return articles.filter((a) => a.category === 'kennisbank').map((a) => ({ slug: a.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticleBySlugMerged('kennisbank', slug)
  if (!article) return {}

  return {
    title: article.title,
    description: article.description,
    alternates: { canonical: `/kennisbank/${article.slug}` },
    keywords: article.keywords,
    openGraph: {
      type: 'article',
      title: article.title,
      description: article.description,
      url: `/kennisbank/${article.slug}`,
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      authors: ['Vincent van Munster'],
      images: [{ url: article.image, width: 1200, height: 630, alt: article.heading }],
    },
    twitter: {
      card: 'summary_large_image',
      images: [article.image],
    },
  }
}

export default async function KennisbankArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const article =
    getArticleBySlug('kennisbank', slug) ?? (await getArticleBySlugMerged('kennisbank', slug))
  if (!article) notFound()

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.description,
    image: `${SITE_URL}${article.image}`,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    author: { '@type': 'Person', name: 'Vincent van Munster', url: 'https://weareimpact.nl' },
    publisher: { '@type': 'Organization', name: 'IctusGo', logo: `${SITE_URL}/images/IctusGo.png` },
    mainEntityOfPage: `${SITE_URL}/kennisbank/${article.slug}`,
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Kennisbank', item: `${SITE_URL}/kennisbank` },
      { '@type': 'ListItem', position: 3, name: article.title, item: `${SITE_URL}/kennisbank/${article.slug}` },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <ArticleLayout article={article} />
    </>
  )
}
