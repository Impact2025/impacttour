import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'
import { NextResponse } from 'next/server'

/**
 * GET /api/health
 * Health check endpoint voor Vercel monitoring en uptime services.
 * Controleert DB connectie en geeft systeemstatus terug.
 */
export const dynamic = 'force-dynamic'

export async function GET() {
  const startTime = Date.now()

  try {
    // Controleer DB connectie
    await db.execute(sql`SELECT 1`)
    const dbLatency = Date.now() - startTime

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      db: { status: 'ok', latencyMs: dbLatency },
      version: process.env.NEXT_PUBLIC_APP_VERSION ?? '1.0.0',
    })
  } catch (err) {
    console.error('[health] DB check mislukt:', err)
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        db: { status: 'error' },
      },
      { status: 503 }
    )
  }
}
