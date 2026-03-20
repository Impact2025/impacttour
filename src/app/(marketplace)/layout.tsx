import { SiteNav } from '@/components/layout/site-nav'
import { SiteFooter } from '@/components/layout/site-footer'

export default function MarketplaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteNav />
      <div>{children}</div>
      <SiteFooter />
    </>
  )
}
