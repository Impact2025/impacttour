import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { tours } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { put } from '@vercel/blob'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(req: Request, { params }: { params: Promise<{ tourId: string }> }) {
  const session = await auth()
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
  }

  const { tourId } = await params

  const tour = await db.query.tours.findFirst({ where: eq(tours.id, tourId) })
  if (!tour) return NextResponse.json({ error: 'Niet gevonden' }, { status: 404 })

  const formData = await req.formData()
  const file = formData.get('image') as File | null
  if (!file || file.size === 0) return NextResponse.json({ error: 'Geen bestand' }, { status: 400 })

  const allowed = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowed.includes(file.type)) {
    return NextResponse.json({ error: 'Alleen JPG, PNG of WebP toegestaan' }, { status: 400 })
  }
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'Maximaal 5 MB' }, { status: 400 })
  }

  const ext = file.type === 'image/webp' ? 'webp' : file.type === 'image/png' ? 'png' : 'jpg'
  const filename = `tours/${tourId}/hero.${ext}`
  const blob = await put(filename, file, { access: 'public', contentType: file.type })

  const existing = (tour.aiConfig ?? {}) as Record<string, unknown>
  await db.update(tours)
    .set({ aiConfig: { ...existing, imageUrl: blob.url }, updatedAt: new Date() })
    .where(eq(tours.id, tourId))

  return NextResponse.json({ url: blob.url })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ tourId: string }> }) {
  const session = await auth()
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
  }

  const { tourId } = await params
  const tour = await db.query.tours.findFirst({ where: eq(tours.id, tourId) })
  if (!tour) return NextResponse.json({ error: 'Niet gevonden' }, { status: 404 })

  const existing = (tour.aiConfig ?? {}) as Record<string, unknown>
  const { imageUrl: _, ...rest } = existing
  await db.update(tours)
    .set({ aiConfig: rest, updatedAt: new Date() })
    .where(eq(tours.id, tourId))

  return NextResponse.json({ success: true })
}
