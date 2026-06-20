import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { getDb } from '@/lib/db/index'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

const profileSchema = z.object({
  phone: z.string().min(9),
  address: z.string().min(10),
  district: z.string().optional().default(''),
  city: z.string().min(2),
  province: z.string().min(2),
  postalCode: z.string().min(4),
  areaId: z.string().optional().default(''),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const data = profileSchema.parse(body)

    const db = await getDb()
    await db.update(users).set({
      phone: data.phone,
      address: data.address,
      district: data.district || null,
      city: data.city,
      province: data.province,
      postalCode: data.postalCode,
      areaId: data.areaId || null,
      profileComplete: true,
    }).where(eq(users.id, session.user.id))

    return NextResponse.json({ ok: true })
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: e.errors }, { status: 400 })
    }
    console.error('POST /api/account/complete-profile error:', e)
    return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 })
  }
}
