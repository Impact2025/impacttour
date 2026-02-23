import { db } from '@/lib/db'
import { gameSessions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'

/**
 * GET /api/game/preview?code=ABC123
 * Publieke preview van een sessie op basis van join code.
 * Geeft variant, tour naam en vooraf aangemaakte teams terug — geen gevoelige data.
 * Gebruikt door de join-pagina om variant-specifieke UI te tonen.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')?.toUpperCase()

  if (!code || code.length !== 6) {
    return NextResponse.json({ error: 'Ongeldige code' }, { status: 400 })
  }

  const session = await db.query.gameSessions.findFirst({
    where: eq(gameSessions.joinCode, code),
    with: {
      tour: { columns: { name: true } },
      teams: { columns: { name: true } },
    },
  })

  if (!session || session.status === 'cancelled') {
    return NextResponse.json({ error: 'Niet gevonden' }, { status: 404 })
  }

  return NextResponse.json({
    variant: session.variant,
    tourName: session.tour?.name ?? '',
    status: session.status,
    preCreatedTeams: session.teams.map((t) => t.name),
  })
}
