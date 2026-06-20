'use client'

import { useEffect, useState } from 'react'
import { Star, Eye, EyeOff, Trash2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Review {
  id: string
  orderId: string
  productId: string
  userId: string
  customerName: string
  rating: number
  title: string | null
  body: string
  isVisible: boolean
  createdAt: string
}

type FilterStatus = 'all' | 'visible' | 'hidden'

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterStatus>('all')

  useEffect(() => {
    fetch('/api/admin/reviews')
      .then((res) => res.json())
      .then((data: { reviews: Review[] }) => setReviews(data.reviews ?? []))
      .catch(() => toast.error('Gagal memuat ulasan'))
      .finally(() => setLoading(false))
  }, [])

  async function toggleVisible(review: Review) {
    const next = !review.isVisible
    try {
      const res = await fetch(`/api/admin/reviews/${review.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVisible: next }),
      })
      if (!res.ok) throw new Error('Failed')
      setReviews((prev) => prev.map((r) => r.id === review.id ? { ...r, isVisible: next } : r))
      toast.success(next ? 'Ulasan ditampilkan' : 'Ulasan disembunyikan')
    } catch {
      toast.error('Gagal mengubah status ulasan')
    }
  }

  async function deleteReview(id: string) {
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed')
      setReviews((prev) => prev.filter((r) => r.id !== id))
      toast.success('Ulasan dihapus')
    } catch {
      toast.error('Gagal menghapus ulasan')
    }
  }

  const filtered = filter === 'all' ? reviews : reviews.filter((r) => filter === 'visible' ? r.isVisible : !r.isVisible)
  const hiddenCount = reviews.filter((r) => !r.isVisible).length

  if (loading) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl text-cream">Reviews</h1>
          <p className="font-sans text-xs text-cream/40 mt-1">
            Ulasan otomatis terkirim dari pelanggan yang sudah konfirmasi pesanan diterima
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(['all', 'visible', 'hidden'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`font-sans text-[10px] tracking-widest uppercase px-3 py-2 border transition-all ${
                filter === f ? 'bg-gold text-obsidian border-gold' : 'border-white/10 text-cream/40 hover:border-white/20 hover:text-cream'
              }`}
            >
              {f === 'all' ? 'Semua' : f === 'visible' ? 'Tampil' : 'Disembunyikan'}
              {f === 'hidden' && hiddenCount > 0 && (
                <span className="ml-1.5 w-4 h-4 bg-amber-400 text-obsidian text-[9px] rounded-full inline-flex items-center justify-center">
                  {hiddenCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass p-4 text-center">
          <p className="font-display text-2xl text-gold">
            {reviews.length > 0
              ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
              : '—'}
          </p>
          <div className="flex justify-center gap-0.5 my-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={10} className="text-gold/30" />
            ))}
          </div>
          <p className="font-sans text-[10px] text-cream/30">Rata-rata Rating</p>
        </div>
        <div className="glass p-4 text-center">
          <p className="font-display text-2xl text-cream">{reviews.filter((r) => r.isVisible).length}</p>
          <p className="font-sans text-[10px] text-cream/30 mt-1">Ulasan Ditampilkan</p>
        </div>
        <div className="glass p-4 text-center">
          <p className="font-display text-2xl text-cream">{reviews.length}</p>
          <p className="font-sans text-[10px] text-cream/30 mt-1">Total Ulasan</p>
        </div>
      </div>

      {/* Reviews list */}
      <div className="space-y-3">
        {filtered.map((r) => (
          <div key={r.id} className="glass p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <span className="font-sans text-sm font-medium text-cream">{r.customerName}</span>
                  <span className="font-sans text-[9px] text-cream/30">·</span>
                  <span className="font-sans text-xs text-gold/70">{r.productId}</span>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={11} className={i < r.rating ? 'text-gold fill-gold' : 'text-gold/20'} />
                    ))}
                  </div>
                  <span className="font-sans text-[10px] text-cream/30">{formatDate(r.createdAt)}</span>
                  {!r.isVisible && (
                    <span className="font-sans text-[9px] tracking-widest uppercase px-2 py-0.5 border text-red-400 bg-red-400/10 border-red-400/20">
                      Disembunyikan
                    </span>
                  )}
                </div>
                {r.title && <p className="font-sans text-sm font-semibold text-cream/80 mb-1">{r.title}</p>}
                <p className="font-serif text-sm text-cream/70 leading-relaxed">
                  &ldquo;{r.body}&rdquo;
                </p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => toggleVisible(r)}
                  className={`w-8 h-8 border flex items-center justify-center transition-colors ${
                    r.isVisible
                      ? 'border-white/10 text-cream/30 hover:text-amber-400'
                      : 'bg-emerald-400/10 border-emerald-400/20 text-emerald-400 hover:bg-emerald-400/20'
                  }`}
                  title={r.isVisible ? 'Sembunyikan' : 'Tampilkan'}
                >
                  {r.isVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
                <button
                  onClick={() => deleteReview(r.id)}
                  className="w-8 h-8 border border-white/10 flex items-center justify-center text-cream/20 hover:text-red-400 transition-colors"
                  title="Hapus"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="font-display text-2xl text-cream/20">Tidak ada ulasan</p>
          </div>
        )}
      </div>
    </div>
  )
}
