import type { Metadata } from 'next'
import { CartPageClient } from './CartPageClient'

export const metadata: Metadata = {
  title: 'Cart',
  robots: { index: false, follow: false },
}

export default function CartPage() {
  return (
    <div className="min-h-screen pt-24">
      <div className="container max-w-7xl mx-auto px-6 py-12">
        <h1 className="font-display text-4xl text-cream mb-12">
          Shopping Cart
        </h1>
        <CartPageClient />
      </div>
    </div>
  )
}
