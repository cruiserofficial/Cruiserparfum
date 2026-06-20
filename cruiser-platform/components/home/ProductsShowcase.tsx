'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import type { Product } from '@/types'
import { formatPrice } from '@/lib/utils'

interface Props {
  products: Product[]
}

const ACCENT_COLORS: Record<string, string> = {
  eternity: '#8B9E6A',
  noctis: '#7A1A45',
  liberea: '#1A5F8A',
}

function ProductCard({ product, index }: { product: Product; index: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const accent = product.colorAccent ?? ACCENT_COLORS[product.slug] ?? '#C9A84C'
  const primaryImage = product.images?.[0]?.url ?? `/images/${product.slug}-splash.png`

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay: index * 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="group relative"
    >
      <Link href={`/products/${product.slug}`} className="block">
        {/* Image */}
        <div className="relative overflow-hidden bg-obsidian-3 aspect-[3/4] mb-6">
          {/* Glow */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
            style={{
              background: `radial-gradient(circle at center, ${accent}22 0%, transparent 70%)`,
            }}
          />

          <Image
            src={primaryImage}
            alt={`${product.name} by CRUISER`}
            fill
            className="object-cover object-center transition-transform duration-1000 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian/60 via-transparent to-transparent" />

          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {product.isBestseller && (
              <span className="font-sans text-[10px] tracking-[0.2em] uppercase bg-gold text-obsidian px-3 py-1.5 font-semibold">
                Bestseller
              </span>
            )}
            {product.isNew && (
              <span className="font-sans text-[10px] tracking-[0.2em] uppercase bg-cream/10 backdrop-blur-sm text-cream border border-white/20 px-3 py-1.5">
                New
              </span>
            )}
          </div>

          {/* Quick action */}
          <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
            <button className="btn-luxury w-full text-[11px]">
              Add to Cart
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="text-center">
          <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-gold/70 mb-2">
            {product.dna?.join(' · ')}
          </p>
          <h3 className="font-display text-2xl text-cream group-hover:text-gold transition-colors duration-300 mb-1">
            {product.name.toUpperCase()}
          </h3>
          {product.tagline && (
            <p className="font-serif italic text-sm text-cream/50 mb-3">
              &ldquo;{product.tagline}&rdquo;
            </p>
          )}
          <div className="flex items-center justify-center gap-3">
            <span className="font-sans text-lg text-cream">
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

export function ProductsShowcase({ products: productList }: Props) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section className="py-24 md:py-32" id="collection">
      <div className="container max-w-7xl mx-auto px-6">
        {/* Header */}
        <div ref={ref} className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="label-gold mx-auto w-fit mb-6"
          >
            Our Collection
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-display text-[clamp(2rem,5vw,3.5rem)] text-cream mb-4"
          >
            Three Signatures. One Identity.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="font-serif text-cream/50 text-lg max-w-xl mx-auto"
          >
            Each scent tells a story — find the one that speaks to you.
          </motion.p>
          <div className="ornament mt-8">
            <span className="text-gold text-xs">◆</span>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {productList.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <Link href="/shop" className="btn-luxury-outline inline-flex">
            View All Products
          </Link>
        </div>
      </div>
    </section>
  )
}
