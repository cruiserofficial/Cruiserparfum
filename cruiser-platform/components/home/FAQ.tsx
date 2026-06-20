'use client'

import { motion, useInView, AnimatePresence } from 'framer-motion'
import { useRef, useState } from 'react'
import { Plus, Minus } from 'lucide-react'

const FAQS = [
  {
    q: 'Apa perbedaan Extrait De Parfum dengan EDP atau EDT?',
    a: 'Extrait De Parfum memiliki konsentrasi minyak wangi tertinggi (20-40%), jauh di atas Eau de Parfum (15-20%) dan Eau de Toilette (5-15%). Ini berarti wanginya lebih kuat, lebih kompleks, dan bertahan jauh lebih lama — biasanya 12-24 jam atau lebih.',
  },
  {
    q: 'Berapa lama wangi CRUISER bertahan di kulit?',
    a: 'Sebagai Extrait De Parfum, koleksi CRUISER dirancang untuk bertahan 12-24 jam di kulit. Ketahanan wangi bisa bervariasi tergantung jenis kulit, kelembaban, dan cara penggunaan.',
  },
  {
    q: 'Bagaimana cara memesan produk CRUISER?',
    a: 'Kamu bisa memesan langsung di website ini dengan pilihan pembayaran QRIS, transfer bank, kartu kredit, atau COD. Kami juga tersedia di Shopee Official Store untuk kemudahan berbelanja.',
  },
  {
    q: 'Berapa lama pengiriman ke seluruh Indonesia?',
    a: 'Pengiriman reguler membutuhkan 3-5 hari kerja. Kami juga menawarkan layanan ekspres (1-2 hari) dan same-day delivery untuk area Jabodetabek. Semua pesanan dikemas dengan kemasan premium.',
  },
  {
    q: 'Apakah CRUISER menerima return atau penukaran produk?',
    a: 'Kami menerima return dalam 7 hari setelah produk diterima jika produk dalam kondisi rusak atau tidak sesuai pesanan. Karena sifat produk parfum, return hanya berlaku untuk produk yang belum dibuka segelnya.',
  },
  {
    q: 'Apakah ada promo bundle atau diskon?',
    a: 'Ya! Kami secara rutin mengadakan promo Mix Bundle — dapatkan ketiga varian sekaligus dengan harga spesial. Daftar newsletter kami untuk mendapatkan info promo terbaru lebih awal.',
  },
  {
    q: 'Berapa volume per botol dan berapa spray yang didapat?',
    a: 'Setiap botol berisi 50ml (1.70 fl oz). Dengan konsentrasi Extrait De Parfum, disarankan 2-3 semprotan saja untuk mendapatkan sillage yang optimal. Satu botol bisa bertahan 3-6 bulan tergantung pemakaian.',
  },
]

function FAQItem({ faq, index }: { faq: typeof FAQS[0]; index: number }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-b border-white/[0.06]">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between py-5 text-left group"
      >
        <span className="font-sans text-sm font-medium text-cream/80 group-hover:text-cream transition-colors pr-8">
          {faq.q}
        </span>
        <span className="flex-shrink-0 w-7 h-7 border border-gold/30 flex items-center justify-center text-gold/60 group-hover:border-gold/60 group-hover:text-gold transition-all duration-300">
          {open ? <Minus size={14} /> : <Plus size={14} />}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="overflow-hidden"
          >
            <p className="font-serif text-cream/55 text-sm leading-relaxed pb-5 pr-10">
              {faq.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function FAQ() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="py-24 md:py-32" id="faq">
      <div className="container max-w-3xl mx-auto px-6" ref={ref}>
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            className="label-gold mx-auto w-fit mb-6"
          >
            FAQ
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="font-display text-[clamp(2rem,4vw,3rem)] text-cream"
          >
            Pertanyaan Umum
          </motion.h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          {FAQS.map((faq, i) => (
            <FAQItem key={i} faq={faq} index={i} />
          ))}
        </motion.div>
      </div>
    </section>
  )
}
