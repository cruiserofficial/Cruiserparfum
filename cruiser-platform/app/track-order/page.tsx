'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, Package, ExternalLink, Loader2 } from 'lucide-react'
import { getTrackingUrl } from '@/lib/tracking'
import { formatPrice, formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

interface OrderResult {
  number: string
  status: string
  total?: number
  recipient?: string
  city?: string
  province?: string
  trackingNumber?: string | null
  courier?: string | null
  createdAt?: string
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Menunggu Konfirmasi',
  processing: 'Sedang Diproses',
  shipped: 'Dalam Pengiriman',
  delivered: 'Selesai Diterima',
  cancelled: 'Dibatalkan',
}

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<OrderResult | null>(null)
  const [notFound, setNotFound] = useState(false)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!orderNumber.trim()) { toast.error('Masukkan nomor pesanan'); return }

    setLoading(true)
    setResult(null)
    setNotFound(false)
    try {
      const res = await fetch(`/api/orders?orderNumber=${encodeURIComponent(orderNumber.trim())}`)
      const data = await res.json()
      if (!data.recipient && !data.total) {
        setNotFound(true)
      } else {
        setResult(data)
      }
    } catch {
      toast.error('Gagal mencari pesanan. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container max-w-xl mx-auto px-6">
        <div className="py-12 border-b border-white/[0.06] mb-10 text-center">
          <p className="label-gold mx-auto w-fit mb-3">Lacak Pesanan</p>
          <h1 className="font-display text-4xl text-cream mb-3">Cek Status Pesanan</h1>
          <p className="font-serif text-cream/50">
            Masukkan nomor pesanan kamu (contoh: CRS-260620-1234) untuk melihat status terkini.
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 mb-10">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cream/25 pointer-events-none" />
            <input
              type="text"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="CRS-260620-1234"
              className="w-full bg-white/[0.04] border border-white/10 focus:border-gold/50 outline-none pl-9 pr-4 py-3 font-sans text-sm text-cream placeholder:text-cream/20 transition-colors"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-luxury px-6 flex items-center gap-2 disabled:opacity-60">
            {loading ? <Loader2 size={14} className="animate-spin" /> : 'Cari'}
          </button>
        </form>

        {notFound && (
          <div className="glass text-center py-12">
            <Package size={32} className="text-cream/15 mx-auto mb-3" />
            <p className="font-display text-lg text-cream/40">Pesanan tidak ditemukan</p>
            <p className="font-sans text-xs text-cream/25 mt-1">Periksa kembali nomor pesanan kamu</p>
          </div>
        )}

        {result && (
          <div className="glass p-6 space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
              <div>
                <p className="font-sans text-sm text-cream">{result.number}</p>
                {result.createdAt && <p className="font-sans text-xs text-cream/40">{formatDate(result.createdAt)}</p>}
              </div>
              <span className="font-sans text-[9px] tracking-widest uppercase px-2.5 py-1 border border-gold/30 text-gold bg-gold/5">
                {STATUS_LABELS[result.status] ?? result.status}
              </span>
            </div>

            {result.recipient && (
              <div className="space-y-1">
                <p className="font-sans text-xs text-cream/30">
                  Penerima: <span className="text-cream/60">{result.recipient}</span>
                </p>
                {(result.city || result.province) && (
                  <p className="font-sans text-xs text-cream/30">
                    Tujuan: <span className="text-cream/60">{result.city}{result.city && result.province ? ', ' : ''}{result.province}</span>
                  </p>
                )}
              </div>
            )}

            {result.total != null && (
              <p className="font-display text-lg text-cream">{formatPrice(result.total)}</p>
            )}

            {result.trackingNumber ? (
              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
                <div>
                  <p className="font-sans text-xs text-cream/40">
                    Kurir: <span className="text-cream/60">{result.courier}</span>
                  </p>
                  <p className="font-sans text-xs text-cream/40 mt-0.5">
                    Resi: <span className="font-mono text-cream/70">{result.trackingNumber}</span>
                  </p>
                </div>
                <a
                  href={getTrackingUrl(result.trackingNumber, result.courier ?? undefined)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 font-sans text-xs text-gold/70 hover:text-gold transition-colors border border-gold/20 hover:border-gold/40 px-3 py-1.5"
                >
                  Lacak Paket <ExternalLink size={11} />
                </a>
              </div>
            ) : (
              <p className="font-sans text-[11px] text-cream/25 italic pt-3 border-t border-white/[0.06]">
                Nomor resi belum tersedia — akan diupdate setelah pesanan dikirim
              </p>
            )}
          </div>
        )}

        <p className="text-center font-sans text-xs text-cream/25 mt-10">
          Sudah login? Lihat semua pesanan kamu di{' '}
          <Link href="/account/orders" className="text-gold/50 hover:text-gold transition-colors">Akun Saya</Link>
        </p>
      </div>
    </div>
  )
}
