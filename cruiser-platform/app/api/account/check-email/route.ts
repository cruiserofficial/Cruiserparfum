import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db/index'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  const email = (req.nextUrl.searchParams.get('email') ?? '').trim().toLowerCase()
  if (!email) return NextResponse.json({ exists: false })

  try {
    const db = await getDb()
    const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1)
    return NextResponse.json({ exists: !!existing[0] })
  } catch {
    return NextResponse.json({ exists: false })
  }
}
