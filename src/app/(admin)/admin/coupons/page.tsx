import { db } from '@/lib/db'
import { coupons, tours } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import CouponForm from './coupon-form'
import BulkCouponForm from './bulk-coupon-form'
import { AdminActionButton } from '@/components/admin/admin-action-button'
import { Tag, Plus, Layers } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminCouponsPage() {
  const allCoupons = await db.select().from(coupons).orderBy(coupons.createdAt)
  const publishedTours = await db
    .select({ id: tours.id, name: tours.name })
    .from(tours)
    .where(eq(tours.isPublished, true))

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 bg-[#00E676] rounded-xl flex items-center justify-center">
          <Tag className="w-5 h-5 text-[#0F172A]" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#0F172A]">Couponbeheer</h1>
          <p className="text-sm text-[#94A3B8]">{allCoupons.length} coupons totaal</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: form (2/5) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Single coupon form */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#00E676]" />
              <h2 className="text-sm font-semibold text-[#0F172A]">Enkele coupon</h2>
            </div>
            <div className="p-5">
              <CouponForm tours={publishedTours} />
            </div>
          </div>

          {/* Bulk coupon form */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#00E676]" />
              <h2 className="text-sm font-semibold text-[#0F172A]">Bulk aanmaken</h2>
            </div>
            <div className="p-5">
              <BulkCouponForm tours={publishedTours} />
            </div>
          </div>
        </div>

        {/* Right: coupon list (3/5) */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E2E8F0]">
              <h2 className="text-sm font-semibold text-[#0F172A]">Bestaande coupons ({allCoupons.length})</h2>
            </div>

            {allCoupons.length === 0 ? (
              <div className="p-8 text-center text-[#94A3B8] text-sm">Nog geen coupons aangemaakt.</div>
            ) : (
              <div className="divide-y divide-[#F1F5F9]">
                {allCoupons.map((coupon) => {
                  const isExpired = coupon.expiresAt && new Date(coupon.expiresAt) < new Date()
                  const isExhausted = coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses
                  const isActive = !isExpired && !isExhausted

                  return (
                    <div key={coupon.code} className="p-4 hover:bg-[#F8FAFC] transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <code className="font-mono font-black text-[#0F172A] tracking-widest text-sm">
                              {coupon.code}
                            </code>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                              isActive ? 'bg-[#DCFCE7] text-[#166534]' : 'bg-[#F1F5F9] text-[#94A3B8]'
                            }`}>
                              {isExpired ? 'Verlopen' : isExhausted ? 'Uitgeput' : 'Actief'}
                            </span>
                          </div>
                          <div className="text-xs text-[#64748B] space-y-0.5">
                            <p>
                              {coupon.discountType === 'free' ? '100% gratis' :
                                coupon.discountType === 'percent' ? `${coupon.discountValue}% korting` :
                                `€${(coupon.discountValue / 100).toFixed(2)} korting`}
                            </p>
                            <p>Gebruikt: {coupon.usedCount}{coupon.maxUses ? ` / ${coupon.maxUses}` : ' (onbeperkt)'}</p>
                            {coupon.expiresAt && (
                              <p>Vervalt: {new Date(coupon.expiresAt).toLocaleDateString('nl-NL')}</p>
                            )}
                            {coupon.description && <p className="text-[#94A3B8] italic">{coupon.description}</p>}
                          </div>
                        </div>
                        {isActive && (
                          <AdminActionButton
                            label="Deactiveer"
                            apiUrl={`/api/admin/coupons/${coupon.code}`}
                            method="PATCH"
                            body={{ action: 'deactivate' }}
                            variant="danger"
                            confirmMessage={`Coupon ${coupon.code} deactiveren?`}
                          />
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
