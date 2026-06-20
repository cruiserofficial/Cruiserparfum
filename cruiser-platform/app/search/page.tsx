'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Search, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatPrice } from '@/lib/utils'

const PRODUCTS = [
  {
    slug: 'eternity',
    name: 'Eternity',
    tagline: 'Freshness That Lingers.',
    price: 299000,
    comparePrice: 350000,
    image: '/images/eternity-splash.png',
    dna: ['Fresh', 'Sweet', 'Addictive'],
    notes: ['Pineapple', 'Green Apple', 'Lemon', 'Caramel', 'Bergamot'],
  },
  {
    slug: 'noctis',
    name: 'Noctis',
    tagline: 'Embrace the Night.',
    price: 299000,
    comparePrice: 350000,
    image: '/images/noctis-splash.png',
    dna: ['Warm', 'Sensual', 'Deep'],
    notes: ['Honey', 'Vanilla', 'Cinnamon', 'Jasmine', 'Musk'],
  },
  {
    slug: 'liberea',
    name: 'Liberea',
    tagline: 'Softness in Every Note.',
    price: 299000,
    comparePrice: 350000,
    image: '/images/liberea-splash.png',
    dna: ['Creamy', 'Fresh', 'Comforting'],
    notes: ['Lemon', 'Vanilla', 'Butter', 'Pink Pepper', 'White Floral'],
  },
]

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [input, setInput] = useState(searchParams.get('q') ?? '')

  useEffect(() => {
    const q = searchParams.get('q') ?? ''
    setQuery(q)
    setInput(q)
  }, [searchParams])

  const results = query.trim().length === 0
    ? PRODUCTS
    : PRODUCTS.filter((p) => {
        const q = query.toLowerCase()
        return (
          p.name.toLowerCase().includes(q) ||
          p.tagline.toLowerCase().includes(q) ||
          p.dna.some((d) => d.toLowerCase().includes(q)) ||
          p.notes.some((n) => n.toLowerCase().includes(q))
        )
      })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    router.push(`/search?q=${encodeURIComponent(input)}`)
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container max-w-5xl mx-auto px-6">
        {/* Header */}
        <div className="py-12 text-center border-b border-white/[0.06] mb-10">
          <p className="font-sans text-xs tracking-[0.4em] uppercase text-gold/60 mb-4">Pencarian</p>
          <h1 className="font-display text-4xl text-cream mb-8">Cari Produk</h1>

          {/* Search input */}
          <form onSubmit={handleSubmit} className="relative max-w-lg mx-auto">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-cream/30" />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Cari nama parfum, karakter, atau notes..."
              className="input-luxury w-full pl-11 pr-10 py-4"
              autoFocus
            />
            {input && (
              <button
                type="button"
                onClick={() => { setInput(''); router.push('/search') }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-cream/30 hover:text-cream transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </form>
        </div>

        {/* Results */}
        <div>
          {query && (
            <p className="font-sans text-xs text-cream/30 tracking-widest uppercase mb-6">
              {results.length} hasil untuk &ldquo;{query}&rdquo;
            </p>
          )}

          <AnimatePresence mode="wait">
            {results.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <p className="font-display text-2xl text-cream/30 mb-4">Tidak ditemukan</p>
                <p className="font-sans text-sm text-cream/20 mb-8">Coba kata kunci lain seperti "fresh", "vanilla", atau "musk"</p>
                <Link href="/shop" className="btn-luxury">Lihat Semua Produk</Link>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {results.map((product, i) => (
                  <motion.div
                    key={product.slug}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <Link href={`/products/${product.slug}`} className="group block glass overflow-hidden">
                      <div className="relative aspect-square overflow-hidden bg-obsidian-3">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-700"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      </div>
                      <div className="p-5">
                        <p className="font-sans text-[9px] tracking-[0.4em] uppercase text-gold/50 mb-1">CRUISER</p>
                        <h2 className="font-display text-xl text-cream mb-1">{product.name.toUpperCase()}</h2>
                        <p className="font-serif italic text-sm text-cream/40 mb-3">&ldquo;{product.tagline}&rdquo;</p>
                        <div className="flex gap-2 flex-wrap mb-4">
                          {product.dna.map((d) => (
                            <span key={d} className="font-sans text-[9px] tracking-[0.2em] uppercase border border-white/10 text-cream/40 px-2 py-1">
                              {d}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-baseline gap-3">
                          <span className="font-display text-lg text-cream">{formatPrice(product.price)}</span>
                          <span className="font-sans text-sm text-cream/30 line-through">{formatPrice(product.comparePrice)}</span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="w-6 h-6 border border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  )
}
