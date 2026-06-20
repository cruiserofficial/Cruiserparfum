import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db/index'
import { orders } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

const bodySchema = z.object({
  imageBase64: z.string().min(100), // data URL, e.g. "data:image/jpeg;base64,..."
})

interface RouteParams {
  params: Promise<{ number: string }>
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  const { number: orderNumber } = await params

  try {
    const data = bodySchema.parse(await req.json())

    const db = await getDb()
    const existing = await db.select().from(orders).where(eq(orders.number, orderNumber)).limit(1)
    if (!existing[0]) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    if (existing[0].paymentMethod !== 'bank_transfer') {
      return NextResponse.json({ error: 'Order ini tidak menggunakan transfer bank' }, { status: 400 })
    }

    await db.update(orders)
      .set({ paymentProofUrl: data.imageBase64, updatedAt: new Date().toISOString() })
      .where(eq(orders.number, orderNumber))

    return NextResponse.json({ ok: true })
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
    }
    console.error('POST /api/orders/[number]/payment-proof error:', e)
    return NextResponse.json({ error: 'Failed to upload proof' }, { status: 500 })
  }
}
