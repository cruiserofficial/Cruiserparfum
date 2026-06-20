'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Minus, Plus, Trash2, Tag, ArrowRight, ShoppingBag } from 'lucide-react'
import { useState } from 'react'
import { useCartStore } from '@/features/cart/cartStore'
import { formatPrice } from '@/lib/utils'
import { FREE_SHIPPING_THRESHOLD, SHIPPING_OPTIONS } from '@/lib/constants'

export function CartPageClient() {
  const { items, removeItem, updateQuantity, clearCart } = useCartStore()
  const [coupon, setCoupon] = useState('')
  const [couponApplied, setCouponApplied] = useState(false)
  const [province, setProvince] = useState('')
  const [shippingCost, setShippingCost] = useState<number | null>(null)

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0)
  const discount = couponApplied ? Math.round(subtotal * 0.1) : 0
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : (shippingCost ?? 0)
  const total = subtotal - discount + shipping

  function applyCoupon() {
    if (coupon.toUpperCase() === 'CRUISER10') {
      setCouponApplied(true)
    }
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-6">
        <ShoppingBag size={64} className="text-cream/10" />
        <h2 className="font-display text-3xl text-cream/30">Your cart is empty</h2>
        <Link href="/shop" className="btn-luxury">
          Discover Collection
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
      {/* Items */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between mb-6">
          <p className="font-sans text-xs text-cream/40">
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </p>
          <button
            onClick={clearCart}
            className="font-sans text-xs text-cream/30 hover:text-red-400 transition-colors"
          >
            Clear all
          </button>
        </div>

        <AnimatePresence>
          {items.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass flex gap-6 p-5"
            >
              <div className="relative w-24 h-28 flex-shrink-0 bg-obsidian-3">
                <Image
                  src={item.imageUrl ?? '/images/placeholder-product.jpg'}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              </div>

              <div className="flex-1">
                <p className="font-sans text-[9px] tracking-[0.4em] uppercase text-gold/60 mb-0.5">
                  CRUISER
                </p>
                <h3 className="font-display text-xl text-cream mb-1">
                  {item.name.toUpperCase()}
                </h3>
                <p className="font-sans text-xs text-cream/40 mb-4">
                  50ml · Extrait De Parfum
                </p>

                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center border border-white/10">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-9 h-9 flex items-center justify-center text-cream/40 hover:text-cream transition-colors"
                    >
                      <Minus size={13} />
                    </button>
                    <span className="w-9 h-9 flex items-center justify-center font-sans text-sm text-cream">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-9 h-9 flex items-center justify-center text-cream/40 hover:text-cream transition-colors"
                    >
                      <Plus size={13} />
                    </button>
                  </div>

                  <p className="font-sans text-lg text-cream font-medium">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              </div>

              <button
                onClick={() => removeItem(item.id)}
                className="text-cream/20 hover:text-red-400 transition-colors self-start"
              >
                <Trash2 size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Summary */}
      <div className="space-y-4">
        {/* Coupon */}
        <div className="glass p-5">
          <p className="font-sans text-xs tracking-widest uppercase text-gold/70 mb-3">
            Promo Code
          </p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Tag size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-cream/30" />
              <input
                type="text"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                placeholder="Enter code"
                disabled={couponApplied}
                className="input-luxury pl-9 w-full text-sm disabled:opacity-50"
              />
            </div>
            <button
              onClick={applyCoupon}
              disabled={couponApplied}
              className="btn-luxury px-4 py-2 text-xs disabled:opacity-50"
            >
              Apply
            </button>
          </div>
          {couponApplied && (
            <p className="font-sans text-xs text-emerald-400 mt-2">
              ✓ CRUISER10 — 10% discount applied!
            </p>
          )}
        </div>

        {/* Shipping estimate */}
        <div className="glass p-5">
          <p className="font-sans text-xs tracking-widest uppercase text-gold/70 mb-3">
            Estimate Shipping
          </p>
          <input
            type="text"
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            placeholder="Enter province"
            className="input-luxury text-sm mb-3"
          />
          {province && (
            <div className="space-y-2">
              {SHIPPING_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setShippingCost(opt.cost)}
                  className={`w-full text-left p-3 border transition-all ${
                    shippingCost === opt.cost
                      ? 'border-gold/40 bg-gold/5'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-sans text-xs text-cream">{opt.name}</p>
                      <p className="font-sans text-[10px] text-cream/40">{opt.estimatedDays}</p>
                    </div>
                    <p className="font-sans text-sm text-cream">
                      {subtotal >= FREE_SHIPPING_THRESHOLD ? 'Gratis' : formatPrice(opt.cost)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Order total */}
        <div className="glass p-5 space-y-3">
          <p className="font-sans text-xs tracking-widest uppercase text-gold/70 mb-4">
            Order Summary
          </p>
          <div className="flex justify-between font-sans text-sm text-cream/70">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between font-sans text-sm text-emerald-400">
              <span>Discount (CRUISER10)</span>
              <span>-{formatPrice(discount)}</span>
            </div>
          )}
          <div className="flex justify-between font-sans text-sm text-cream/70">
            <span>Shipping</span>
            <span>
              {shippingCost === null
                ? 'Calculated at checkout'
                : subtotal >= FREE_SHIPPING_THRESHOLD
                ? 'Free'
                : formatPrice(shipping)}
            </span>
          </div>
          <div className="pt-3 border-t border-white/10 flex justify-between">
            <span className="font-display text-lg text-cream">Total</span>
            <span className="font-display text-lg text-cream">{formatPrice(total)}</span>
          </div>

          <Link
            href="/checkout"
            className="btn-luxury w-full flex items-center justify-center gap-2 mt-2"
          >
            Proceed to Checkout
            <ArrowRight size={15} />
          </Link>
        </div>

        {/* Trust */}
        <div className="text-center py-2">
          <p className="font-sans text-[10px] text-cream/20 tracking-widest uppercase">
            Secure Checkout · SSL Encrypted
          </p>
        </div>
      </div>
    </div>
  )
}
