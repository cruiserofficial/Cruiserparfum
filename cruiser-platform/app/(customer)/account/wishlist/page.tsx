'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Heart, ShoppingBag, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWishlistStore } from '@/features/wishlist/wishlistStore'
import { useCartStore } from '@/features/cart/cartStore'
import { formatPrice } from '@/lib/utils'
import toast from 'react-hot-toast'

const PRODUCTS_MAP: Record<string, {
  name: string; slug: string; price: number; comparePrice: number; image: string; tagline: string; stock: number
}> = {
  'prod-eternity': {
    name: 'Eternity', slug: 'eternity', price: 299_000, comparePrice: 350_000,
    image: '/images/eternity-splash.png', tagline: 'Freshness That Lingers.', stock: 50,
  },
  'prod-noctis': {
    name: 'Noctis', slug: 'noctis', price: 299_000, comparePrice: 350_000,
    image: '/images/noctis-splash.png', tagline: 'Embrace the Night.', stock: 30,
  },
  'prod-liberea': {
    name: 'Liberea', slug: 'liberea', price: 299_000, comparePrice: 350_000,
    image: '/images/liberea-splash.png', tagline: 'Softness in Every Note.', stock: 45,
  },
}

export default function WishlistPage() {
  const { productIds, toggle } = useWishlistStore()
  const { addItem } = useCartStore()

  const wished = productIds
    .map((id) => ({ id, product: PRODUCTS_MAP[id] }))
    .filter((w) => w.product != null)

  function handleAddToCart(id: string) {
    const p = PRODUCTS_MAP[id]
    if (!p) return
    addItem({ id, productId: id, name: p.name, slug: p.slug, price: p.price, imageUrl: p.image, stock: p.stock })
    toast.success(`${p.name} ditambah ke keranjang`)
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container max-w-4xl mx-auto px-6">
        <div className="flex items-center gap-4 mb-10 pb-6 border-b border-white/[0.06]">
          <Link href="/account" className="font-sans text-xs text-cream/30 hover:text-cream transition-colors">
            ← Akun
          </Link>
          <span className="text-cream/10">/</span>
          <h1 className="font-display text-2xl text-cream">Wishlist</h1>
          {wished.length > 0 && (
            <span className="w-6 h-6 bg-gold/10 border border-gold/20 flex items-center justify-center font-sans text-xs text-gold">
              {wished.length}
            </span>
          )}
        </div>

        {wished.length === 0 ? (
          <div className="text-center py-24">
            <Heart size={48} className="text-cream/10 mx-auto mb-6" />
            <h2 className="font-display text-2xl text-cream/30 mb-2">Wishlist kamu masih kosong</h2>
            <p className="font-serif italic text-cream/30 mb-8">Simpan wangi favoritmu di sini</p>
            <Link href="/shop" className="btn-luxury">
              Jelajahi Koleksi
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <AnimatePresence>
              {wished.map(({ id, product: p }) => (
                <motion.div
                  key={id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="glass group relative"
                >
                  {/* Remove */}
                  <button
                    onClick={() => { toggle(id); toast.success('Dihapus dari wishlist') }}
                    className="absolute top-3 right-3 z-10 w-7 h-7 bg-obsidian/80 border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-400"
                  >
                    <Trash2 size={12} className="text-cream/40" />
                  </button>

                  <Link href={`/products/${p.slug}`}>
                    <div className="relative aspect-[3/4] bg-obsidian-3 overflow-hidden">
                      <Image
                        src={p.image}
                        alt={p.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-obsidian/50 via-transparent to-transparent" />
                    </div>
                  </Link>

                  <div className="p-4">
                    <Link href={`/products/${p.slug}`}>
                      <h3 className="font-display text-lg text-cream group-hover:text-gold transition-colors mb-0.5">
                        {p.name.toUpperCase()}
                      </h3>
                      <p className="font-serif italic text-xs text-cream/40 mb-3">
                        &ldquo;{p.tagline}&rdquo;
                      </p>
                    </Link>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-sans text-base text-cream">{formatPrice(p.price)}</span>
                        <span className="font-sans text-sm text-cream/30 line-through ml-2">{formatPrice(p.comparePrice)}</span>
                      </div>
                      <button
                        onClick={() => handleAddToCart(id)}
                        className="w-9 h-9 bg-gold/10 border border-gold/20 flex items-center justify-center text-gold hover:bg-gold hover:text-obsidian transition-all duration-300"
                        title="Tambah ke keranjang"
                      >
                        <ShoppingBag size={14} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}
