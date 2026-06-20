import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Syarat & Ketentuan — CRUISER Parfum',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container max-w-3xl mx-auto px-6">
        <div className="py-12 border-b border-white/[0.06] mb-10">
          <p className="font-sans text-xs tracking-[0.4em] uppercase text-gold/60 mb-3">Legal</p>
          <h1 className="font-display text-4xl text-cream">Syarat &amp; Ketentuan</h1>
          <p className="font-sans text-xs text-cream/30 mt-3">Terakhir diperbarui: Juni 2026</p>
        </div>

        <div className="prose prose-invert max-w-none space-y-8 font-serif text-cream/60 leading-relaxed">

          <section>
            <h2 className="font-display text-xl text-cream mb-3">1. Penerimaan Syarat</h2>
            <p>
              Dengan mengakses atau menggunakan layanan CRUISER Parfum, kamu menyetujui untuk terikat oleh
              syarat dan ketentuan ini. Jika kamu tidak setuju, harap tidak menggunakan layanan kami.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-cream mb-3">2. Produk</h2>
            <p>
              Semua produk CRUISER adalah Extrait De Parfum asli yang diproduksi dengan standar kualitas tinggi.
              Kami tidak menjual produk tiruan atau replika. Gambar produk mungkin sedikit berbeda dari produk asli
              karena perbedaan layar.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-cream mb-3">3. Pemesanan &amp; Pembayaran</h2>
            <p>
              Pesanan dianggap sah setelah pembayaran berhasil dikonfirmasi. Kami berhak membatalkan pesanan
              yang terindikasi penipuan. Harga yang tertera adalah harga dalam Rupiah (IDR) dan sudah termasuk PPN.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-cream mb-3">4. Pengiriman</h2>
            <p>
              Kami berupaya memproses pesanan dalam 1–2 hari kerja. Estimasi waktu pengiriman tergantung
              pada kurir dan lokasi tujuan. CRUISER tidak bertanggung jawab atas keterlambatan yang disebabkan
              oleh pihak kurir atau kondisi di luar kendali kami.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-cream mb-3">5. Pengembalian &amp; Refund</h2>
            <p>
              Produk yang sudah dibuka tidak dapat dikembalikan kecuali terdapat cacat produksi.
              Pengajuan pengembalian harus dilakukan dalam 3 hari setelah produk diterima dengan menyertakan
              foto/video kondisi produk.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-cream mb-3">6. Privasi</h2>
            <p>
              Data pribadi kamu (nama, email, alamat) hanya digunakan untuk memproses pesanan dan
              komunikasi terkait layanan kami. Kami tidak menjual data pribadi kepada pihak ketiga.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-cream mb-3">7. Kontak</h2>
            <p>
              Pertanyaan mengenai syarat dan ketentuan ini dapat dikirimkan ke{' '}
              <a href="mailto:cruiser.official1@gmail.com" className="text-gold/70 hover:text-gold transition-colors">
                cruiser.official1@gmail.com
              </a>{' '}
              atau melalui WhatsApp kami.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-white/[0.06]">
          <Link href="/" className="font-sans text-xs text-cream/30 hover:text-cream transition-colors">
            ← Kembali ke beranda
          </Link>
        </div>
      </div>
    </div>
  )
}
