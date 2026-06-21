'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, Package, ArrowRight, Copy, Upload } from 'lucide-react'
import { SITE } from '@/lib/constants'
import { formatPrice } from '@/lib/utils'
import toast from 'react-hot-toast'

interface BankAccount {
  id: string
  bankName: string
  accountNumber: string
  accountName: string
}

const PAYMENT_INSTRUCTIONS: Record<string, { title: string; steps: string[] }> = {
  qris: {
    title: 'Instruksi Pembayaran QRIS',
    steps: [
      'Buka aplikasi e-wallet atau mobile banking kamu',
      'Pilih fitur Scan QR / QRIS',
      'Hubungi kami via WhatsApp untuk mendapatkan kode QRIS',
      'Bayar sesuai total pesanan',
      'Screenshot bukti pembayaran dan kirim ke WhatsApp kami',
    ],
  },
  bank_transfer: {
    title: 'Instruksi Transfer Bank',
    steps: [
      'Transfer ke salah satu rekening di bawah sesuai total pesanan',
      'Gunakan nomor pesanan sebagai berita / keterangan transfer',
      'Klik "Selesaikan Pembayaran" di bawah dan unggah bukti transfer',
      'Pesanan akan diproses setelah pembayaran dikonfirmasi admin',
    ],
  },
  cod: {
    title: 'Pembayaran di Tempat (COD)',
    steps: [
      'Pesanan kamu akan segera kami proses dan dikirimkan',
      'Siapkan uang cash sesuai total pesanan saat paket tiba',
      'Bayar ke kurir saat barang diterima',
    ],
  },
  midtrans: {
    title: 'Pembayaran Kartu Kredit/Debit',
    steps: [
      'Kamu akan diarahkan ke halaman pembayaran Midtrans',
      'Masukkan data kartu kredit/debit kamu',
      'Pesanan diproses otomatis setelah pembayaran sukses',
    ],
  },
}

function SuccessContent() {
  const params = useSearchParams()
  const orderNumber = params.get('order') ?? '—'
  const method = params.get('method') ?? 'qris'

  const instructions = PAYMENT_INSTRUCTIONS[method] ?? PAYMENT_INSTRUCTIONS.qris

  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
  const [proofUploaded, setProofUploaded] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [orderTotal, setOrderTotal] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (method !== 'bank_transfer') return
    fetch('/api/site-status')
      .then((res) => res.json())
      .then((data: { bankAccounts?: BankAccount[] }) => setBankAccounts(data.bankAccounts ?? []))
      .catch(() => {})
  }, [method])

  useEffect(() => {
    if (orderNumber === '—') return
    fetch(`/api/orders?orderNumber=${encodeURIComponent(orderNumber)}`)
      .then((res) => res.json())
      .then((data: { total?: number }) => {
        if (typeof data.total === 'number') setOrderTotal(data.total)
      })
      .catch(() => {})
  }, [orderNumber])

  function copyOrderNumber() {
    navigator.clipboard.writeText(orderNumber)
    toast.success('Nomor pesanan disalin!')
  }

  function copyAccountNumber(num: string) {
    navigator.clipboard.writeText(num)
    toast.success('Nomor rekening disalin!')
  }

  function handleProofFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || orderNumber === '—') return
    if (!file.type.startsWith('image/')) { toast.error('File harus berupa gambar'); return }
    if (file.size > 3 * 1024 * 1024) { toast.error('Ukuran gambar maks. 3MB'); return }

    const reader = new FileReader()
    reader.onload = async (ev) => {
      const imageBase64 = ev.target?.result as string
      setUploading(true)
      try {
        const res = await fetch(`/api/orders/${orderNumber}/payment-proof`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64 }),
        })
        if (!res.ok) throw new Error('Failed')
        setProofUploaded(true)
        toast.success('Bukti transfer terkirim! Tunggu konfirmasi admin.')
      } catch {
        toast.error('Gagal mengirim bukti transfer')
      } finally {
        setUploading(false)
      }
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="min-h-screen pt-20 pb-16 flex items-start justify-center">
      <div className="container max-w-2xl mx-auto px-4 sm:px-6 py-8">

        {/* CRUISER Logo */}
        <div className="text-center mb-8 pb-6 border-b border-white/[0.06]">
          <Link href="/" className="font-display text-2xl tracking-[0.3em] text-gold">CRUISER</Link>
        </div>

        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gold/10 border border-gold/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} className="text-gold" />
          </div>
          <h1 className="font-display text-3xl text-cream mb-2">Pesanan Berhasil Dibuat!</h1>
          <p className="font-sans text-sm text-cream/50">
            Terima kasih telah mempercayai CRUISER. Pesanan kamu sedang kami proses.
          </p>
        </div>

        {/* Order Number */}
        <div className="border border-gold/20 bg-gold/5 p-5 mb-6 text-center">
          <p className="font-sans text-[10px] tracking-widest uppercase text-gold/60 mb-2">Nomor Pesanan</p>
          <div className="flex items-center justify-center gap-3">
            <p className="font-display text-2xl text-gold tracking-wider">{orderNumber}</p>
            <button
              onClick={copyOrderNumber}
              className="text-cream/30 hover:text-gold transition-colors"
              title="Salin nomor pesanan"
            >
              <Copy size={15} />
            </button>
          </div>
          <p className="font-sans text-[10px] text-cream/30 mt-2">Simpan nomor ini untuk melacak pesanan kamu</p>
        </div>

        {/* Total to pay */}
        {method !== 'midtrans' && (
          <div className="border border-white/[0.08] bg-white/[0.02] p-5 mb-6 text-center">
            <p className="font-sans text-[10px] tracking-widest uppercase text-cream/40 mb-2">Total yang Harus Dibayar</p>
            <p className="font-display text-3xl text-cream">
              {orderTotal !== null ? formatPrice(orderTotal) : '...'}
            </p>
          </div>
        )}

        {/* Payment Instructions */}
        {method !== 'midtrans' && (
          <div className="border border-white/[0.08] bg-white/[0.02] p-5 mb-6">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="text-gold/60">💳</span>
              <h2 className="font-sans text-xs tracking-widest uppercase text-cream/50">{instructions.title}</h2>
            </div>
            <ol className="space-y-2">
              {instructions.steps.map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-5 h-5 bg-gold/10 border border-gold/20 flex-shrink-0 flex items-center justify-center font-sans text-[10px] text-gold/70 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="font-sans text-sm text-cream/60 leading-relaxed">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Bank accounts + upload proof */}
        {method === 'bank_transfer' && (
          <div className="border border-white/[0.08] bg-white/[0.02] p-5 mb-6">
            <h2 className="font-sans text-xs tracking-widest uppercase text-cream/50 mb-4">Rekening Tujuan Transfer</h2>
            {bankAccounts.length === 0 ? (
              <p className="font-sans text-xs text-cream/30">Belum ada rekening terdaftar. Hubungi kami via WhatsApp.</p>
            ) : (
              <div className="space-y-3 mb-5">
                {bankAccounts.map((acc) => (
                  <div key={acc.id} className="flex items-center justify-between bg-white/[0.03] border border-white/[0.06] px-4 py-3">
                    <div>
                      <p className="font-sans text-sm text-cream">{acc.bankName}</p>
                      <p className="font-mono text-sm text-gold/80">{acc.accountNumber}</p>
                      <p className="font-sans text-xs text-cream/40">a.n. {acc.accountName}</p>
                    </div>
                    <button
                      onClick={() => copyAccountNumber(acc.accountNumber)}
                      className="text-cream/30 hover:text-gold transition-colors"
                      title="Salin nomor rekening"
                    >
                      <Copy size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {proofUploaded ? (
              <p className="font-sans text-xs text-emerald-400/80 text-center">✓ Bukti transfer terkirim, menunggu konfirmasi admin</p>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="btn-luxury w-full py-3 flex items-center justify-center gap-2 text-sm tracking-widest disabled:opacity-60"
              >
                <Upload size={14} />
                {uploading ? 'Mengirim...' : 'Selesaikan Pembayaran — Unggah Bukti'}
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleProofFileChange}
              className="hidden"
            />
          </div>
        )}

        {/* WhatsApp CTA */}
        <a
          href={SITE.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-luxury w-full py-4 flex items-center justify-center gap-2 text-sm tracking-widest mb-4"
        >
          Konfirmasi via WhatsApp
          <ArrowRight size={14} />
        </a>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/account/orders"
            className="flex items-center justify-center gap-2 border border-white/10 hover:border-gold/30 transition-colors py-3 font-sans text-xs text-cream/60 hover:text-gold"
          >
            <Package size={13} />
            Lacak Pesanan
          </Link>
          <Link
            href="/shop"
            className="flex items-center justify-center gap-2 border border-white/10 hover:border-gold/30 transition-colors py-3 font-sans text-xs text-cream/60 hover:text-gold"
          >
            Lanjut Belanja
            <ArrowRight size={13} />
          </Link>
        </div>

        <p className="text-center font-sans text-[10px] text-cream/20 mt-8">
          Ada pertanyaan? Hubungi kami di{' '}
          <a href={`mailto:${SITE.email}`} className="text-gold/40 hover:text-gold/60 transition-colors">
            {SITE.email}
          </a>
        </p>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="font-display text-cream/20">Memuat...</div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}
