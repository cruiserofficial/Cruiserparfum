'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Star } from 'lucide-react'

const REVIEWS = [
  {
    name: 'Rina A.',
    product: 'CRUISER — ETERNITY',
    rating: 5,
    text: 'Wangi ETERNITY beneran tahan lama, dari pagi sampai sore masih kerasa. Banyak yang nanya parfum apa, worth it banget!',
    initial: 'R',
    color: '#8B9E6A',
  },
  {
    name: 'Dika R.',
    product: 'CRUISER — NOCTIS',
    rating: 5,
    text: 'NOCTIS jadi andalan buat date night. Aromanya dalam banget, sensual, dan beda dari parfum lain yang pernah aku coba.',
    initial: 'D',
    color: '#7A1A45',
  },
  {
    name: 'Sari W.',
    product: 'CRUISER — LIBEREA',
    rating: 5,
    text: 'LIBEREA tuh kalem tapi mewah banget. Cocok buat kerja sehari-hari, nggak overwhelming tapi tetap keliatan berkelas.',
    initial: 'S',
    color: '#1A5F8A',
  },
  {
    name: 'Mega P.',
    product: 'CRUISER — Mix Bundle',
    rating: 5,
    text: 'Packaging elegan, wangi premium, harga terjangkau. Sudah beli 3x dan sudah belikan ke beberapa teman juga. Top!',
    initial: 'M',
    color: '#C9A84C',
  },
]

const STATS = [
  { num: '5000+', label: 'Happy Customers' },
  { num: '4.9★', label: 'Average Rating' },
  { num: '100%', label: 'Authentic Product' },
  { num: 'COD', label: 'Available' },
]

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={14}
          className={i < rating ? 'text-gold fill-gold' : 'text-gold/20'}
        />
      ))}
    </div>
  )
}

export function Testimonials() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="py-24 md:py-32 bg-obsidian-2" id="testimonials">
      <div className="container max-w-7xl mx-auto px-6" ref={ref}>
        {/* Header */}
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            className="label-gold mx-auto w-fit mb-6"
          >
            Reviews
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="font-display text-[clamp(2rem,5vw,3.5rem)] text-cream mb-4"
          >
            Yang Mereka Rasakan
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2 }}
            className="font-serif text-cream/50 text-lg"
          >
            Ribuan pelanggan puas di seluruh Indonesia
          </motion.p>
          <div className="ornament mt-8">
            <span className="text-gold text-xs">◆</span>
          </div>
        </div>

        {/* Reviews grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-16">
          {REVIEWS.map((review, i) => (
            <motion.div
              key={review.name}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: i * 0.1 }}
              className="glass p-6 flex flex-col gap-4"
            >
              <StarRating rating={review.rating} />
              <p className="font-serif text-cream/70 text-sm leading-relaxed flex-1">
                &ldquo;{review.text}&rdquo;
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-white/[0.06]">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-sans font-semibold text-sm text-obsidian"
                  style={{ backgroundColor: review.color }}
                >
                  {review.initial}
                </div>
                <div>
                  <p className="font-sans text-xs font-semibold text-cream">
                    {review.name}
                  </p>
                  <p className="font-sans text-[10px] text-cream/40 tracking-widest uppercase">
                    {review.product}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5 }}
          className="glass-gold flex flex-wrap justify-center items-center gap-0 divide-x divide-gold/20"
        >
          {STATS.map((stat) => (
            <div key={stat.num} className="flex-1 min-w-[120px] text-center py-8 px-6">
              <p className="font-display text-2xl md:text-3xl text-gold mb-1">
                {stat.num}
              </p>
              <p className="font-sans text-[10px] tracking-[0.25em] uppercase text-cream/40">
                {stat.label}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
