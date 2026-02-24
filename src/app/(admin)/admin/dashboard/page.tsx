import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { users, gameSessions, tours, orders, coupons } from '@/lib/db/schema'
import { count, eq } from 'drizzle-orm'
import Link from 'next/link'
import Image from 'next/image'
import { Tag, Users, Map, ShoppingBag, Navigation } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const session = await auth()
  if (!session || session.user.role !== 'admin') redirect('/spelleider/dashboard')

  const [userCount] = await db.select({ count: count() }).from(users)
  const [sessionCount] = await db.select({ count: count() }).from(gameSessions)
  const [tourCount] = await db.select({ count: count() }).from(tours)
  const [orderCount] = await db.select({ count: count() }).from(orders)
  const [couponCount] = await db.select({ count: count() }).from(coupons)
  const [paidOrders] = await db.select({ count: count() }).from(orders).where(eq(orders.status, 'paid'))

  const stats = [
    { label: 'Gebruikers', value: userCount.count, Icon: Users },
    { label: 'Sessies', value: sessionCount.count, Icon: Map },
    { label: 'Tochten', value: tourCount.count, Icon: Navigation },
    { label: 'Bestellingen', value: orderCount.count, Icon: ShoppingBag },
    { label: 'Betaald', value: paidOrders.count, Icon: ShoppingBag },
    { label: 'Coupons', value: couponCount.count, Icon: Tag },
  ]

  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-center gap-3 mb-8">
          <Image src="/images/IctusGo.png" alt="IctusGo" width={120} height={36} className="h-8 w-auto" />
          <h1 className="text-xl font-bold text-[#0F172A]">Admin Dashboard</h1>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {stats.map(({ label, value, Icon }) => (
            <div key={label} className="bg-white rounded-xl p-5 border border-[#E2E8F0] shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-[#F1F5F9] flex items-center justify-center mb-3">
                <Icon className="w-4 h-4 text-[#64748B]" />
              </div>
              <div className="text-2xl font-bold text-[#0F172A]">{value}</div>
              <div className="text-sm text-[#94A3B8]">{label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { label: 'Coupons beheren', href: '/admin/coupons', Icon: Tag },
            { label: 'Tochten publiceren', href: '/spelleider/tochten', Icon: Map },
          ].map(({ label, href, Icon }) => (
            <Link key={label} href={href}
              className="flex items-center gap-2.5 px-4 py-3 bg-white border border-[#E2E8F0] rounded-xl shadow-sm hover:shadow-md transition-shadow text-sm font-medium text-[#0F172A]">
              <Icon className="w-4 h-4 text-[#64748B]" />
              {label}
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
