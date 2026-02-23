import { db } from '@/lib/db'
import { submissions } from '@/lib/db/schema'
import { and, isNotNull, lte, sql } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { del } from '@vercel/blob'

/**
 * GET /api/cron/cleanup-photos
 * Vercel Cron Job: dagelijks om 03:00 UTC (geconfigureerd in vercel.json)
 * Verwijdert JeugdTocht foto's waarvan de scheduledDeleteAt verstreken is.
 * Privacy-vereiste: foto's maximaal 30 dagen bewaren.
 */
export async function GET(req: Request) {
  // Verifieer Vercel Cron authenticatie
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()

  // Zoek verlopen foto's
  const expiredSubmissions = await db
    .select({ id: submissions.id, photoUrl: submissions.photoUrl })
    .from(submissions)
    .where(
      and(
        isNotNull(submissions.photoUrl),
        isNotNull(submissions.scheduledDeleteAt),
        lte(submissions.scheduledDeleteAt, now)
      )
    )

  if (expiredSubmissions.length === 0) {
    return NextResponse.json({ deleted: 0, message: 'Geen verlopen foto\'s gevonden' })
  }

  let deletedCount = 0
  const errors: string[] = []

  for (const sub of expiredSubmissions) {
    try {
      if (sub.photoUrl) {
        // Verwijder van Vercel Blob
        await del(sub.photoUrl)
      }

      // Wis photoUrl en scheduledDeleteAt in DB
      await db
        .update(submissions)
        .set({
          photoUrl: null,
          scheduledDeleteAt: null,
        })
        .where(sql`${submissions.id} = ${sub.id}`)

      deletedCount++
    } catch (err) {
      errors.push(`${sub.id}: ${String(err)}`)
    }
  }

  console.log(`[cleanup-photos] Verwijderd: ${deletedCount}/${expiredSubmissions.length}`)

  return NextResponse.json({
    deleted: deletedCount,
    total: expiredSubmissions.length,
    errors: errors.length > 0 ? errors : undefined,
  })
}
