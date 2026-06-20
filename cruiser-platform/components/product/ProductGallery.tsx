'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ZoomIn } from 'lucide-react'
import type { Product, ProductImage } from '@/types'

interface Props {
  images: ProductImage[]
  product: Product
}

export function ProductGallery({ images, product }: Props) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [zoomed, setZoomed] = useState(false)

  const active = images[activeIndex]

  return (
    <>
      <div className="lg:sticky lg:top-24">
        {/* Main image */}
        <div
          className="relative aspect-square overflow-hidden bg-obsidian-3 mb-4 cursor-zoom-in group"
          onClick={() => setZoomed(true)}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0"
            >
              <Image
                src={active?.url ?? '/images/placeholder-product.jpg'}
                alt={active?.alt ?? product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
              {product.colorAccent && (
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    background: `radial-gradient(circle at 50% 80%, ${product.colorAccent}40 0%, transparent 60%)`,
                  }}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Zoom hint */}
          <div className="absolute bottom-4 right-4 glass p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <ZoomIn size={16} className="text-cream/60" />
          </div>

          {/* Product label */}
          <div className="absolute top-4 left-4">
            <div className="glass px-4 py-2">
              <p className="font-sans text-[9px] tracking-[0.4em] uppercase text-cream/50">
                CRUISER
              </p>
              <p className="font-display text-sm text-gold">
                {product.name.toUpperCase()}
              </p>
            </div>
          </div>
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="grid grid-cols-4 gap-2">
            {images.map((img, i) => (
              <button
                key={img.id}
                onClick={() => setActiveIndex(i)}
                className={`relative aspect-square overflow-hidden transition-all duration-300 ${
                  i === activeIndex
                    ? 'border border-gold/60 opacity-100'
                    : 'border border-white/10 opacity-50 hover:opacity-80'
                }`}
              >
                <Image
                  src={img.url}
                  alt={img.alt ?? `${product.name} view ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="10vw"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox zoom */}
      <AnimatePresence>
        {zoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-obsidian/95 backdrop-blur-lg flex items-center justify-center p-6"
            onClick={() => setZoomed(false)}
          >
            <div className="relative max-w-3xl max-h-[85vh] w-full aspect-square">
              <Image
                src={active?.url ?? ''}
                alt={active?.alt ?? product.name}
                fill
                className="object-contain"
                sizes="80vw"
              />
            </div>
            <p className="absolute bottom-6 font-sans text-xs text-cream/30 tracking-widest uppercase">
              Click to close
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
