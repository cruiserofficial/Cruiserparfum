import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getDb } from '@/lib/db/index'
import { orders } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

const updateOrderSchema = z.object({
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']).optional(),
  trackingNumber: z.string().nullable().optional(),
  courier: z.string().nullable().optional(),
})

interface RouteParams {
  params: Promise<{ number: string }>
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { number: orderNumber } = await params
  try {
    const body = await req.json()
    const data = updateOrderSchema.parse(body)

    const db = await getDb()
    const now = new Date().toISOString()

    const updateData: Partial<typeof orders.$inferInsert> = { updatedAt: now }
    if (data.status !== undefined) updateData.status = data.status
    if (data.trackingNumber !== undefined) updateData.trackingNumber = data.trackingNumber ?? undefined
    if (data.courier !== undefined) updateData.courier = data.courier ?? undefined

    // Auto-set status to shipped when tracking is added
    if (data.trackingNumber && !data.status) {
      updateData.status = 'shipped'
    }

    await db.update(orders).set(updateData).where(eq(orders.number, orderNumber))

    const updated = await db.select().from(orders).where(eq(orders.number, orderNumber)).limit(1)
    if (!updated[0]) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json({ order: updated[0] })
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: e.errors }, { status: 400 })
    }
    console.error('PUT /api/admin/orders/[number] error:', e)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}
