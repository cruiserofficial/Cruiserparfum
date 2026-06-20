'use client'

import { useEffect, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import Link from 'next/link'
import { Star } from 'lucide-react'

interface ReviewData {
  id: string
  customerName: string
  rating: number
  title: string | null
  body: string
  createdAt: string
}

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

export function ProductReviews({ productId }: Props) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const [reviews, setReviews] = useState<ReviewData[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetch(`/api/reviews?productId=${encodeURIComponent(productId)}`)
      .then((res) => res.json())
      .then((data: { reviews: ReviewData[] }) => setReviews(data.reviews ?? []))
      .catch(() => {})
      .finally(() => setLoaded(true))
  }, [productId])

  const avgRating = reviews.length
    ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
    : 0

  if (loaded && reviews.length === 0) {
    return (
      <section ref={ref} className="py-16 border-t border-white/[0.06]">
        <div className="max-w-4xl mx-auto text-center">
          <p className="label-gold mx-auto w-fit mb-6">Reviews</p>
          <p className="font-serif text-cream/40 text-sm">
            Belum ada review untuk produk ini. Sudah beli? Tulis review dari{' '}
            <Link href="/account/orders" className="text-gold/70 hover:text-gold underline">Pesanan Saya</Link>.
          </p>
        </div>
      </section>
    )
  }

  if (reviews.length === 0) return null

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
                <StarRating rating={Math.round(avgRating)} size={18} />
                <p className="font-sans text-xs text-cream/40 mt-1">
                  {reviews.length} verified review{reviews.length > 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>

          <Link href="/account/orders" className="btn-luxury-outline flex items-center gap-2">
            Tulis Review
          </Link>
        </div>

        {/* Reviews list */}
        <div className="space-y-6">
          {reviews.map((review, i) => (
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
                    <p className="font-sans text-sm font-semibold text-cream">{review.customerName}</p>
                    <span className="font-sans text-[9px] tracking-widest uppercase text-gold/60 border border-gold/20 px-2 py-0.5">
                      Verified
                    </span>
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
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
