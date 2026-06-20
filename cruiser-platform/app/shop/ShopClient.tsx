'use client'

import { useState, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { ProductCard } from '@/components/shop/ProductCard'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import type { Product } from '@/types'

interface Props {
  products: Product[]
}

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'bestseller', label: 'Bestselling' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest' },
]

const DNA_FILTERS = ['Fresh', 'Sweet', 'Addictive', 'Warm', 'Sensual', 'Deep', 'Creamy', 'Comforting']

export function ShopClient({ products: allProducts }: Props) {
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('search') ?? '')
  const [sort, setSort] = useState('featured')
  const [selectedDna, setSelectedDna] = useState<string[]>([])
  const [filtersOpen, setFiltersOpen] = useState(false)

  const filtered = useMemo(() => {
    let list = [...allProducts]

    if (search) {
      const q = search.toLowerCase()
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.dna?.some((d) => d.toLowerCase().includes(q)),
      )
    }

    if (selectedDna.length > 0) {
      list = list.filter((p) =>
        selectedDna.some((d) => p.dna?.includes(d)),
      )
    }

    if (searchParams.get('filter') === 'bestseller') {
      list = list.filter((p) => p.isBestseller)
    }
    if (searchParams.get('filter') === 'new') {
      list = list.filter((p) => p.isNew)
    }

    switch (sort) {
      case 'price_asc': list.sort((a, b) => a.price - b.price); break
      case 'price_desc': list.sort((a, b) => b.price - a.price); break
      case 'bestseller': list.sort((a, b) => (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0)); break
      case 'newest': list.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0)); break
      default: list.sort((a, b) => a.sortOrder - b.sortOrder)
    }

    return list
  }, [allProducts, search, sort, selectedDna, searchParams])

  function toggleDna(dna: string) {
    setSelectedDna((prev) =>
      prev.includes(dna) ? prev.filter((d) => d !== dna) : [...prev, dna],
    )
  }

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-cream/30" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search fragrances..."
            className="input-luxury pl-10 w-full"
          />
        </div>

        {/* Sort */}
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="input-luxury max-w-[200px] cursor-pointer"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-obsidian-3">
              {opt.label}
            </option>
          ))}
        </select>

        {/* Filter toggle */}
        <button
          onClick={() => setFiltersOpen((v) => !v)}
          className="btn-luxury-outline flex items-center gap-2 px-5 py-3"
        >
          <SlidersHorizontal size={15} />
          <span>Filter</span>
          {selectedDna.length > 0 && (
            <span className="w-5 h-5 bg-gold text-obsidian text-[10px] font-bold rounded-full flex items-center justify-center">
              {selectedDna.length}
            </span>
          )}
        </button>
      </div>

      {/* DNA filters panel */}
      <AnimatePresence>
        {filtersOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-8"
          >
            <div className="glass p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="font-sans text-xs tracking-[0.2em] uppercase text-gold">
                  Filter by Character
                </p>
                {selectedDna.length > 0 && (
                  <button
                    onClick={() => setSelectedDna([])}
                    className="font-sans text-xs text-cream/40 hover:text-cream flex items-center gap-1"
                  >
                    <X size={12} /> Clear
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {DNA_FILTERS.map((dna) => (
                  <button
                    key={dna}
                    onClick={() => toggleDna(dna)}
                    className={`font-sans text-xs tracking-widest uppercase px-4 py-2 border transition-all duration-300 ${
                      selectedDna.includes(dna)
                        ? 'bg-gold text-obsidian border-gold'
                        : 'border-white/10 text-cream/50 hover:border-gold/40 hover:text-cream'
                    }`}
                  >
                    {dna}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results count */}
      <div className="flex items-center justify-between mb-6">
        <p className="font-sans text-xs text-cream/40">
          {filtered.length} {filtered.length === 1 ? 'product' : 'products'}
        </p>
      </div>

      {/* Product grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-24">
          <p className="font-display text-2xl text-cream/30 mb-4">No products found</p>
          <button onClick={() => { setSearch(''); setSelectedDna([]) }} className="btn-luxury-outline">
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
