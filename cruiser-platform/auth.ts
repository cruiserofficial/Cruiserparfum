import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string | null
      image: string | null
      role: 'customer' | 'admin'
      profileComplete: boolean
    }
  }
}

async function hashPassword(password: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password))
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('')
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        name: { label: 'Name', type: 'text' },
        isNew: { label: 'Is New', type: 'text' },
      },
      async authorize(credentials) {
        const email = ((credentials?.email as string) ?? '').trim().toLowerCase()
        const password = credentials?.password as string
        const name = credentials?.name as string
        const isNew = credentials?.isNew as string

        if (!email) return null

        // Admin login — check env vars (no DB needed)
        if (
          email === (process.env.ADMIN_EMAIL ?? '').toLowerCase() &&
          password === process.env.ADMIN_PASSWORD
        ) {
          return { id: 'admin', email, name: 'Admin CRUISER', role: 'admin' }
        }

        // DB-backed customer auth
        try {
          const { getDb } = await import('@/lib/db/index')
          const { users } = await import('@/lib/db/schema')
          const { eq } = await import('drizzle-orm')
          const db = await getDb()

          // New customer registration — hash password and insert into DB
          if (isNew === 'true' && name && email && password) {
            // Check if email already taken
            const existing = await db.select().from(users).where(eq(users.email, email)).limit(1)
            if (existing[0]) {
              // Email already registered — treat as login attempt
              const hash = await hashPassword(password)
              if (existing[0].passwordHash === hash) {
                return { id: existing[0].id, email: existing[0].email, name: existing[0].name, role: 'customer' }
              }
              return null
            }

            const id = `user_${Date.now()}`
            const passwordHash = await hashPassword(password)
            await db.insert(users).values({
              id,
              email,
              name,
              passwordHash,
              role: 'customer',
              createdAt: new Date().toISOString(),
            })
            return { id, email, name, role: 'customer' }
          }

          // Returning customer login — verify against DB
          const stored = await db.select().from(users).where(eq(users.email, email)).limit(1)
          if (!stored[0] || !stored[0].passwordHash) return null

          const hash = await hashPassword(password)
          if (stored[0].passwordHash !== hash) return null

          return { id: stored[0].id, email: stored[0].email, name: stored[0].name, role: 'customer' }
        } catch (dbError) {
          console.error('Auth DB error:', dbError)
          return null
        }
      },
    }),
  ],

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },

  callbacks: {
    async signIn({ user, account }) {
      // Google OAuth — upsert a users row so the customer is tracked in the DB,
      // and so we know whether they still need to complete their profile.
      if (account?.provider === 'google' && user.email) {
        try {
          const { getDb } = await import('@/lib/db/index')
          const { users } = await import('@/lib/db/schema')
          const { eq } = await import('drizzle-orm')
          const db = await getDb()

          const email = user.email.trim().toLowerCase()
          const existing = await db.select().from(users).where(eq(users.email, email)).limit(1)

          if (!existing[0]) {
            await db.insert(users).values({
              id: `user_${Date.now()}`,
              email,
              name: user.name ?? email,
              passwordHash: null,
              role: 'customer',
              profileComplete: false,
              createdAt: new Date().toISOString(),
            })
          }
        } catch (e) {
          console.error('Google sign-in DB upsert error:', e)
          // Don't block sign-in on a DB hiccup
        }
      }
      return true
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        const adminEmail = process.env.ADMIN_EMAIL ?? ''
        const adminEmails = (process.env.ADMIN_EMAILS ?? '').split(',').map((e) => e.trim())
        const isAdmin =
          (user.email && adminEmails.includes(user.email)) ||
          user.email === adminEmail ||
          (user as { role?: string }).role === 'admin'
        token.role = isAdmin ? 'admin' : 'customer'

        // Look up profile completion status from the DB (admin is always complete)
        if (isAdmin) {
          token.profileComplete = true
        } else if (user.email) {
          try {
            const { getDb } = await import('@/lib/db/index')
            const { users } = await import('@/lib/db/schema')
            const { eq } = await import('drizzle-orm')
            const db = await getDb()
            const row = await db.select().from(users).where(eq(users.email, user.email.trim().toLowerCase())).limit(1)
            token.profileComplete = row[0]?.profileComplete ?? true
            if (row[0]) token.id = row[0].id
          } catch {
            token.profileComplete = true
          }
        }
      }

      // Client called `update()` after completing the profile form — trust it directly
      if (trigger === 'update' && session?.profileComplete) {
        token.profileComplete = true
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) ?? token.sub ?? ''
        session.user.role = (token.role as 'customer' | 'admin') ?? 'customer'
        session.user.profileComplete = (token.profileComplete as boolean) ?? true
      }
      return session
    },
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },
})
