'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { useCartStore } from '@/features/cart/cartStore'
import { formatPrice } from '@/lib/utils'
import { FREE_SHIPPING_THRESHOLD } from '@/lib/constants'

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity } = useCartStore()
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0)
  const freeShippingLeft = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal)
  const freeShippingProgress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100)

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 z-40 bg-obsidian/60 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 320 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-obsidian-2 border-l border-white/[0.06] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/[0.06]">
              <div className="flex items-center gap-3">
                <ShoppingBag size={18} className="text-gold" />
                <h2 className="font-display text-xl text-cream">Your Cart</h2>
                {items.length > 0 && (
                  <span className="font-sans text-xs bg-gold text-obsidian font-bold w-5 h-5 flex items-center justify-center rounded-full">
                    {items.reduce((n, i) => n + i.quantity, 0)}
                  </span>
                )}
              </div>
              <button
                onClick={closeCart}
                className="w-8 h-8 flex items-center justify-center text-cream/40 hover:text-cream border border-white/10 hover:border-white/20 transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {/* Free shipping progress */}
            {subtotal > 0 && (
              <div className="px-6 py-4 border-b border-white/[0.06]">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-sans text-xs text-cream/50">
                    {freeShippingLeft > 0
                      ? `Tambah ${formatPrice(freeShippingLeft)} lagi untuk gratis ongkir!`
                      : '🎉 Kamu dapat gratis ongkir!'}
                  </p>
                </div>
                <div className="h-1 bg-white/10 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${freeShippingProgress}%` }}
                    className="h-full bg-gold"
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                  />
                </div>
              </div>
            )}

            {/* Items */}
            <div className="flex-1 overflow-y-auto py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 p-6">
                  <ShoppingBag size={48} className="text-cream/10" />
                  <p className="font-display text-xl text-cream/30">Your cart is empty</p>
                  <p className="font-serif text-sm text-cream/20">
                    Discover your signature scent
                  </p>
                  <button onClick={closeCart} className="btn-luxury mt-4">
                    <Link href="/shop">Shop Now</Link>
                  </button>
                </div>
              ) : (
                <div className="space-y-1">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-4 p-4 hover:bg-white/[0.02] transition-colors"
                    >
                      {/* Image */}
                      <div className="relative w-20 h-24 flex-shrink-0 bg-obsidian-3">
                        <Image
                          src={item.imageUrl ?? '/images/placeholder-product.jpg'}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-sans text-[9px] tracking-[0.3em] uppercase text-gold/60 mb-0.5">
                          CRUISER
                        </p>
                        <p className="font-display text-base text-cream truncate">
                          {item.name.toUpperCase()}
                        </p>
                        <p className="font-sans text-xs text-cream/40 mb-3">
                          50ml Extrait De Parfum
                        </p>

                        <div className="flex items-center justify-between">
                          {/* Qty control */}
                          <div className="flex items-center border border-white/10">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-7 h-7 flex items-center justify-center text-cream/40 hover:text-cream transition-colors"
                            >
                              <Minus size={11} />
                            </button>
                            <span className="w-7 h-7 flex items-center justify-center font-sans text-xs text-cream">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-7 h-7 flex items-center justify-center text-cream/40 hover:text-cream transition-colors"
                            >
                              <Plus size={11} />
                            </button>
                          </div>

                          <p className="font-sans text-sm text-cream">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => removeItem(item.id)}
                        className="flex-shrink-0 text-cream/20 hover:text-red-400 transition-colors self-start mt-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-white/[0.06] p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-sans text-sm text-cream/60">Subtotal</span>
                  <span className="font-display text-xl text-cream">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <p className="font-serif text-xs text-cream/40">
                  Shipping & taxes calculated at checkout
                </p>
                <Link href="/checkout" onClick={closeCart} className="btn-luxury w-full block text-center py-4">
                  Checkout
                </Link>
                <Link href="/cart" onClick={closeCart} className="btn-luxury-outline w-full block text-center py-3 text-sm">
                  View Full Cart
                </Link>
              </div>
            )}
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  )
}
