import Stripe from 'stripe'
import type { IPaymentProvider, WebhookResult } from './index'
import type { PaymentIntent as CruiserPaymentIntent, PaymentResult } from '@/types'

let _stripe: Stripe | null = null

function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
      apiVersion: '2025-08-27.basil',
    })
  }
  return _stripe
}

export class StripeProvider implements IPaymentProvider {
  readonly name = 'stripe' as const

  async createPayment(intent: CruiserPaymentIntent): Promise<PaymentResult> {
    const stripe = getStripe()

    const paymentIntent = await stripe.paymentIntents.create({
      amount: intent.amount, // Stripe uses smallest currency unit; for IDR it's already in IDR
      currency: intent.currency.toLowerCase(),
      automatic_payment_methods: { enabled: true },
      receipt_email: intent.customerEmail,
      metadata: {
        orderId: intent.orderId,
        ...intent.metadata,
      },
    })

    return {
      success: true,
      clientSecret: paymentIntent.client_secret ?? undefined,
      transactionId: paymentIntent.id,
    }
  }

  async verifyPayment(transactionId: string): Promise<boolean> {
    const stripe = getStripe()
    const intent = await stripe.paymentIntents.retrieve(transactionId)
    return intent.status === 'succeeded'
  }

  async handleWebhook(payload: unknown, signature: string): Promise<WebhookResult> {
    const stripe = getStripe()
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? ''

    const event = stripe.webhooks.constructEvent(
      payload as string | Buffer,
      signature,
      webhookSecret,
    )

    const intent = event.data.object as Stripe.PaymentIntent
    const orderId = intent.metadata?.orderId ?? ''

    const statusMap: Record<string, WebhookResult['status']> = {
      succeeded: 'paid',
      payment_failed: 'failed',
      requires_payment_method: 'pending',
    }

    return {
      orderId,
      status: statusMap[event.type.replace('payment_intent.', '')] ?? 'pending',
      transactionId: intent.id,
    }
  }
}
