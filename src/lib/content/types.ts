export type ArticleCategory = 'blog' | 'kennisbank'

export interface Article {
  slug: string
  category: ArticleCategory
  title: string
  /** SEO meta description, max ~155 tekens */
  description: string
  /** H1 op de pagina — mag afwijken van <title> */
  heading: string
  /** Pad naar featured image, bv. /images/articles/slug.png — gebruikt voor hero + OG-image */
  image: string
  keywords: string[]
  cluster: string
  publishedAt: string
  updatedAt: string
  readingTimeMin: number
  /** Markdown body — gerenderd via renderMarkdown() */
  body: string
  relatedSlugs: string[]
  cta: 'ictusgo' | 'teambuildingmetimpact' | 'weareimpact' | 'thee' | 'lsp'
}
