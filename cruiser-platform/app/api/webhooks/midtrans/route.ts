import { NextRequest, NextResponse } from 'next/server'
import { paymentFactory } from '@/services/payment'
import { getDb } from '@/lib/db/index'
import { orders } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { sendTelegramMessage, buildPaymentConfirmedMessage } from '@/lib/telegram'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      order_id: string
      status_code: string
      gross_amount: string
      signature_key: string
    }

    // Verify Midtrans notification signature
    const hash = crypto
      .createHash('sha512')
      .update(`${body.order_id}${body.status_code}${body.gross_amount}${process.env.MIDTRANS_SERVER_KEY}`)
      .digest('hex')

    if (hash !== body.signature_key) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const provider = paymentFactory.get('midtrans')
    const result = await provider.handleWebhook(body, body.signature_key)

    if (result.status === 'paid') {
      try {
        const db = await getDb()
        const updated = await db.update(orders)
          .set({ status: 'processing', updatedAt: new Date().toISOString() })
          .where(eq(orders.number, result.orderId))
          .returning()

        if (updated[0]) {
          await sendTelegramMessage(buildPaymentConfirmedMessage({
            orderNumber: updated[0].number,
            total: updated[0].total,
          })).catch(() => {})
        }
      } catch (dbError) {
        console.error('Failed to update order from webhook:', dbError)
      }
    }

    console.log('Midtrans webhook:', result)

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Midtrans webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
