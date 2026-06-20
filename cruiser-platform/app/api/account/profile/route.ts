import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getDb } from '@/lib/db/index'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const db = await getDb()
    const rows = await db.select({
      name: users.name,
      phone: users.phone,
      address: users.address,
      district: users.district,
      city: users.city,
      province: users.province,
      postalCode: users.postalCode,
      areaId: users.areaId,
    }).from(users).where(eq(users.id, session.user.id)).limit(1)

    return NextResponse.json({ profile: rows[0] ?? null })
  } catch (e) {
    console.error('GET /api/account/profile error:', e)
    return NextResponse.json({ profile: null })
  }
}
