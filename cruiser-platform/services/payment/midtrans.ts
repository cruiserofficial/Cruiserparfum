import type { IPaymentProvider, WebhookResult } from './index'
import type { PaymentIntent, PaymentResult } from '@/types'

export class MidtransProvider implements IPaymentProvider {
  readonly name = 'midtrans' as const

  private get serverKey() {
    return process.env.MIDTRANS_SERVER_KEY ?? ''
  }

  private get isProduction() {
    return process.env.MIDTRANS_IS_PRODUCTION === 'true'
  }

  private get baseUrl() {
    return this.isProduction
      ? 'https://app.midtrans.com'
      : 'https://app.sandbox.midtrans.com'
  }

  private authHeader() {
    return `Basic ${Buffer.from(this.serverKey + ':').toString('base64')}`
  }

  async createPayment(intent: PaymentIntent): Promise<PaymentResult> {
    const orderId = `CRS-${intent.orderId}-${Date.now()}`

    const payload = {
      transaction_details: {
        order_id: orderId,
        gross_amount: intent.amount,
      },
      credit_card: { secure: true },
      customer_details: {
        email: intent.customerEmail,
        first_name: intent.customerName,
      },
      callbacks: {
        finish: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success`,
        error: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/failed`,
        pending: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/pending`,
      },
      metadata: intent.metadata,
    }

    const response = await fetch(`${this.baseUrl}/snap/v1/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.authHeader(),
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const error = await response.text()
      return { success: false, error: `Midtrans error: ${error}` }
    }

    const data = (await response.json()) as { token: string; redirect_url: string }

    return {
      success: true,
      snapToken: data.token,
      paymentUrl: data.redirect_url,
      transactionId: orderId,
    }
  }

  async verifyPayment(transactionId: string): Promise<boolean> {
    const response = await fetch(
      `${this.baseUrl}/v2/${transactionId}/status`,
      {
        headers: { Authorization: this.authHeader() },
      },
    )

    if (!response.ok) return false

    const data = (await response.json()) as { transaction_status: string }
    return (
      data.transaction_status === 'settlement' ||
      data.transaction_status === 'capture'
    )
  }

  async handleWebhook(payload: unknown, _signature: string): Promise<WebhookResult> {
    const data = payload as {
      order_id: string
      transaction_status: string
      transaction_id: string
    }

    const statusMap: Record<string, WebhookResult['status']> = {
      settlement: 'paid',
      capture: 'paid',
      deny: 'failed',
      cancel: 'failed',
      expire: 'failed',
      pending: 'pending',
    }

    const orderId = data.order_id.split('-').slice(1, -1).join('-')

    return {
      orderId,
      status: statusMap[data.transaction_status] ?? 'pending',
      transactionId: data.transaction_id,
    }
  }
}
