import { db } from '@/lib/db'
import { gameSessions, teams } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/game/photo/serve?url=<blobUrl>&sessionId=<id>&teamToken=<token>
 *
 * Geauthenticeerde foto-proxy.
 *
 * Huidige status: Vercel Blob v0.27 ondersteunt alleen `access: 'public'`.
 * Dit endpoint voegt een auth-gate toe op app-niveau zodat alleen teams
 * die bij een sessie horen de foto's kunnen ophalen.
 *
 * Productie-milestone: zodra Vercel Blob `access: 'private'` ondersteunt,
 * verander in upload route `access: 'public'` → `access: 'private'` en
 * stuur clients naar dit endpoint i.p.v. de directe blob-URL.
 *
 * Beveiliging:
 * - Valideer teamToken hoort bij de sessie
 * - Valideer blobUrl behoort tot dezelfde sessie (path-check)
 * - Stream blob content door met juiste Content-Type
 */
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const blobUrl = searchParams.get('url')
  const sessionId = searchParams.get('sessionId')
  const teamToken = searchParams.get('teamToken')

  if (!blobUrl || !sessionId || !teamToken) {
    return NextResponse.json({ error: 'Ontbrekende parameters' }, { status: 400 })
  }

  // Valideer URL-formaat (alleen Vercel Blob URLs toegestaan)
  let parsedUrl: URL
  try {
    parsedUrl = new URL(blobUrl)
  } catch {
    return NextResponse.json({ error: 'Ongeldige URL' }, { status: 400 })
  }

  const VERCEL_BLOB_HOSTS = ['public.blob.vercel-storage.com', 'blob.vercel-storage.com']
  if (!VERCEL_BLOB_HOSTS.some((h) => parsedUrl.hostname.endsWith(h))) {
    return NextResponse.json({ error: 'Ongeldig brondomein' }, { status: 400 })
  }

  // Controleer of de blob-path de sessieId bevat (path: game/{sessionId}/{teamId}/...)
  const expectedPrefix = `/game/${sessionId}/`
  if (!parsedUrl.pathname.includes(expectedPrefix)) {
    return NextResponse.json({ error: 'Foto behoort niet tot deze sessie' }, { status: 403 })
  }

  // Verifieer teamToken behoort tot de sessie
  const [session] = await db
    .select({ id: gameSessions.id })
    .from(gameSessions)
    .where(eq(gameSessions.id, sessionId))
    .limit(1)

  if (!session) {
    return NextResponse.json({ error: 'Sessie niet gevonden' }, { status: 404 })
  }

  const [team] = await db
    .select({ id: teams.id })
    .from(teams)
    .where(and(eq(teams.gameSessionId, sessionId), eq(teams.teamToken, teamToken)))
    .limit(1)

  if (!team) {
    return NextResponse.json({ error: 'Ongeldig team token' }, { status: 401 })
  }

  // Haal foto op en stream terug
  try {
    const upstream = await fetch(blobUrl, { cache: 'no-store' })
    if (!upstream.ok) {
      return NextResponse.json({ error: 'Foto niet beschikbaar' }, { status: 502 })
    }

    const contentType = upstream.headers.get('content-type') ?? 'image/jpeg'
    const buffer = await upstream.arrayBuffer()

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'private, max-age=3600',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch {
    return NextResponse.json({ error: 'Ophalen mislukt' }, { status: 500 })
  }
}
