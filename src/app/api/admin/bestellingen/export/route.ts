import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { orders, tours } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await auth()
  if (!session || session.user.role !== 'admin') {
    return new Response('Geen toegang', { status: 403 })
  }

  const rows = await db
    .select({
      id: orders.id,
      customerName: orders.customerName,
      customerEmail: orders.customerEmail,
      organizationName: orders.organizationName,
      tourName: tours.name,
      tourVariant: tours.variant,
      amountCents: orders.amountCents,
      couponCode: orders.couponCode,
      status: orders.status,
      participantCount: orders.participantCount,
      paidAt: orders.paidAt,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .leftJoin(tours, eq(orders.tourId, tours.id))
    .orderBy(desc(orders.createdAt))

  const headers = ['ID', 'Klant', 'Email', 'Organisatie', 'Tocht', 'Variant', 'Bedrag (€)', 'Coupon', 'Status', 'Deelnemers', 'Betaald op', 'Aangemeld op']
  const escapeCSV = (v: unknown) => {
    const s = String(v ?? '')
    return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s
  }

  const csvRows = [
    headers.join(','),
    ...rows.map(r => [
      r.id, r.customerName ?? '', r.customerEmail, r.organizationName ?? '',
      r.tourName ?? '', r.tourVariant ?? '', ((r.amountCents ?? 0) / 100).toFixed(2),
      r.couponCode ?? '', r.status, r.participantCount ?? '',
      r.paidAt ? new Date(r.paidAt).toLocaleDateString('nl-NL') : '',
      new Date(r.createdAt).toLocaleDateString('nl-NL'),
    ].map(escapeCSV).join(',')),
  ]

  return new Response(csvRows.join('\n'), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="bestellingen-${new Date().toISOString().split('T')[0]}.csv"`,
    },
  })
}
