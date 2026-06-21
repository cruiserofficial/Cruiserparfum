import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { generateOrderNumber } from '@/lib/utils'
import { getDb } from '@/lib/db/index'
import { orders, orderItems } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { auth } from '@/auth'
import { sendTelegramMessage, buildNewOrderMessage } from '@/lib/telegram'
import { cancelExpiredOrders } from '@/lib/order-expiry'

const orderSchema = z.object({
  email: z.string().email(),
  recipient: z.string().min(2),
  phone: z.string().min(9),
  address: z.string().min(5),
  city: z.string().optional().default(''),
  province: z.string().optional().default(''),
  postalCode: z.string().optional().default(''),
  country: z.string().optional().default('Indonesia'),
  notes: z.string().optional(),
  shippingMethod: z.string().optional().default(''),
  shippingCourier: z.string().optional(),
  shippingService: z.string().optional(),
  shippingCode: z.string().optional(),
  serviceCode: z.string().optional(),
  paymentMethod: z.string(),
  area: z.object({
    id: z.string(),
    administrative_division_level_1_name: z.string().optional(),
    administrative_division_level_2_name: z.string().optional(),
    administrative_division_level_3_name: z.string().optional(),
    postal_code: z.string().optional(),
  }).nullable().optional(),
  items: z.array(z.object({
    productId: z.string(),
    name: z.string(),
    price: z.number(),
    quantity: z.number().int().positive(),
    imageUrl: z.string().nullable().optional(),
  })),
  subtotal: z.number().positive(),
  shippingCost: z.number().min(0),
  discount: z.number().min(0).optional().default(0),
  total: z.number().positive(),
  couponCode: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = orderSchema.parse(body)

    const orderNumber = generateOrderNumber()
    const now = new Date().toISOString()

    // Resolve city/province/postalCode from area if not provided directly
    const city = data.city || data.area?.administrative_division_level_2_name || ''
    const province = data.province || data.area?.administrative_division_level_1_name || ''
    const postalCode = data.postalCode || data.area?.postal_code || ''
    const shippingMethod = data.shippingMethod ||
      (data.shippingCourier ? `${data.shippingCourier} ${data.shippingService ?? ''}`.trim() : '')

    // Get session to link order to user if logged in
    const session = await auth()
    const userId = session?.user?.id ?? null
    const isGuest = !userId

    // Write order to D1
    try {
      const db = await getDb()
      const orderId = crypto.randomUUID()

      await db.insert(orders).values({
        id: orderId,
        number: orderNumber,
        email: data.email,
        recipient: data.recipient,
        phone: data.phone,
        address: data.address,
        city,
        province,
        postalCode,
        notes: data.notes ?? null,
        shippingMethod,
        courier: data.shippingCourier ?? null,
        courierCode: data.shippingCode ?? null,
        serviceCode: data.serviceCode ?? null,
        destinationAreaId: data.area?.id ?? null,
        shippingCost: data.shippingCost,
        subtotal: data.subtotal,
        total: data.total,
        paymentMethod: data.paymentMethod,
        status: 'pending',
        trackingNumber: null,
        isGuest,
        userId: userId ?? null,
        createdAt: now,
        updatedAt: now,
      })

      // Insert order items
      for (const item of data.items) {
        await db.insert(orderItems).values({
          id: crypto.randomUUID(),
          orderId,
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          imageUrl: item.imageUrl ?? null,
        })
      }
    } catch (dbError) {
      console.error('DB write error (non-fatal):', dbError)
      // Continue — return order number even if DB write fails
    }

    const itemsSummary = data.items.map((i) => `${i.name} ×${i.quantity}`).join(', ')

    // For manual payment methods (QRIS, bank transfer, COD), no payment gateway needed
    const manualMethods = ['qris', 'bank_transfer', 'cod']
    const isManualPayment = manualMethods.includes(data.paymentMethod)

    if (isManualPayment) {
      await sendTelegramMessage(buildNewOrderMessage({
        orderNumber, recipient: data.recipient, total: data.total,
        paymentMethod: data.paymentMethod, itemsSummary,
      })).catch(() => {})

      return NextResponse.json({
        orderNumber,
        status: 'pending',
        city,
        province,
        postalCode,
        shippingMethod,
        paymentMethod: data.paymentMethod,
        recipient: data.recipient,
        phone: data.phone,
        email: data.email,
        address: data.address,
        notes: data.notes,
        items: data.items,
        subtotal: data.subtotal,
        shippingCost: data.shippingCost,
        total: data.total,
      })
    }

    // Midtrans payment (only if configured)
    if (data.paymentMethod === 'midtrans') {
      const midtransServerKey = process.env.MIDTRANS_SERVER_KEY
      if (!midtransServerKey) {
        await sendTelegramMessage(buildNewOrderMessage({
          orderNumber, recipient: data.recipient, total: data.total,
          paymentMethod: data.paymentMethod, itemsSummary,
        })).catch(() => {})

        return NextResponse.json({
          orderNumber,
          status: 'pending',
          paymentMethod: data.paymentMethod,
        })
      }

      try {
        const { createPayment } = await import('@/services/payment')
        const paymentResult = await createPayment('midtrans', {
          provider: 'midtrans',
          orderId: orderNumber,
          amount: data.total,
          currency: 'IDR',
          customerEmail: data.email,
          customerName: data.recipient,
          metadata: { orderNumber, shippingMethod },
        })

        if (!paymentResult.success) {
          return NextResponse.json(
            { error: paymentResult.error ?? 'Payment initialization failed' },
            { status: 400 },
          )
        }

        return NextResponse.json({
          orderNumber,
          paymentUrl: paymentResult.paymentUrl,
          snapToken: paymentResult.snapToken,
        })
      } catch {
        return NextResponse.json({ orderNumber, status: 'pending' })
      }
    }

    return NextResponse.json({ orderNumber, status: 'pending' })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.errors }, { status: 400 })
    }
    console.error('Order creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const orderNumber = searchParams.get('orderNumber')

  if (!orderNumber) {
    return NextResponse.json({ error: 'Order number required' }, { status: 400 })
  }

  try {
    const db = await getDb()
    await cancelExpiredOrders(db).catch(() => {})
    const orderRows = await db.select().from(orders).where(eq(orders.number, orderNumber)).limit(1)
    if (!orderRows[0]) {
      return NextResponse.json({ orderNumber, status: 'pending' })
    }
    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderRows[0].id))
    return NextResponse.json({ ...orderRows[0], items })
  } catch {
    return NextResponse.json({ orderNumber, status: 'pending' })
  }
}

