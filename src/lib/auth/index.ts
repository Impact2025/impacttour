import NextAuth from 'next-auth'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import Nodemailer from 'next-auth/providers/nodemailer'
import Credentials from 'next-auth/providers/credentials'
import { db } from '@/lib/db'
import { users, accounts, sessions, verificationTokens } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { sendMagicLinkEmail } from '@/lib/email'
import { verifyPassword } from '@/lib/auth/password'

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
    // Magic link voor spelleiders via Gmail SMTP
    Nodemailer({
      server: {
        host: 'smtp.gmail.com',
        port: 587,
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      },
      from: process.env.GMAIL_USER || 'weareimpactnl@gmail.com',
      sendVerificationRequest: async ({ identifier, url }) => {
        await sendMagicLinkEmail({ to: identifier, url })
      },
    }),

    // Credentials voor admin (email + wachtwoord)
    Credentials({
      id: 'admin-credentials',
      name: 'Admin',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Wachtwoord', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const adminEmail = process.env.ADMIN_EMAIL
        const adminPassword = process.env.ADMIN_PASSWORD

        if (
          credentials.email !== adminEmail ||
          credentials.password !== adminPassword
        ) {
          return null
        }

        // Zoek of maak admin user aan
        const existing = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials.email as string))
          .limit(1)

        if (existing[0]) {
          return {
            id: existing[0].id,
            email: existing[0].email,
            name: existing[0].name,
            role: existing[0].role,
          }
        }

        // Eerste keer: maak admin aan
        const [newAdmin] = await db
          .insert(users)
          .values({
            email: credentials.email as string,
            name: 'Admin',
            role: 'admin',
          })
          .returning()

        return {
          id: newAdmin.id,
          email: newAdmin.email,
          name: newAdmin.name,
          role: newAdmin.role,
        }
      },
    }),

    // Credentials voor marketplace klanten (email + wachtwoord)
    Credentials({
      id: 'customer-credentials',
      name: 'Klant',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Wachtwoord', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const result = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials.email as string))
          .limit(1)

        const user = result[0]
        if (!user || !user.password) return null

        const valid = verifyPassword(credentials.password as string, user.password)
        if (!valid) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      },
    }),
  ],

  callbacks: {
    async session({ session, user }) {
      if (user) {
        session.user.id = user.id
        // Haal rol op uit database
        const dbUser = await db
          .select({ role: users.role })
          .from(users)
          .where(eq(users.id, user.id))
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
