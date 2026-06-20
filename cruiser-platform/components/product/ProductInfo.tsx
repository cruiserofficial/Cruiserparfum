'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ShoppingBag, Heart, Share2, Star, Minus, Plus, Zap } from 'lucide-react'
import { useCartStore } from '@/features/cart/cartStore'
import { useWishlistStore } from '@/features/wishlist/wishlistStore'
import { formatPrice, calculateDiscount } from '@/lib/utils'
import type { Product } from '@/types'
import toast from 'react-hot-toast'

interface Props {
  product: Product
}

export function ProductInfo({ product }: Props) {
  const [qty, setQty] = useState(1)
  const { addItem } = useCartStore()
  const { toggle, has } = useWishlistStore()
  const isWished = has(product.id)
  const discount = product.comparePrice
    ? calculateDiscount(product.price, product.comparePrice)
    : 0
  const primaryImage = product.images?.[0]?.url ?? `/images/${product.slug}-splash.png`

  function handleAddToCart() {
    addItem({
      id: product.id,
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      imageUrl: primaryImage,
      stock: product.stock,
      quantity: qty,
    })
    toast.success(`${product.name} ×${qty} added to cart`)
  }

  async function handleShare() {
    try {
      await navigator.share({
        title: `CRUISER ${product.name.toUpperCase()}`,
        text: `${product.tagline} — ${formatPrice(product.price)}`,
        url: window.location.href,
      })
    } catch {
      await navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied!')
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Brand & badges */}
      <div className="flex items-center gap-3">
        <p className="font-sans text-xs tracking-[0.4em] uppercase text-gold/60">CRUISER</p>
        {product.isBestseller && (
          <span className="font-sans text-[9px] tracking-[0.2em] uppercase bg-gold text-obsidian px-3 py-1 font-bold">
            Bestseller
          </span>
        )}
        {product.isNew && (
          <span className="font-sans text-[9px] tracking-[0.2em] uppercase border border-gold/40 text-gold px-3 py-1">
            New
          </span>
        )}
      </div>

      {/* Name */}
      <div>
        <h1 className="font-display text-[clamp(2.5rem,6vw,4rem)] leading-none text-cream mb-2">
          {product.name.toUpperCase()}
        </h1>
        {product.tagline && (
          <p className="font-serif italic text-xl text-cream/60">
            &ldquo;{product.tagline}&rdquo;
          </p>
        )}
      </div>

      {/* DNA */}
      <div className="flex gap-2 flex-wrap">
        {product.dna?.map((d) => (
          <span
            key={d}
            className="font-sans text-[10px] tracking-[0.25em] uppercase border border-white/10 text-cream/50 px-3 py-1.5"
          >
            {d}
          </span>
        ))}
      </div>

      {/* Rating */}
      {product.avgRating != null && product.reviewCount != null && product.reviewCount > 0 && (
        <div className="flex items-center gap-3">
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={14}
                className={
                  i < Math.round(product.avgRating!)
                    ? 'text-gold fill-gold'
                    : 'text-gold/20'
                }
              />
            ))}
          </div>
          <span className="font-sans text-sm text-cream/50">
            {product.avgRating} ({product.reviewCount} reviews)
          </span>
        </div>
      )}

      {/* Divider */}
      <div className="h-px bg-white/[0.06]" />

      {/* Price */}
      <div className="flex items-baseline gap-4">
        <span className="font-display text-4xl text-cream">
          {formatPrice(product.price)}
        </span>
        {product.comparePrice && product.comparePrice > product.price && (
          <>
            <span className="font-serif text-xl text-cream/30 line-through">
              {formatPrice(product.comparePrice)}
            </span>
            <span className="font-sans text-xs bg-gold/10 text-gold border border-gold/20 px-2 py-1">
              SAVE {discount}%
            </span>
          </>
        )}
      </div>

      {/* Specs */}
      <div className="glass p-4 grid grid-cols-2 gap-4">
        <div>
          <p className="font-sans text-[10px] tracking-widest uppercase text-cream/30 mb-1">Type</p>
          <p className="font-sans text-sm text-cream">{product.concentration}</p>
        </div>
        <div>
          <p className="font-sans text-[10px] tracking-widest uppercase text-cream/30 mb-1">Volume</p>
          <p className="font-sans text-sm text-cream">{product.volumeMl}ML / {(product.volumeMl * 0.034).toFixed(2)} Fl Oz</p>
        </div>
      </div>

      {/* Description */}
      <p className="font-serif text-cream/60 text-base leading-relaxed">
        {product.description}
      </p>

      {/* Stock */}
      <div className="flex items-center gap-2">
        <span
          className={`w-2 h-2 rounded-full ${product.stock > 10 ? 'bg-emerald-400' : product.stock > 0 ? 'bg-amber-400' : 'bg-red-400'}`}
        />
        <span className="font-sans text-xs text-cream/50">
          {product.stock > 10
            ? 'In Stock'
            : product.stock > 0
            ? `Only ${product.stock} left`
            : 'Out of Stock'}
        </span>
      </div>

      {/* Quantity */}
      <div className="flex items-center gap-4">
        <p className="font-sans text-xs tracking-widest uppercase text-cream/40">Qty</p>
        <div className="flex items-center border border-white/10">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="w-10 h-10 flex items-center justify-center text-cream/50 hover:text-cream transition-colors"
          >
            <Minus size={14} />
          </button>
          <span className="w-10 h-10 flex items-center justify-center font-sans text-sm text-cream">
            {qty}
          </span>
          <button
            onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
            className="w-10 h-10 flex items-center justify-center text-cream/50 hover:text-cream transition-colors"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* CTAs */}
      <div className="flex flex-col gap-3">
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="btn-luxury w-full flex items-center justify-center gap-3 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ShoppingBag size={16} />
          Add to Cart
        </button>
        <Link
          href="/checkout"
          onClick={() => {
            if (product.stock > 0) handleAddToCart()
          }}
          className="btn-luxury-outline w-full flex items-center justify-center gap-3 py-4"
        >
          <Zap size={16} />
          Buy Now
        </Link>
      </div>

      {/* Secondary actions */}
      <div className="flex gap-4">
        <button
          onClick={() => { toggle(product.id); toast.success(isWished ? 'Removed from wishlist' : 'Saved to wishlist') }}
          className="flex-1 flex items-center justify-center gap-2 py-3 border border-white/10 text-cream/50 hover:text-cream hover:border-white/20 transition-all font-sans text-xs tracking-widest uppercase"
        >
          <Heart size={14} className={isWished ? 'text-red-400 fill-red-400' : ''} />
          {isWished ? 'Saved' : 'Wishlist'}
        </button>
        <button
          onClick={handleShare}
          className="flex-1 flex items-center justify-center gap-2 py-3 border border-white/10 text-cream/50 hover:text-cream hover:border-white/20 transition-all font-sans text-xs tracking-widest uppercase"
        >
          <Share2 size={14} />
          Share
        </button>
      </div>

      {/* Trust signals */}
      <div className="grid grid-cols-3 gap-4 pt-2">
        {[
          { icon: '🛡️', label: '100% Original' },
          { icon: '📦', label: 'Free Box' },
          { icon: '🚚', label: 'Fast Shipping' },
        ].map((item) => (
          <div key={item.label} className="text-center">
            <p className="text-lg mb-1">{item.icon}</p>
            <p className="font-sans text-[10px] tracking-widest uppercase text-cream/40">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
