import NextAuth from 'next-auth'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import Resend from 'next-auth/providers/resend'
import { db } from '@/lib/db'
import { users, accounts, sessions, verificationTokens } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { sendMagicLinkEmail } from '@/lib/email'

// Wachtwoord-logins (admin, spelleider, klant) lopen NIET via NextAuth:
// NextAuth v5 (beta) maakt met de database-session strategie geen sessie aan
// voor Credentials-providers. Die flows gebruiken server actions die zelf een
// sessie aanmaken via `createUserSession()` — zie:
//   - app/(admin-auth)/admin/login/actions.ts
//   - app/login/actions.ts
// NextAuth handelt hier alleen de magic-link (Resend) provider af.

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),

  session: {
    strategy: 'database',
    maxAge: 30 * 24 * 60 * 60, // 30 dagen
  },

  providers: [
    // Magic link voor spelleiders via Resend
    Resend({
      apiKey: process.env.RESEND_API_KEY,
      from: 'IctusGo <noreply@ictusgo.nl>',
      sendVerificationRequest: async ({ identifier, url }) => {
        await sendMagicLinkEmail({ to: identifier, url })
      },
    }),
  ],

  callbacks: {
    async session({ session, user }) {
      // user is populated for database sessions (OAuth/magic link)
      // Voor credentials logins: user kan undefined zijn — gebruik session.user.id als fallback
      const userId = user?.id ?? session.user?.id
      if (userId) {
        session.user.id = userId
        const dbUser = await db
          .select({ role: users.role })
          .from(users)
          .where(eq(users.id, userId))
          .limit(1)
        session.user.role = dbUser[0]?.role ?? 'spelleider'
      }
      return session
    },
  },

  pages: {
    signIn: '/login',
    verifyRequest: '/login/verify',
    error: '/login/error',
  },
})
