import { db } from '../src/lib/db'
import { orders, gameSessions, webhookEvents } from '../src/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

const SESSION_ID = 'd5175d2e-fe24-4a02-b749-b3b3b79c2757'

const order = await db.query.orders.findFirst({ where: eq(orders.sessionId, SESSION_ID) })
console.log('ORDER:', JSON.stringify(order, null, 2))

const session = await db.query.gameSessions.findFirst({ where: eq(gameSessions.id, SESSION_ID) })
console.log('SESSION:', { status: session?.status, paidAt: session?.paidAt, source: session?.source })

const recentWebhooks = await db.select().from(webhookEvents).orderBy(desc(webhookEvents.createdAt)).limit(5)
console.log('RECENT WEBHOOKS:', JSON.stringify(recentWebhooks.map(w => ({ id: w.id, status: w.status, eventId: w.eventId, error: w.errorMessage, createdAt: w.createdAt })), null, 2))
