import type { Metadata } from 'next'
import { SITE } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'FAQ — CRUISER Parfum',
}

const FAQS = [
  {
    q: 'Apakah produk CRUISER 100% original?',
    a: 'Ya. Semua produk CRUISER adalah Extrait De Parfum asli yang kami produksi sendiri dengan standar kualitas tinggi — bukan tiruan atau replika dari brand lain.',
  },
  {
    q: 'Berapa lama pesanan saya diproses?',
    a: 'Pesanan diproses dalam 1–2 hari kerja setelah pembayaran dikonfirmasi, sebelum diserahkan ke kurir untuk pengiriman.',
  },
  {
    q: 'Metode pembayaran apa yang tersedia?',
    a: 'Kami menerima QRIS, transfer bank, kartu kredit/debit (via Midtrans), dan COD (Bayar di Tempat) untuk area tertentu.',
  },
  {
    q: 'Bagaimana cara melacak pesanan saya?',
    a: 'Setelah pesanan dikirim, kamu akan menerima nomor resi. Cek halaman Lacak Pesanan atau buka Akun → Pesanan Saya untuk melihat status terkini.',
  },
  {
    q: 'Apakah bisa retur atau tukar produk?',
    a: 'Produk yang belum dibuka dapat dikembalikan dalam 3 hari setelah diterima jika terdapat cacat produksi. Lihat halaman Returns & Exchanges untuk detail lengkap.',
  },
  {
    q: 'Apakah CRUISER mengirim ke seluruh Indonesia?',
    a: 'Ya, kami mengirim ke seluruh wilayah Indonesia menggunakan beberapa pilihan kurir terpercaya.',
  },
  {
    q: 'Bagaimana cara menghubungi customer service?',
    a: `Hubungi kami via WhatsApp atau email di ${SITE.email} — tim kami siap membantu setiap hari kerja.`,
  },
]

export default function FaqPage() {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container max-w-3xl mx-auto px-6">
        <div className="py-12 border-b border-white/[0.06] mb-10 text-center">
          <p className="label-gold mx-auto w-fit mb-3">Bantuan</p>
          <h1 className="font-display text-4xl text-cream">Pertanyaan Umum</h1>
        </div>

        <div className="space-y-4">
          {FAQS.map(({ q, a }) => (
            <div key={q} className="glass p-6">
              <h2 className="font-display text-lg text-cream mb-2">{q}</h2>
              <p className="font-serif text-cream/55 leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
