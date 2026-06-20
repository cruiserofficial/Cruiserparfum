'use client'

import { useState } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { useRef } from 'react'
import { Star, ThumbsUp, Plus } from 'lucide-react'

// Static reviews (replace with API call in production)
const STATIC_REVIEWS = [
  {
    id: '1', name: 'Rina A.', rating: 5,
    title: 'Tahan Lama dan Wangi Banget!',
    body: 'Wangi ETERNITY beneran tahan lama, dari pagi sampai sore masih kerasa. Banyak yang nanya parfum apa, worth it banget!',
    isVerified: true, createdAt: '2026-05-15',
  },
  {
    id: '2', name: 'Dika R.', rating: 5,
    title: 'Best Date Night Scent',
    body: 'Jadi andalan buat date night. Aromanya dalam banget, sensual, dan beda dari parfum lain yang pernah aku coba. Highly recommended untuk yang suka wangi maskulin tapi elegan.',
    isVerified: true, createdAt: '2026-05-10',
  },
  {
    id: '3', name: 'Sari W.', rating: 5,
    title: 'Mewah tapi Tidak Overwhelming',
    body: 'Kalem tapi mewah banget. Cocok buat kerja sehari-hari, nggak overwhelming tapi tetap keliatan berkelas. Udah jadi signature scent aku.',
    isVerified: true, createdAt: '2026-04-28',
  },
]

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={size}
          className={i < rating ? 'text-gold fill-gold' : 'text-gold/20'}
        />
      ))}
    </div>
  )
}

interface Props {
  productId: string
}

export function ProductReviews({ productId: _ }: Props) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const [showForm, setShowForm] = useState(false)
  const avgRating = 5

  return (
    <section ref={ref} className="py-16 border-t border-white/[0.06]">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-start justify-between mb-12 flex-wrap gap-6">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              className="label-gold w-fit mb-6"
            >
              Reviews
            </motion.p>
            <div className="flex items-center gap-4">
              <span className="font-display text-5xl text-cream">{avgRating}</span>
              <div>
                <StarRating rating={avgRating} size={18} />
                <p className="font-sans text-xs text-cream/40 mt-1">
                  {STATIC_REVIEWS.length} verified reviews
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowForm((v) => !v)}
            className="btn-luxury-outline flex items-center gap-2"
          >
            <Plus size={14} />
            Write a Review
          </button>
        </div>

        {/* Write review form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-10"
            >
              <form className="glass p-6 space-y-4" onSubmit={(e) => { e.preventDefault(); setShowForm(false) }}>
                <h3 className="font-display text-xl text-cream mb-2">Share Your Experience</h3>
                <div>
                  <label className="font-sans text-xs tracking-widest uppercase text-cream/40 block mb-2">
                    Rating
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((r) => (
                      <button key={r} type="button" className="text-2xl hover:scale-125 transition-transform">
                        ⭐
                      </button>
                    ))}
                  </div>
                </div>
                <input required placeholder="Your name" className="input-luxury" />
                <input placeholder="Review title" className="input-luxury" />
                <textarea required rows={4} placeholder="Share your experience..." className="input-luxury resize-none" />
                <button type="submit" className="btn-luxury w-full">
                  Submit Review
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reviews list */}
        <div className="space-y-6">
          {STATIC_REVIEWS.map((review, i) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1 }}
              className="glass p-6"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <p className="font-sans text-sm font-semibold text-cream">{review.name}</p>
                    {review.isVerified && (
                      <span className="font-sans text-[9px] tracking-widest uppercase text-gold/60 border border-gold/20 px-2 py-0.5">
                        Verified
                      </span>
                    )}
                  </div>
                  <StarRating rating={review.rating} />
                </div>
                <p className="font-sans text-xs text-cream/30">
                  {new Date(review.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>

              {review.title && (
                <h4 className="font-sans text-sm font-semibold text-cream/80 mb-2">
                  {review.title}
                </h4>
              )}
              <p className="font-serif text-cream/60 text-sm leading-relaxed">
                {review.body}
              </p>

              <button className="mt-4 flex items-center gap-2 font-sans text-xs text-cream/30 hover:text-cream/60 transition-colors">
                <ThumbsUp size={12} /> Helpful
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
