import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { coupons, tours } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import Link from 'next/link'
import CouponForm from './coupon-form'
import { Tag, ArrowLeft, Plus } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminCouponsPage() {
  const session = await auth()
  if (!session || session.user.role !== 'admin') redirect('/spelleider/dashboard')

  const allCoupons = await db.select().from(coupons).orderBy(coupons.createdAt)
  const publishedTours = await db
    .select({ id: tours.id, name: tours.name })
    .from(tours)
    .where(eq(tours.isPublished, true))

  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/admin/dashboard" className="text-[#94A3B8] hover:text-[#64748B] transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="w-8 h-8 bg-[#00E676] rounded-lg flex items-center justify-center">
            <Tag className="w-4 h-4 text-[#0F172A]" />
          </div>
          <h1 className="text-xl font-bold text-[#0F172A]">Couponbeheer</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nieuwe coupon */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
            <h2 className="text-base font-semibold text-[#0F172A] mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#00E676]" />
              Nieuwe coupon
            </h2>
            <CouponForm tours={publishedTours} />
          </div>

          {/* Bestaande coupons */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
            <h2 className="text-base font-semibold text-[#0F172A] mb-4">
              Bestaande coupons ({allCoupons.length})
            </h2>

            {allCoupons.length === 0 ? (
              <p className="text-[#94A3B8] text-sm">Nog geen coupons aangemaakt.</p>
            ) : (
              <div className="space-y-3">
                {allCoupons.map((coupon) => {
                  const isExpired = coupon.expiresAt && new Date(coupon.expiresAt) < new Date()
                  const isExhausted = coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses
                  const isActive = !isExpired && !isExhausted

                  return (
                    <div key={coupon.code} className={`p-4 rounded-xl border ${isActive ? 'border-[#DCFCE7] bg-[#F0FDF4]' : 'border-[#E2E8F0] bg-[#F8FAFC]'}`}>
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <code className="font-mono font-black text-[#0F172A] tracking-widest text-sm">
                          {coupon.code}
                        </code>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
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
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
