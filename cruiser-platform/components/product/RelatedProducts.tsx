'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { ProductCard } from '@/components/shop/ProductCard'
import type { Product } from '@/types'

interface Props {
  products: Product[]
  currentSlug: string
}

export function RelatedProducts({ products, currentSlug: _ }: Props) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  if (!products.length) return null

  return (
    <section ref={ref} className="py-16 border-t border-white/[0.06]">
      <div className="text-center mb-12">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="label-gold mx-auto w-fit mb-6"
        >
          Also From CRUISER
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1 }}
          className="font-display text-3xl text-cream"
        >
          Complete the Collection
        </motion.h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}
