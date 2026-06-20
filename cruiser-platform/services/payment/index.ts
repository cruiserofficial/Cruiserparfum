import type { PaymentIntent, PaymentResult, PaymentProvider } from '@/types'
import { MidtransProvider } from './midtrans'
import { StripeProvider } from './stripe'
import { QrisProvider } from './qris'
import { BankTransferProvider } from './bank-transfer'

export interface IPaymentProvider {
  readonly name: PaymentProvider
  createPayment(intent: PaymentIntent): Promise<PaymentResult>
  verifyPayment(transactionId: string): Promise<boolean>
  handleWebhook(payload: unknown, signature: string): Promise<WebhookResult>
}

export interface WebhookResult {
  orderId: string
  status: 'paid' | 'failed' | 'pending'
  transactionId: string
}

export type PaymentMethodType = 'qris' | 'bank_transfer' | 'midtrans' | 'stripe' | 'cod'

class PaymentFactory {
  private providers = new Map<PaymentProvider, IPaymentProvider>()

  register(provider: IPaymentProvider) {
    this.providers.set(provider.name, provider)
    return this
  }

  get(name: PaymentProvider): IPaymentProvider {
    const provider = this.providers.get(name)
    if (!provider) throw new Error(`Payment provider "${name}" not registered`)
    return provider
  }

  getAll(): IPaymentProvider[] {
    return Array.from(this.providers.values())
  }
}

export const paymentFactory = new PaymentFactory()
  .register(new MidtransProvider())
  .register(new StripeProvider())
  .register(new QrisProvider())
  .register(new BankTransferProvider())

export async function createPayment(
  method: PaymentMethodType,
  intent: PaymentIntent,
): Promise<PaymentResult> {
  if (method === 'cod') {
    return { success: true, transactionId: `COD-${Date.now()}` }
  }

  const providerMap: Record<string, PaymentProvider> = {
    qris: 'xendit',
    bank_transfer: 'xendit',
    midtrans: 'midtrans',
    stripe: 'stripe',
  }

  const providerName = providerMap[method]
  if (!providerName) {
    return { success: false, error: 'Unsupported payment method' }
  }

  try {
    const provider = paymentFactory.get(providerName as PaymentProvider)
    return await provider.createPayment(intent)
  } catch (error) {
    console.error(`Payment error [${providerName}]:`, error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Payment failed',
    }
  }
}
