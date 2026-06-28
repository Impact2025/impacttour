import { MetadataRoute } from 'next'

const BASE = (process.env.NEXT_PUBLIC_APP_URL ?? 'https://ictusgo.nl').replace(/\/$/, '')

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/login/', '/admin/', '/join/'],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  }
}
