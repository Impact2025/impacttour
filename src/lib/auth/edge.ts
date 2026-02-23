/**
 * Edge-safe auth instantie voor gebruik in middleware.
 * Geen Nodemailer/Credentials providers (die Node.js stream/crypto vereisen).
 * Alleen session-verificatie via de DrizzleAdapter + Neon HTTP driver.
 */
import NextAuth from 'next-auth'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import { db } from '@/lib/db'
import { users, accounts, sessions, verificationTokens } from '@/lib/db/schema'

export const { auth } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  session: {
    strategy: 'database',
    maxAge: 30 * 24 * 60 * 60,
  },
  providers: [], // Geen providers nodig — middleware checkt alleen sessies
  pages: {
    signIn: '/login',
    verifyRequest: '/login/verify',
    error: '/login/error',
  },
})
