/**
 * Handmatig een betaalde order verwerken en magic link sturen
 * Gebruik: bun scripts/resend-magic-link.ts <sessionId>
 */
import { db } from '../src/lib/db'
import { orders, gameSessions, users, tours } from '../src/lib/db/schema'
import { eq } from 'drizzle-orm'
import { generateMagicLink } from '../src/lib/auth/magic-link'
import { sendBookingConfirmationEmail } from '../src/lib/email'

const SESSION_ID = process.argv[2]
if (!SESSION_ID) {
  console.error('Gebruik: bun scripts/resend-magic-link.ts <sessionId>')
  process.exit(1)
}

const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, '') || 'https://ictusgo.nl'

const order = await db.query.orders.findFirst({ where: eq(orders.sessionId, SESSION_ID) })
if (!order) { console.error('Order niet gevonden'); process.exit(1) }

const user = await db.query.users.findFirst({ where: eq(users.id, order.userId) })
if (!user) { console.error('User niet gevonden'); process.exit(1) }

const tour = order.tourId ? await db.query.tours.findFirst({ where: eq(tours.id, order.tourId) }) : null

console.log(`Verwerken voor: ${user.email} | Order: ${order.id} | Status: ${order.status}`)

// Order markeren als betaald
await db.update(orders).set({ status: 'paid', paidAt: new Date() }).where(eq(orders.id, order.id))
await db.update(gameSessions).set({ paidAt: new Date() }).where(eq(gameSessions.id, SESSION_ID))

console.log('Order + sessie bijgewerkt naar paid')

// Magic link genereren
const magicLink = await generateMagicLink({
  email: user.email,
  callbackPath: `/klant/${SESSION_ID}/setup?betaald=1`,
  appUrl,
})

console.log('Magic link gegenereerd:', magicLink)

// Bevestigingsmail sturen
await sendBookingConfirmationEmail({
  to: user.email,
  customerName: (user.name || 'klant').split(' ')[0],
  tourName: tour?.name || 'ImpactTour',
  setupUrl: magicLink,
  loginUrl: `${appUrl}/login`,
  isPaid: true,
  amountFormatted: `€${(order.amountCents / 100).toFixed(2)}`,
  accountEmail: user.email,
})

console.log(`Mail verstuurd naar ${user.email}`)
