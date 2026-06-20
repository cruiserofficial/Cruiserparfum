import type { Metadata } from 'next'
import { SITE } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Returns & Exchanges — CRUISER Parfum',
}

export default function ReturnsPage() {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container max-w-3xl mx-auto px-6">
        <div className="py-12 border-b border-white/[0.06] mb-10">
          <p className="font-sans text-xs tracking-[0.4em] uppercase text-gold/60 mb-3">Bantuan</p>
          <h1 className="font-display text-4xl text-cream">Pengembalian &amp; Penukaran</h1>
        </div>

        <div className="prose prose-invert max-w-none space-y-8 font-serif text-cream/60 leading-relaxed">
          <section>
            <h2 className="font-display text-xl text-cream mb-3">1. Syarat Pengembalian</h2>
            <p>
              Produk dapat dikembalikan dalam <strong className="text-cream">3 hari</strong> setelah diterima,
              dengan kondisi:
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Segel produk belum dibuka / digunakan</li>
              <li>Kemasan asli masih lengkap (kotak, dus, dll)</li>
              <li>Terdapat cacat produksi atau kerusakan saat pengiriman</li>
              <li>Produk yang diterima salah dari yang dipesan</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl text-cream mb-3">2. Produk yang Tidak Dapat Dikembalikan</h2>
            <p>
              Produk yang sudah dibuka segelnya atau digunakan tidak dapat dikembalikan, kecuali karena
              kesalahan dari pihak kami (salah kirim atau cacat produksi yang baru terlihat setelah dicoba).
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-cream mb-3">3. Cara Mengajukan Pengembalian</h2>
            <ol className="list-decimal pl-5 space-y-1 mt-2">
              <li>Hubungi kami via WhatsApp atau email dalam 3 hari setelah produk diterima</li>
              <li>Sertakan nomor pesanan, foto/video kondisi produk, dan alasan pengembalian</li>
              <li>Tim kami akan memverifikasi dan memberikan instruksi pengiriman balik</li>
              <li>Refund atau penggantian produk diproses setelah barang kami terima dan verifikasi</li>
            </ol>
          </section>

          <section>
            <h2 className="font-display text-xl text-cream mb-3">4. Refund</h2>
            <p>
              Refund akan dikembalikan ke metode pembayaran asal dalam 3–7 hari kerja setelah pengembalian
              disetujui dan diverifikasi.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-cream mb-3">5. Butuh Bantuan?</h2>
            <p>
              Hubungi kami melalui WhatsApp atau email di{' '}
              <a href={`mailto:${SITE.email}`} className="text-gold/70 hover:text-gold">{SITE.email}</a>{' '}
              untuk bantuan pengembalian atau penukaran produk.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
