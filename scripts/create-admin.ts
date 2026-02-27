/**
 * Maakt of update een admin account in de database.
 * Run: bun scripts/create-admin.ts
 */
import { db } from '../src/lib/db'
import { users } from '../src/lib/db/schema'
import { eq } from 'drizzle-orm'
import { hashPassword } from '../src/lib/auth/password'

const EMAIL = 'v.munster@weareimpact.nl'
const PASSWORD = 'Demo1234!'
const NAME = 'Vincent Munster'

async function main() {
  const hashed = hashPassword(PASSWORD)

  const existing = await db.select().from(users).where(eq(users.email, EMAIL)).limit(1)

  if (existing[0]) {
    await db.update(users).set({
      role: 'admin',
      password: hashed,
      name: NAME,
      updatedAt: new Date(),
    }).where(eq(users.email, EMAIL))
    console.log(`✅ Admin account bijgewerkt: ${EMAIL}`)
  } else {
    await db.insert(users).values({
      email: EMAIL,
      name: NAME,
      role: 'admin',
      password: hashed,
    })
    console.log(`✅ Admin account aangemaakt: ${EMAIL}`)
  }

  process.exit(0)
}

main().catch(err => { console.error('❌', err); process.exit(1) })
