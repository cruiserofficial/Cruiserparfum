import type { Metadata } from 'next'
import { SITE } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Kebijakan Privasi — CRUISER Parfum',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container max-w-3xl mx-auto px-6">
        <div className="py-12 border-b border-white/[0.06] mb-10">
          <p className="font-sans text-xs tracking-[0.4em] uppercase text-gold/60 mb-3">Legal</p>
          <h1 className="font-display text-4xl text-cream">Kebijakan Privasi</h1>
          <p className="font-sans text-xs text-cream/30 mt-3">Terakhir diperbarui: Juni 2026</p>
        </div>

        <div className="prose prose-invert max-w-none space-y-8 font-serif text-cream/60 leading-relaxed">
          <section>
            <h2 className="font-display text-xl text-cream mb-3">1. Data yang Kami Kumpulkan</h2>
            <p>
              Kami mengumpulkan informasi yang kamu berikan saat membuat akun atau melakukan pemesanan,
              meliputi nama, email, nomor HP, dan alamat pengiriman. Data ini hanya digunakan untuk memproses
              pesanan dan komunikasi terkait layanan CRUISER.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-cream mb-3">2. Penggunaan Data</h2>
            <p>
              Data kamu digunakan untuk: memproses dan mengirimkan pesanan, menghubungi kamu terkait status
              pesanan, serta meningkatkan layanan kami. Kami tidak menjual atau membagikan data pribadi kamu
              ke pihak ketiga untuk tujuan pemasaran tanpa izin.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-cream mb-3">3. Keamanan Data</h2>
            <p>
              Kami menyimpan data kamu dengan langkah keamanan yang wajar, termasuk enkripsi password dan
              koneksi terenkripsi (SSL/TLS) untuk semua transaksi di situs ini.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-cream mb-3">4. Pihak Ketiga</h2>
            <p>
              Kami menggunakan layanan pihak ketiga terpercaya untuk memproses pengiriman (kurir), pembayaran,
              dan login (Google). Masing-masing layanan ini memiliki kebijakan privasi sendiri.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-cream mb-3">5. Hak Kamu</h2>
            <p>
              Kamu dapat meminta untuk melihat, mengubah, atau menghapus data pribadi kamu kapan saja dengan
              menghubungi kami melalui email atau WhatsApp di bawah ini.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-cream mb-3">6. Kontak</h2>
            <p>
              Pertanyaan terkait privasi data dapat dikirim ke{' '}
              <a href={`mailto:${SITE.email}`} className="text-gold/70 hover:text-gold">{SITE.email}</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
