import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { db } from '@/lib/db'
import { gameSessions, teams } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { checkOrigin } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  if (!checkOrigin(req)) {
    return NextResponse.json({ error: 'Verboden' }, { status: 403 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const sessionId = formData.get('sessionId') as string | null
    const teamToken = formData.get('teamToken') as string | null

    if (!file || !sessionId || !teamToken) {
      return NextResponse.json({ error: 'Ontbrekende velden' }, { status: 400 })
    }

    // Bestandsgrootte: max 10MB
    const MAX_FILE_SIZE = 10 * 1024 * 1024
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'Foto te groot (max 10MB)' }, { status: 400 })
    }

    // MIME-type voorcontrole (client-side waarde, nog niet vertrouwd)
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Ongeldig bestandstype. Alleen foto\'s toegestaan.' }, { status: 400 })
    }

    // Server-side magic bytes verificatie (voorkomt spoofing via file.type)
    const arrayBuffer = await file.arrayBuffer()
    const bytes = new Uint8Array(arrayBuffer)
    const isJpeg = bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF
    const isPng  = bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47
    const isWebP = bytes.length > 11 &&
      bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
      bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
    // HEIC/HEIF: bytes 4-7 bevatten 'ftyp' (ISO Base Media file format)
    const isHEIC = bytes.length > 11 &&
      bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70
    if (!isJpeg && !isPng && !isWebP && !isHEIC) {
      return NextResponse.json({ error: 'Ongeldig bestandstype. Alleen JPG, PNG, WebP of HEIC toegestaan.' }, { status: 400 })
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

    // Upload naar Vercel Blob (gebruik arrayBuffer die al gelezen is voor magic bytes check)
    // TODO (prod-milestone): verander access: 'public' → 'private' zodra Vercel Blob
    // private blobs ondersteunt. Clients moeten dan /api/game/photo/serve gebruiken.
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80)
    const filename = `game/${sessionId}/${team.id}/${Date.now()}-${safeName}`
    const fileBlob = new Blob([arrayBuffer], { type: file.type })
    const blob = await put(filename, fileBlob, {
      access: 'public',
      contentType: file.type,
    })

    return NextResponse.json({ url: blob.url })
  } catch (err) {
    console.error('Photo upload error:', err)
    return NextResponse.json({ error: 'Upload mislukt' }, { status: 500 })
  }
}
