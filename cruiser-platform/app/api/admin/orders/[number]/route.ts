import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getDb } from '@/lib/db/index'
import { orders, orderItems, adminSettings } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { createOrder, PRODUCT_WEIGHT_GRAMS } from '@/lib/biteship'

const updateOrderSchema = z.object({
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']).optional(),
  trackingNumber: z.string().nullable().optional(),
  courier: z.string().nullable().optional(),
  confirmPayment: z.boolean().optional(), // admin clicked "Proses" — counts order into Total Revenue
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

    if (data.confirmPayment) {
      updateData.paymentConfirmedAt = now
      if (!data.status) updateData.status = 'processing'
    }

    await db.update(orders).set(updateData).where(eq(orders.number, orderNumber))

    let updated = await db.select().from(orders).where(eq(orders.number, orderNumber)).limit(1)
    if (!updated[0]) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Attempt to create a real Biteship shipment when payment is confirmed.
    // Failures here must never block payment confirmation — admin can still
    // enter a tracking number manually as a fallback.
    const order = updated[0]
    if (data.confirmPayment && !order.biteshipOrderId && order.courierCode && order.serviceCode && order.destinationAreaId) {
      try {
        const originRow = await db.select().from(adminSettings).where(eq(adminSettings.key, 'shipping_origin')).limit(1)
        const origin = originRow[0] ? JSON.parse(originRow[0].value) as {
          contactName?: string; phone?: string; address?: string; areaId?: string; postalCode?: string
        } : null

        if (!origin?.contactName || !origin.phone || !origin.address || !origin.areaId) {
          throw new Error('Alamat pengirim belum diatur di Admin Settings')
        }

        const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id))

        const result = await createOrder({
          origin: {
            contactName: origin.contactName,
            contactPhone: origin.phone,
            address: origin.address,
            areaId: origin.areaId,
            postalCode: origin.postalCode ?? '',
          },
          destination: {
            contactName: order.recipient,
            contactPhone: order.phone,
            address: order.address,
            areaId: order.destinationAreaId,
            postalCode: order.postalCode,
          },
          courierCode: order.courierCode,
          serviceCode: order.serviceCode,
          orderNote: `Order ${order.number}`,
          items: items.map((item) => ({
            name: item.name,
            value: item.price,
            quantity: item.quantity,
            weight: PRODUCT_WEIGHT_GRAMS,
          })),
        })

        await db.update(orders).set({
          biteshipOrderId: result.id,
          biteshipError: null,
          trackingNumber: order.trackingNumber ?? result.courier?.waybill_id ?? null,
          updatedAt: now,
        }).where(eq(orders.number, orderNumber))
      } catch (shipError) {
        console.error('Biteship order creation failed (non-fatal):', shipError)
        await db.update(orders).set({
          biteshipError: shipError instanceof Error ? shipError.message : 'Gagal membuat pengiriman Biteship',
          updatedAt: now,
        }).where(eq(orders.number, orderNumber))
      }

      updated = await db.select().from(orders).where(eq(orders.number, orderNumber)).limit(1)
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
