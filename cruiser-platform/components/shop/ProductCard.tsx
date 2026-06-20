'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Heart, ShoppingBag, Star } from 'lucide-react'
import { useCartStore } from '@/features/cart/cartStore'
import { useWishlistStore } from '@/features/wishlist/wishlistStore'
import { formatPrice, calculateDiscount } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { Product } from '@/types'
import toast from 'react-hot-toast'

interface Props {
  product: Product
  variant?: 'default' | 'compact'
}

export function ProductCard({ product, variant = 'default' }: Props) {
  const { addItem } = useCartStore()
  const { toggle, has } = useWishlistStore()
  const isWished = has(product.id)
  const primaryImage = product.images?.[0]?.url ?? `/images/${product.slug}-splash.png`
  const discount = product.comparePrice
    ? calculateDiscount(product.price, product.comparePrice)
    : 0

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault()
    addItem({
      id: product.id,
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      imageUrl: primaryImage,
      stock: product.stock,
    })
    toast.success(`${product.name} added to cart`)
  }

  function handleWishlist(e: React.MouseEvent) {
    e.preventDefault()
    toggle(product.id)
    toast.success(isWished ? 'Removed from wishlist' : 'Added to wishlist')
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative"
    >
      <Link href={`/products/${product.slug}`} className="block">
        {/* Image container */}
        <div
          className={cn(
            'relative overflow-hidden bg-obsidian-3 mb-4',
            variant === 'compact' ? 'aspect-square' : 'aspect-[3/4]',
          )}
        >
          <Image
            src={primaryImage}
            alt={`${product.name} by CRUISER`}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian/50 via-transparent to-transparent" />

          {/* Color glow on hover */}
          {product.colorAccent && (
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
              style={{
                background: `radial-gradient(circle at center, ${product.colorAccent}20 0%, transparent 70%)`,
              }}
            />
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            {product.isBestseller && (
              <span className="font-sans text-[9px] tracking-[0.2em] uppercase bg-gold text-obsidian px-2.5 py-1 font-bold">
                Bestseller
              </span>
            )}
            {product.isNew && (
              <span className="font-sans text-[9px] tracking-[0.2em] uppercase bg-cream/10 backdrop-blur-sm text-cream border border-white/20 px-2.5 py-1">
                New
              </span>
            )}
            {discount > 0 && (
              <span className="font-sans text-[9px] tracking-[0.1em] bg-red-900/80 text-red-200 px-2.5 py-1">
                -{discount}%
              </span>
            )}
          </div>

          {/* Wishlist button */}
          <button
            onClick={handleWishlist}
            className="absolute top-3 right-3 z-10 w-8 h-8 glass flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
            aria-label={isWished ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart
              size={14}
              className={cn(
                'transition-colors duration-300',
                isWished ? 'text-red-400 fill-red-400' : 'text-cream/60',
              )}
            />
          </button>

          {/* Quick add */}
          <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-500 z-10">
            {product.stock > 0 ? (
              <button
                onClick={handleAddToCart}
                className="w-full btn-luxury py-3 text-[10px] flex items-center justify-center gap-2"
              >
                <ShoppingBag size={13} />
                Quick Add
              </button>
            ) : (
              <button
                disabled
                className="w-full font-sans text-[10px] tracking-[0.2em] uppercase py-3 bg-obsidian-4 text-cream/30 cursor-not-allowed border border-white/10"
              >
                Out of Stock
              </button>
            )}
          </div>
        </div>

        {/* Product info */}
        <div>
          <p className="font-sans text-[9px] tracking-[0.3em] uppercase text-gold/60 mb-1.5">
            {product.dna?.join(' · ')}
          </p>
          <h3 className="font-display text-lg text-cream group-hover:text-gold transition-colors duration-300 mb-0.5">
            {product.name.toUpperCase()}
          </h3>
          {variant === 'default' && product.tagline && (
            <p className="font-serif italic text-xs text-cream/40 mb-2">
              &ldquo;{product.tagline}&rdquo;
            </p>
          )}

          {/* Rating */}
          {product.avgRating != null && product.reviewCount != null && product.reviewCount > 0 && (
            <div className="flex items-center gap-1.5 mb-2">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={10}
                    className={
                      i < Math.round(product.avgRating!)
                        ? 'text-gold fill-gold'
                        : 'text-gold/20'
                    }
                  />
                ))}
              </div>
              <span className="font-sans text-[10px] text-cream/40">
                ({product.reviewCount})
              </span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="font-sans text-base text-cream">
              {formatPrice(product.price)}
            </span>
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="font-sans text-sm text-cream/30 line-through">
                {formatPrice(product.comparePrice)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.article>
  )
}
