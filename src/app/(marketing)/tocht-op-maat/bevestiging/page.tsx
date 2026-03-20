import { db } from '@/lib/db'
import { orders, tochtAanvragen } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import Link from 'next/link'
import { CheckCircle2, Clock, AlertCircle, ArrowRight, MapPin } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function BevestigingPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>
}) {
  const { orderId } = await searchParams

  if (!orderId) {
    return <Fout message="Geen order gevonden." />
  }

  const order = await db.query.orders.findFirst({
    where: eq(orders.id, orderId),
  })

  if (!order) {
    return <Fout message="Order niet gevonden." />
  }

  const aanvraag = order.tochtAanvraagId
    ? await db.query.tochtAanvragen.findFirst({ where: eq(tochtAanvragen.id, order.tochtAanvraagId) })
    : null

  const status = aanvraag?.status ?? 'pending_payment'
  const sessionId = aanvraag?.sessionId ?? order.sessionId

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <span className="text-xl font-black text-[#0F172A]" style={{ fontFamily: 'var(--font-display)' }}>
              IctusGo
            </span>
          </Link>
        </div>

        {/* Status: actief + sessie klaar */}
        {status === 'active' && sessionId ? (
          <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-8 text-center">
            <div className="w-16 h-16 bg-[#DCFCE7] rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-[#00C853]" />
            </div>
            <h1 className="text-2xl font-black text-[#0F172A] mb-2">Tocht staat klaar!</h1>
            <p className="text-[#64748B] text-sm mb-6">
              Je tocht is aangemaakt en je hebt een magic link ontvangen per e-mail.
              Klik hieronder om direct door te gaan.
            </p>
            <div className="flex items-center gap-2 bg-[#F0FDF4] rounded-xl px-4 py-3 mb-6 text-left">
              <MapPin className="w-4 h-4 text-[#00C853] shrink-0" />
              <div>
                <p className="text-xs text-[#64748B]">Je tocht</p>
                <p className="text-sm font-semibold text-[#0F172A]">{aanvraag?.stad ?? 'Jouw stad'}</p>
              </div>
            </div>
            <Link
              href={`/klant/${sessionId}/setup`}
              className="w-full py-3 rounded-xl font-bold bg-[#00E676] text-[#0F172A] hover:bg-[#00C853] flex items-center justify-center gap-2 transition-colors"
            >
              Stel je tocht in <ArrowRight className="w-4 h-4" />
            </Link>
            <p className="text-xs text-[#94A3B8] mt-4">
              Geen e-mail ontvangen? Check je spam of{' '}
              <Link href="/login" className="text-[#00E676] hover:underline">log in</Link>.
            </p>
          </div>
        ) : status === 'building' || (order.status === 'paid' && !sessionId) ? (
          /* Status: betaald, tocht wordt gebouwd */
          <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-8 text-center">
            <div className="w-16 h-16 bg-[#FFF7ED] rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-[#F59E0B] animate-pulse" />
            </div>
            <h1 className="text-2xl font-black text-[#0F172A] mb-2">Betaling ontvangen!</h1>
            <p className="text-[#64748B] text-sm mb-6">
              We zijn je tocht aan het aanmaken en GPS-locaties aan het ophalen.
              Dit duurt maximaal 30 seconden. Je ontvangt een e-mail zodra alles klaar is.
            </p>
            <div className="flex gap-2 bg-[#F8FAFC] rounded-xl p-3 text-sm text-[#64748B] mb-6">
              <Clock className="w-4 h-4 shrink-0 mt-0.5" />
              <span>Pagina ververst automatisch…</span>
            </div>
            {/* Auto-refresh na 8 seconden */}
            <meta httpEquiv="refresh" content="8" />
            <p className="text-xs text-[#94A3B8]">
              Duurt het langer dan 1 minuut?{' '}
              <a href={`mailto:info@weareimpact.nl?subject=Tocht%20order%20${orderId}`} className="text-[#00E676] hover:underline">
                Stuur ons een bericht
              </a>
            </p>
          </div>
        ) : (
          /* Status: niet betaald of onbekend */
          <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-8 text-center">
            <div className="w-16 h-16 bg-[#FEF2F2] rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <h1 className="text-2xl font-black text-[#0F172A] mb-2">Betaling nog niet ontvangen</h1>
            <p className="text-[#64748B] text-sm mb-6">
              De betaling is nog niet bevestigd. Probeer opnieuw of neem contact op.
            </p>
            <Link
              href="/tocht-op-maat"
              className="w-full py-3 rounded-xl font-bold border-2 border-[#E2E8F0] text-[#64748B] hover:border-[#0F172A] flex items-center justify-center gap-2 transition-colors"
            >
              Terug naar wizard
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

function Fout({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-8 text-center max-w-sm">
        <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-4" />
        <p className="text-[#64748B]">{message}</p>
        <Link href="/tocht-op-maat" className="mt-4 inline-block text-[#00E676] font-bold hover:underline">
          Terug naar wizard
        </Link>
      </div>
    </div>
  )
}
