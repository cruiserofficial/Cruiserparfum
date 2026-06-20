import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getDb } from '@/lib/db/index'
import { coupons } from '@/lib/db/schema'
import { z } from 'zod'
import { desc } from 'drizzle-orm'

const couponSchema = z.object({
  code: z.string().min(1).transform((s) => s.toUpperCase()),
  type: z.enum(['percentage', 'fixed', 'free_shipping']),
  value: z.number().int().min(0).default(0),
  minOrder: z.number().int().min(0).default(0),
  maxUses: z.number().int().positive().nullable().optional(),
  expiresAt: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
})

export async function GET() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const db = await getDb()
    const rows = await db.select().from(coupons).orderBy(desc(coupons.createdAt))
    return NextResponse.json({ coupons: rows })
  } catch (e) {
    console.error('GET /api/admin/coupons error:', e)
    return NextResponse.json({ error: 'Failed to load coupons' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const data = couponSchema.parse(body)

    const db = await getDb()
    const now = new Date().toISOString()
    const id = `c_${Date.now()}`

    await db.insert(coupons).values({
      id,
      code: data.code,
      type: data.type,
      value: data.value,
      minOrder: data.minOrder,
      maxUses: data.maxUses ?? null,
      usedCount: 0,
      expiresAt: data.expiresAt ?? null,
      isActive: data.isActive,
      createdAt: now,
    })

    const inserted = await db.select().from(coupons)
    const found = inserted.find((c) => c.id === id)
    return NextResponse.json({ coupon: found }, { status: 201 })
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: e.errors }, { status: 400 })
    }
    console.error('POST /api/admin/coupons error:', e)
    return NextResponse.json({ error: 'Failed to create coupon' }, { status: 500 })
  }
}

