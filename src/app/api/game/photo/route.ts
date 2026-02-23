import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { db } from '@/lib/db'
import { gameSessions, teams } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const sessionId = formData.get('sessionId') as string | null
    const teamToken = formData.get('teamToken') as string | null

    if (!file || !sessionId || !teamToken) {
      return NextResponse.json({ error: 'Ontbrekende velden' }, { status: 400 })
    }

    // Verifieer team
    const [session] = await db
      .select({ id: gameSessions.id, variant: gameSessions.variant })
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

    // Upload naar Vercel Blob
    const filename = `game/${sessionId}/${team.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
    const blob = await put(filename, file, {
      access: 'public',
      contentType: file.type,
    })

    return NextResponse.json({ url: blob.url })
  } catch (err) {
    console.error('Photo upload error:', err)
    return NextResponse.json({ error: 'Upload mislukt' }, { status: 500 })
  }
}
