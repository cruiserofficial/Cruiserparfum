import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getDb } from '@/lib/db/index'
import { orders, orderItems, reviews } from '@/lib/db/schema'
import { and, eq } from 'drizzle-orm'
import { z } from 'zod'

const reviewSchema = z.object({
  orderNumber: z.string(),
  productId: z.string(),
  rating: z.number().int().min(1).max(5),
  title: z.string().optional(),
  body: z.string().min(5),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const data = reviewSchema.parse(await req.json())
    const db = await getDb()

    const orderRows = await db.select().from(orders).where(eq(orders.number, data.orderNumber)).limit(1)
    const order = orderRows[0]
    if (!order || order.userId !== session.user.id) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    if (!order.customerConfirmedAt) {
      return NextResponse.json({ error: 'Konfirmasi pesanan diterima dulu sebelum memberi review' }, { status: 400 })
    }

    const items = await db.select().from(orderItems)
      .where(and(eq(orderItems.orderId, order.id), eq(orderItems.productId, data.productId)))
    if (!items[0]) {
      return NextResponse.json({ error: 'Produk ini tidak ada di pesanan tersebut' }, { status: 400 })
    }

    const already = await db.select().from(reviews)
      .where(and(eq(reviews.orderId, order.id), eq(reviews.productId, data.productId)))
      .limit(1)
    if (already[0]) {
      return NextResponse.json({ error: 'Kamu sudah memberi review untuk produk ini di pesanan ini' }, { status: 400 })
    }

    const id = crypto.randomUUID()
    await db.insert(reviews).values({
      id,
      orderId: order.id,
      productId: data.productId,
      userId: session.user.id,
      customerName: session.user.name ?? 'Pelanggan CRUISER',
      rating: data.rating,
      title: data.title || null,
      body: data.body,
      isVisible: true,
      createdAt: new Date().toISOString(),
    })

    return NextResponse.json({ ok: true, id })
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: e.errors }, { status: 400 })
    }
    console.error('POST /api/account/reviews error:', e)
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 })
  }
}
