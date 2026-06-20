import type { Metadata } from 'next'
import { Truck, Clock, MapPin, Gift } from 'lucide-react'
import { FREE_SHIPPING_THRESHOLD } from '@/lib/constants'
import { formatPrice } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Info Pengiriman — CRUISER Parfum',
}

const POINTS = [
  {
    icon: Clock,
    title: 'Waktu Proses',
    desc: 'Pesanan diproses dan dikemas dalam 1–2 hari kerja setelah pembayaran dikonfirmasi.',
  },
  {
    icon: Truck,
    title: 'Pilihan Kurir',
    desc: 'Kami bekerja sama dengan beberapa kurir terpercaya (JNE, J&T, SiCepat, AnterAja, dan lainnya) — pilihan dan tarif muncul otomatis saat checkout sesuai lokasi tujuan.',
  },
  {
    icon: Gift,
    title: 'Gratis Ongkir',
    desc: `Belanja minimal ${formatPrice(FREE_SHIPPING_THRESHOLD)} dan dapatkan gratis ongkir ke seluruh Indonesia.`,
  },
  {
    icon: MapPin,
    title: 'Cakupan Wilayah',
    desc: 'Kami mengirim ke seluruh wilayah Indonesia, dari Sabang sampai Merauke.',
  },
]

export default function ShippingPage() {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container max-w-3xl mx-auto px-6">
        <div className="py-12 border-b border-white/[0.06] mb-10 text-center">
          <p className="label-gold mx-auto w-fit mb-3">Pengiriman</p>
          <h1 className="font-display text-4xl text-cream">Info Pengiriman</h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
          {POINTS.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="glass p-6">
              <div className="w-10 h-10 bg-gold/5 border border-gold/10 flex items-center justify-center mb-4">
                <Icon size={18} className="text-gold/60" />
              </div>
              <h2 className="font-display text-lg text-cream mb-2">{title}</h2>
              <p className="font-serif text-sm text-cream/55 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        <div className="prose prose-invert max-w-none space-y-6 font-serif text-cream/60 leading-relaxed">
          <section>
            <h2 className="font-display text-xl text-cream mb-3">Estimasi Pengiriman</h2>
            <p>
              Estimasi waktu tiba bervariasi tergantung kurir dan lokasi tujuan — biasanya 1–5 hari kerja
              untuk pengiriman reguler, dan lebih cepat untuk layanan ekspres atau same-day (tersedia di
              area Jabodetabek). Estimasi pasti ditampilkan saat kamu memilih kurir di halaman checkout.
            </p>
          </section>
          <section>
            <h2 className="font-display text-xl text-cream mb-3">Keterlambatan</h2>
            <p>
              CRUISER tidak bertanggung jawab atas keterlambatan yang disebabkan oleh pihak kurir, cuaca,
              atau kondisi di luar kendali kami. Jika pesanan kamu terlambat lebih dari estimasi, silakan
              hubungi tim kami untuk bantuan pelacakan.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
