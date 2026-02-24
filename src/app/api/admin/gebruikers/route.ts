import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { NextResponse } from 'next/server'
import { desc, ilike, or, sql } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const session = await auth()
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') ?? ''

  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      organizationName: users.organizationName,
      phone: users.phone,
      tourCount: sql<number>`(SELECT COUNT(*) FROM tours WHERE created_by_id = ${users.id})`,
      sessionCount: sql<number>`(SELECT COUNT(*) FROM game_sessions WHERE spelleider_id = ${users.id})`,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(q ? or(ilike(users.email, `%${q}%`), ilike(users.name, `%${q}%`), ilike(users.organizationName, `%${q}%`)) : undefined)
    .orderBy(desc(users.createdAt))
    .limit(50)

  return NextResponse.json(rows)
}
