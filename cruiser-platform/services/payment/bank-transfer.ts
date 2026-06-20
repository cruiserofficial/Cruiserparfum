/**
 * Bank Transfer via Xendit Virtual Account.
 * Supports: BCA, BNI, BRI, Mandiri, Permata, etc.
 */
import type { IPaymentProvider, WebhookResult } from './index'
import type { PaymentIntent, PaymentResult, VirtualAccount } from '@/types'

const SUPPORTED_BANKS = ['BCA', 'BNI', 'BRI', 'MANDIRI', 'PERMATA'] as const

export class BankTransferProvider implements IPaymentProvider {
  readonly name = 'xendit' as const

  private get secretKey() {
    return process.env.XENDIT_SECRET_KEY ?? ''
  }

  private authHeader() {
    return `Basic ${Buffer.from(this.secretKey + ':').toString('base64')}`
  }

  async createPayment(intent: PaymentIntent): Promise<PaymentResult> {
    const externalId = `CRS-VA-${intent.orderId}-${Date.now()}`
    const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

    const vaNumbers: VirtualAccount[] = []

    await Promise.all(
      SUPPORTED_BANKS.map(async (bank) => {
        const response = await fetch('https://api.xendit.co/callback_virtual_accounts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: this.authHeader(),
          },
          body: JSON.stringify({
            external_id: `${externalId}-${bank}`,
            bank_code: bank,
            name: intent.customerName.toUpperCase().slice(0, 28),
            expected_amount: intent.amount,
            expiration_date: expiry,
            is_closed: true,
            is_single_use: true,
          }),
        })

        if (response.ok) {
          const data = (await response.json()) as {
            id: string
            account_number: string
          }
          vaNumbers.push({
            bank,
            vaNumber: data.account_number,
            expiresAt: expiry,
          })
        }
      }),
    )

    if (vaNumbers.length === 0) {
      return { success: false, error: 'Failed to create virtual accounts' }
    }

    return {
      success: true,
      transactionId: externalId,
      vaNumbers,
    }
  }

  async verifyPayment(transactionId: string): Promise<boolean> {
    const response = await fetch(
      `https://api.xendit.co/callback_virtual_accounts/payments/by_external_id?external_id=${transactionId}`,
      { headers: { Authorization: this.authHeader() } },
    )
    if (!response.ok) return false
    const data = (await response.json()) as { status: string }
    return data.status === 'COMPLETED'
  }

  async handleWebhook(payload: unknown, signature: string): Promise<WebhookResult> {
    const webhookToken = process.env.XENDIT_WEBHOOK_TOKEN ?? ''
    if (signature !== webhookToken) {
      throw new Error('Invalid Xendit webhook signature')
    }

    const data = payload as { external_id: string; status: string; id: string }
    const parts = data.external_id.split('-')
    const orderId = parts.slice(2, -2).join('-')

    return {
      orderId,
      status: data.status === 'COMPLETED' ? 'paid' : 'failed',
      transactionId: data.id,
    }
  }
}
