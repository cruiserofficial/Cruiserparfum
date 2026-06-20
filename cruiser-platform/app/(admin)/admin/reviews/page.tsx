'use client'

import { useState } from 'react'
import { Star, Check, X, Trash2, Eye } from 'lucide-react'

type ReviewStatus = 'pending' | 'approved' | 'rejected'

const REVIEWS_INITIAL: {
  id: string; customer: string; product: string; rating: number; comment: string; status: ReviewStatus; date: string
}[] = []

const STATUS_CONFIG: Record<ReviewStatus, { label: string; class: string }> = {
  pending: { label: 'Pending', class: 'text-amber-400 bg-amber-400/10 border-amber-400/20' },
  approved: { label: 'Approved', class: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
  rejected: { label: 'Rejected', class: 'text-red-400 bg-red-400/10 border-red-400/20' },
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState(REVIEWS_INITIAL)
  const [filter, setFilter] = useState<ReviewStatus | 'all'>('all')

  function setStatus(id: string, status: ReviewStatus) {
    setReviews((prev) => prev.map((r) => r.id === id ? { ...r, status } : r))
  }

  function deleteReview(id: string) {
    setReviews((prev) => prev.filter((r) => r.id !== id))
  }

  const filtered = filter === 'all' ? reviews : reviews.filter((r) => r.status === filter)
  const pending = reviews.filter((r) => r.status === 'pending').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-cream">Reviews</h1>
          <p className="font-sans text-xs text-cream/40 mt-1">
            {pending > 0 ? `${pending} ulasan menunggu moderasi` : 'Semua ulasan sudah dimoderasi'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`font-sans text-[10px] tracking-widest uppercase px-3 py-2 border transition-all ${
                filter === f ? 'bg-gold text-obsidian border-gold' : 'border-white/10 text-cream/40 hover:border-white/20 hover:text-cream'
              }`}
            >
              {f === 'all' ? 'Semua' : f}
              {f === 'pending' && pending > 0 && (
                <span className="ml-1.5 w-4 h-4 bg-amber-400 text-obsidian text-[9px] rounded-full inline-flex items-center justify-center">
                  {pending}
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
          <p className="font-display text-2xl text-cream">{reviews.filter((r) => r.status === 'approved').length}</p>
          <p className="font-sans text-[10px] text-cream/30 mt-1">Ulasan Ditampilkan</p>
        </div>
        <div className="glass p-4 text-center">
          <p className="font-display text-2xl text-cream">{reviews.length}</p>
          <p className="font-sans text-[10px] text-cream/30 mt-1">Total Ulasan</p>
        </div>
      </div>

      {/* Reviews list */}
      <div className="space-y-3">
        {filtered.map((r) => {
          const sc = STATUS_CONFIG[r.status]
          return (
            <div key={r.id} className="glass p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <div className="flex items-center gap-1">
                      <span className="font-sans text-sm font-medium text-cream">{r.customer}</span>
                    </div>
                    <span className="font-sans text-[9px] text-cream/30">·</span>
                    <span className="font-sans text-xs text-gold/70">{r.product}</span>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={11} className={i < r.rating ? 'text-gold fill-gold' : 'text-gold/20'} />
                      ))}
                    </div>
                    <span className="font-sans text-[10px] text-cream/30">{r.date}</span>
                    <span className={`font-sans text-[9px] tracking-widest uppercase px-2 py-0.5 border ${sc.class}`}>
                      {sc.label}
                    </span>
                  </div>
                  <p className="font-serif text-sm text-cream/70 leading-relaxed">
                    &ldquo;{r.comment}&rdquo;
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {r.status === 'pending' && (
                    <>
                      <button
                        onClick={() => setStatus(r.id, 'approved')}
                        className="w-8 h-8 bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center text-emerald-400 hover:bg-emerald-400/20 transition-colors"
                        title="Approve"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        onClick={() => setStatus(r.id, 'rejected')}
                        className="w-8 h-8 bg-red-400/10 border border-red-400/20 flex items-center justify-center text-red-400 hover:bg-red-400/20 transition-colors"
                        title="Reject"
                      >
                        <X size={14} />
                      </button>
                    </>
                  )}
                  {r.status === 'approved' && (
                    <button
                      onClick={() => setStatus(r.id, 'rejected')}
                      className="w-8 h-8 border border-white/10 flex items-center justify-center text-cream/30 hover:text-red-400 transition-colors"
                      title="Sembunyikan"
                    >
                      <Eye size={14} />
                    </button>
                  )}
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
          )
        })}

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="font-display text-2xl text-cream/20">Tidak ada ulasan</p>
          </div>
        )}
      </div>
    </div>
  )
}
