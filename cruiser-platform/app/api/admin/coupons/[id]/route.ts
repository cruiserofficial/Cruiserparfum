import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getDb } from '@/lib/db/index'
import { coupons } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

const couponUpdateSchema = z.object({
  isActive: z.boolean().optional(),
  value: z.number().int().min(0).optional(),
  minOrder: z.number().int().min(0).optional(),
  maxUses: z.number().int().positive().nullable().optional(),
  expiresAt: z.string().nullable().optional(),
})

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  try {
    const body = await req.json()
    const data = couponUpdateSchema.parse(body)

    const db = await getDb()
    const updateData: Partial<typeof coupons.$inferInsert> = {}
    if (data.isActive !== undefined) updateData.isActive = data.isActive
    if (data.value !== undefined) updateData.value = data.value
    if (data.minOrder !== undefined) updateData.minOrder = data.minOrder
    if (data.maxUses !== undefined) updateData.maxUses = data.maxUses ?? null
    if (data.expiresAt !== undefined) updateData.expiresAt = data.expiresAt ?? null

    await db.update(coupons).set(updateData).where(eq(coupons.id, id))

    const updated = await db.select().from(coupons).where(eq(coupons.id, id)).limit(1)
    if (!updated[0]) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 })
    }
    return NextResponse.json({ coupon: updated[0] })
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: e.errors }, { status: 400 })
    }
    console.error('PUT /api/admin/coupons/[id] error:', e)
    return NextResponse.json({ error: 'Failed to update coupon' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  try {
    const db = await getDb()
    await db.delete(coupons).where(eq(coupons.id, id))
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('DELETE /api/admin/coupons/[id] error:', e)
    return NextResponse.json({ error: 'Failed to delete coupon' }, { status: 500 })
  }
}
