import { auth } from '@/lib/auth'
import { generateHints } from '@/lib/ai'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({
  missionTitle: z.string().min(1),
  missionDescription: z.string().min(1),
})

/** POST /api/ai/hints — Genereer 3 hints voor een opdracht */
export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Ongeldige gegevens' }, { status: 400 })
  }

  const hints = await generateHints(parsed.data.missionTitle, parsed.data.missionDescription)
  return NextResponse.json(hints)
}
