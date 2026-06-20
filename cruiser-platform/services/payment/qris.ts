/**
 * QRIS payment via Xendit.
 * Creates a QR code that supports all QRIS-compatible apps:
 * GoPay, OVO, Dana, ShopeePay, LinkAja, mobile banking, etc.
 */
import type { IPaymentProvider, WebhookResult } from './index'
import type { PaymentIntent, PaymentResult } from '@/types'

export class QrisProvider implements IPaymentProvider {
  readonly name = 'xendit' as const

  private get secretKey() {
    return process.env.XENDIT_SECRET_KEY ?? ''
  }

  private authHeader() {
    return `Basic ${Buffer.from(this.secretKey + ':').toString('base64')}`
  }

  async createPayment(intent: PaymentIntent): Promise<PaymentResult> {
    const referenceId = `CRS-QRIS-${intent.orderId}-${Date.now()}`

    const response = await fetch('https://api.xendit.co/qr_codes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.authHeader(),
      },
      body: JSON.stringify({
        reference_id: referenceId,
        type: 'DYNAMIC',
        currency: 'IDR',
        amount: intent.amount,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        metadata: intent.metadata,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      return { success: false, error: `Xendit QRIS error: ${error}` }
    }

    const data = (await response.json()) as {
      id: string
      qr_string: string
      channel_code: string
    }

    return {
      success: true,
      transactionId: data.id,
      qrisUrl: data.qr_string,
    }
  }

  async verifyPayment(transactionId: string): Promise<boolean> {
    const response = await fetch(`https://api.xendit.co/qr_codes/${transactionId}/payments`, {
      headers: { Authorization: this.authHeader() },
    })

    if (!response.ok) return false
    const data = (await response.json()) as { data: Array<{ status: string }> }
    return data.data?.some((p) => p.status === 'SUCCEEDED') ?? false
  }

  async handleWebhook(payload: unknown, signature: string): Promise<WebhookResult> {
    const webhookToken = process.env.XENDIT_WEBHOOK_TOKEN ?? ''
    if (signature !== webhookToken) {
      throw new Error('Invalid Xendit webhook signature')
    }

    const data = payload as {
      reference_id: string
      status: string
      id: string
    }

    const parts = data.reference_id.split('-')
    const orderId = parts.slice(2, -1).join('-')

    return {
      orderId,
      status: data.status === 'SUCCEEDED' ? 'paid' : 'failed',
      transactionId: data.id,
    }
  }
}
