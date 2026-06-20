'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { ArrowLeft, Package, ExternalLink, Upload, CheckCircle2, Star } from 'lucide-react'
import { getTrackingUrl } from '@/lib/tracking'
import { formatPrice, formatDate } from '@/lib/utils'
import { useCustomerOrderStore } from '@/features/orders/orderStore'
import toast from 'react-hot-toast'

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  pending: { label: 'Menunggu', cls: 'text-cream/40 border-white/10' },
  processing: { label: 'Diproses', cls: 'text-blue-400 border-blue-400/30 bg-blue-400/5' },
  shipped: { label: 'Dikirim', cls: 'text-purple-400 border-purple-400/30 bg-purple-400/5' },
  delivered: { label: 'Diterima', cls: 'text-gold border-gold/30 bg-gold/5' },
  cancelled: { label: 'Dibatalkan', cls: 'text-red-400 border-red-400/30 bg-red-400/5' },
}

interface OrderItem {
  productId?: string
  name: string
  quantity: number
  price: number
  imageUrl?: string | null
}

interface OrderData {
  id: string
  number: string
  status: string
  total: number
  subtotal: number
  shippingCost: number
  createdAt?: string
  date?: string
  city: string
  province: string
  shippingMethod: string
  courier?: string | null
  trackingNumber?: string | null
  paymentMethod?: string
  paymentProofUrl?: string | null
  customerConfirmedAt?: string | null
  items: OrderItem[]
}

export default function OrdersPage() {
  const localOrders = useCustomerOrderStore((s) => s.orders)
  const [dbOrders, setDbOrders] = useState<OrderData[]>([])
  const [loading, setLoading] = useState(true)
  const [uploadingProof, setUploadingProof] = useState<string | null>(null)
  const [confirming, setConfirming] = useState<string | null>(null)
  const [reviewOpenKey, setReviewOpenKey] = useState<string | null>(null)
  const [reviewSubmitted, setReviewSubmitted] = useState<Set<string>>(new Set())
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewTitle, setReviewTitle] = useState('')
  const [reviewBody, setReviewBody] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const pendingUploadOrderRef = useRef<string | null>(null)

  async function handleProofFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    const orderNumber = pendingUploadOrderRef.current
    if (!file || !orderNumber) return
    if (!file.type.startsWith('image/')) { toast.error('File harus berupa gambar'); return }
    if (file.size > 3 * 1024 * 1024) { toast.error('Ukuran gambar maks. 3MB'); return }

    const reader = new FileReader()
    reader.onload = async (ev) => {
      const imageBase64 = ev.target?.result as string
      setUploadingProof(orderNumber)
      try {
        const res = await fetch(`/api/orders/${orderNumber}/payment-proof`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64 }),
        })
        if (!res.ok) throw new Error('Failed')
        setDbOrders((prev) => prev.map((o) => o.number === orderNumber ? { ...o, paymentProofUrl: imageBase64 } : o))
        toast.success('Bukti transfer terkirim! Tunggu konfirmasi admin.')
      } catch {
        toast.error('Gagal mengirim bukti transfer')
      } finally {
        setUploadingProof(null)
      }
    }
    reader.readAsDataURL(file)
  }

  function triggerProofUpload(orderNumber: string) {
    pendingUploadOrderRef.current = orderNumber
    fileInputRef.current?.click()
  }

  async function handleConfirmReceived(orderNumber: string) {
    setConfirming(orderNumber)
    try {
      const res = await fetch(`/api/account/orders/${orderNumber}/confirm-received`, { method: 'POST' })
      if (!res.ok) throw new Error('Failed')
      setDbOrders((prev) => prev.map((o) =>
        o.number === orderNumber ? { ...o, status: 'delivered', customerConfirmedAt: new Date().toISOString() } : o
      ))
      toast.success('Pesanan dikonfirmasi diterima. Terima kasih! 🎉')
    } catch {
      toast.error('Gagal konfirmasi pesanan diterima')
    } finally {
      setConfirming(null)
    }
  }

  async function handleSubmitReview(orderNumber: string, productId: string) {
    if (!reviewBody.trim() || reviewBody.trim().length < 5) { toast.error('Tulis review minimal 5 karakter'); return }
    setSubmittingReview(true)
    try {
      const res = await fetch('/api/account/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNumber, productId, rating: reviewRating, title: reviewTitle.trim(), body: reviewBody.trim() }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => null) as { error?: string } | null
        throw new Error(err?.error ?? 'Gagal mengirim review')
      }
      setReviewSubmitted((prev) => new Set(prev).add(`${orderNumber}:${productId}`))
      setReviewOpenKey(null)
      setReviewRating(5)
      setReviewTitle('')
      setReviewBody('')
      toast.success('Terima kasih atas review-nya! ⭐')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Gagal mengirim review')
    } finally {
      setSubmittingReview(false)
    }
  }

  useEffect(() => {
    // Try to fetch orders from DB for logged-in users
    async function fetchDbOrders() {
      try {
        const res = await fetch('/api/account/orders')
        if (res.ok) {
          const { orders } = await res.json()
          setDbOrders(orders ?? [])
        }
      } catch {
        // Not logged in or API not available — fall back to localStorage only
      } finally {
        setLoading(false)
      }
    }
    fetchDbOrders()
  }, [])

  // Merge DB orders with localStorage orders, deduplicating by order number
  const allOrders = [...dbOrders]
  for (const lo of localOrders) {
    if (!allOrders.find((o) => o.number === lo.number)) {
      allOrders.push({
        id: lo.id,
        number: lo.number,
        status: lo.status,
        total: lo.total,
        subtotal: lo.subtotal,
        shippingCost: lo.shippingCost,
        date: lo.date,
        city: lo.city,
        province: lo.province,
        shippingMethod: lo.shippingMethod ?? '',
        courier: lo.courier,
        trackingNumber: lo.trackingNumber,
        items: lo.items,
      })
    }
  }

  // Sort by date descending
  allOrders.sort((a, b) => {
    const aDate = a.createdAt ?? a.date ?? ''
    const bDate = b.createdAt ?? b.date ?? ''
    return bDate.localeCompare(aDate)
  })

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container max-w-3xl mx-auto px-6">
        <Link href="/account" className="flex items-center gap-2 font-sans text-xs text-cream/40 hover:text-cream transition-colors mb-8">
          <ArrowLeft size={13} /> Kembali ke akun
        </Link>

        <h1 className="font-display text-3xl text-cream mb-8">Pesanan Saya</h1>

        {allOrders.length === 0 ? (
          <div className="glass text-center py-16">
            <Package size={40} className="text-cream/10 mx-auto mb-4" />
            <p className="font-display text-xl text-cream/30 mb-2">Belum ada pesanan</p>
            <p className="font-sans text-xs text-cream/20 mb-6">Pesanan yang kamu buat akan muncul di sini</p>
            <Link href="/shop" className="btn-luxury inline-flex">Belanja Sekarang</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {allOrders.map((order) => {
              const s = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending
              const orderDate = order.createdAt ?? order.date ?? ''
              return (
                <div key={order.id} className="glass p-5">
                  <div className="flex items-center justify-between flex-wrap gap-4 mb-4 pb-4 border-b border-white/[0.06]">
                    <div>
                      <p className="font-sans text-sm text-cream">{order.number}</p>
                      <p className="font-sans text-xs text-cream/40">{formatDate(orderDate)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`font-sans text-[9px] tracking-widest uppercase px-2.5 py-1 border ${s.cls}`}>
                        {s.label}
                      </span>
                      <span className="font-display text-lg text-cream">{formatPrice(order.total)}</span>
                    </div>
                  </div>

                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between items-center mb-3">
                      <div>
                        <p className="font-sans text-sm text-cream">{item.name} × {item.quantity}</p>
                        <p className="font-sans text-xs text-cream/40">50ml Extrait De Parfum</p>
                      </div>
                      <p className="font-sans text-sm text-cream/70">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}

                  <div className="mt-3 pt-3 border-t border-white/[0.06] space-y-1">
                    <p className="font-sans text-[10px] text-cream/30">
                      Pengiriman ke: <span className="text-cream/50">{order.city}, {order.province}</span>
                    </p>
                    {order.shippingMethod && (
                      <p className="font-sans text-[10px] text-cream/30">
                        Kurir: <span className="text-cream/50">{order.shippingMethod}</span>
                      </p>
                    )}
                  </div>

                  {order.trackingNumber ? (
                    <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center justify-between">
                      <div>
                        <p className="font-sans text-xs text-cream/40">
                          Kurir: <span className="text-cream/60">{order.courier ?? order.shippingMethod}</span>
                        </p>
                        <p className="font-sans text-xs text-cream/40 mt-0.5">
                          Resi: <span className="font-mono text-cream/70">{order.trackingNumber}</span>
                        </p>
                      </div>
                      <a
                        href={getTrackingUrl(order.trackingNumber, order.courier ?? undefined)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 font-sans text-xs text-gold/70 hover:text-gold transition-colors border border-gold/20 hover:border-gold/40 px-3 py-1.5"
                      >
                        Lacak Paket
                        <ExternalLink size={11} />
                      </a>
                    </div>
                  ) : (
                    <div className="mt-3 pt-3 border-t border-white/[0.06]">
                      <p className="font-sans text-[10px] text-cream/25 italic">
                        Nomor resi belum tersedia — akan kami update segera setelah paket dikirim
                      </p>
                    </div>
                  )}

                  {/* Bank transfer — upload proof */}
                  {order.paymentMethod === 'bank_transfer' && !order.paymentProofUrl && (
                    <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center justify-between gap-3">
                      <p className="font-sans text-[11px] text-amber-400/80">Belum bayar? Kirim bukti transfer di sini</p>
                      <button
                        onClick={() => triggerProofUpload(order.number)}
                        disabled={uploadingProof === order.number}
                        className="flex items-center gap-1.5 font-sans text-xs text-gold/70 hover:text-gold border border-gold/30 hover:border-gold/60 px-3 py-1.5 transition-colors disabled:opacity-50 flex-shrink-0"
                      >
                        <Upload size={12} />
                        {uploadingProof === order.number ? 'Mengirim...' : 'Selesaikan Pembayaran'}
                      </button>
                    </div>
                  )}
                  {order.paymentMethod === 'bank_transfer' && order.paymentProofUrl && (
                    <p className="mt-3 pt-3 border-t border-white/[0.06] font-sans text-[11px] text-emerald-400/80">
                      ✓ Bukti transfer terkirim, menunggu konfirmasi admin
                    </p>
                  )}

                  {/* Confirm received */}
                  {order.status === 'shipped' && !order.customerConfirmedAt && (
                    <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center justify-between gap-3">
                      <p className="font-sans text-[11px] text-cream/40">Sudah terima paketnya?</p>
                      <button
                        onClick={() => handleConfirmReceived(order.number)}
                        disabled={confirming === order.number}
                        className="flex items-center gap-1.5 font-sans text-xs text-gold/70 hover:text-gold border border-gold/30 hover:border-gold/60 px-3 py-1.5 transition-colors disabled:opacity-50 flex-shrink-0"
                      >
                        <CheckCircle2 size={12} />
                        {confirming === order.number ? 'Memproses...' : 'Pesanan Diterima'}
                      </button>
                    </div>
                  )}

                  {/* Write a review — only after customer confirmed receipt */}
                  {order.customerConfirmedAt && (
                    <div className="mt-3 pt-3 border-t border-white/[0.06] space-y-2">
                      {order.items.filter((item) => item.productId).map((item) => {
                        const key = `${order.number}:${item.productId}`
                        const alreadyReviewed = reviewSubmitted.has(key)
                        return (
                          <div key={key}>
                            {alreadyReviewed ? (
                              <p className="font-sans text-[11px] text-emerald-400/70">✓ Review untuk {item.name} terkirim</p>
                            ) : reviewOpenKey === key ? (
                              <div className="bg-white/[0.03] border border-white/[0.06] p-3 space-y-2">
                                <p className="font-sans text-xs text-cream/60">Review untuk {item.name}</p>
                                <div className="flex gap-1">
                                  {[1, 2, 3, 4, 5].map((r) => (
                                    <button key={r} type="button" onClick={() => setReviewRating(r)}>
                                      <Star size={16} className={r <= reviewRating ? 'text-gold fill-gold' : 'text-gold/20'} />
                                    </button>
                                  ))}
                                </div>
                                <input
                                  value={reviewTitle}
                                  onChange={(e) => setReviewTitle(e.target.value)}
                                  placeholder="Judul review (opsional)"
                                  className="w-full bg-white/[0.04] border border-white/10 focus:border-gold/50 outline-none px-3 py-2 font-sans text-xs text-cream placeholder:text-cream/20"
                                />
                                <textarea
                                  value={reviewBody}
                                  onChange={(e) => setReviewBody(e.target.value)}
                                  rows={3}
                                  placeholder="Ceritakan pengalaman kamu..."
                                  className="w-full bg-white/[0.04] border border-white/10 focus:border-gold/50 outline-none px-3 py-2 font-sans text-xs text-cream placeholder:text-cream/20 resize-none"
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => setReviewOpenKey(null)}
                                    className="flex-1 py-2 border border-white/10 text-cream/40 hover:text-cream font-sans text-xs"
                                  >
                                    Batal
                                  </button>
                                  <button
                                    onClick={() => handleSubmitReview(order.number, item.productId!)}
                                    disabled={submittingReview}
                                    className="flex-1 btn-luxury py-2 text-xs disabled:opacity-50"
                                  >
                                    {submittingReview ? 'Mengirim...' : 'Kirim Review'}
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => { setReviewOpenKey(key); setReviewRating(5); setReviewTitle(''); setReviewBody('') }}
                                className="flex items-center gap-1.5 font-sans text-xs text-gold/70 hover:text-gold border border-gold/30 hover:border-gold/60 px-3 py-1.5 transition-colors"
                              >
                                <Star size={12} />
                                Tulis Review untuk {item.name}
                              </button>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleProofFileChange}
          className="hidden"
        />
      </div>
    </div>
  )
}
