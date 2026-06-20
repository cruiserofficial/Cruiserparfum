import type { Metadata } from 'next'
import { Mail, MessageCircle, Instagram, Clock } from 'lucide-react'
import { SITE } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Hubungi Kami — CRUISER Parfum',
}

const CHANNELS = [
  {
    icon: MessageCircle,
    label: 'WhatsApp',
    value: 'Chat langsung dengan tim kami',
    href: SITE.whatsapp,
    cta: 'Buka WhatsApp',
  },
  {
    icon: Mail,
    label: 'Email',
    value: SITE.email,
    href: `mailto:${SITE.email}`,
    cta: 'Kirim Email',
  },
  {
    icon: Instagram,
    label: 'Instagram',
    value: '@cruiser.official',
    href: SITE.instagram,
    cta: 'Kunjungi Instagram',
  },
]

export default function ContactPage() {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container max-w-3xl mx-auto px-6">
        <div className="py-12 border-b border-white/[0.06] mb-10 text-center">
          <p className="label-gold mx-auto w-fit mb-3">Kami Siap Membantu</p>
          <h1 className="font-display text-4xl text-cream mb-3">Hubungi Kami</h1>
          <p className="font-serif text-cream/50 max-w-md mx-auto">
            Ada pertanyaan soal produk, pesanan, atau kerjasama? Tim CRUISER siap membantu kamu.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          {CHANNELS.map(({ icon: Icon, label, value, href, cta }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="glass p-6 flex flex-col items-center text-center gap-3 hover:border-gold/30 transition-all duration-300 group"
            >
              <div className="w-12 h-12 bg-gold/5 border border-gold/10 flex items-center justify-center group-hover:bg-gold/10 transition-colors">
                <Icon size={20} className="text-gold/60 group-hover:text-gold transition-colors" />
              </div>
              <div>
                <p className="font-sans text-xs tracking-widest uppercase text-cream/40 mb-1">{label}</p>
                <p className="font-sans text-sm text-cream break-all">{value}</p>
              </div>
              <span className="font-sans text-[10px] tracking-widest uppercase text-gold/60 group-hover:text-gold transition-colors mt-1">
                {cta} →
              </span>
            </a>
          ))}
        </div>

        <div className="glass p-6 flex items-center gap-4">
          <Clock size={18} className="text-gold/60 flex-shrink-0" />
          <div>
            <p className="font-sans text-sm text-cream">Jam Operasional</p>
            <p className="font-sans text-xs text-cream/40 mt-0.5">Senin – Sabtu, 09:00 – 18:00 WIB</p>
          </div>
        </div>
      </div>
    </div>
  )
}
