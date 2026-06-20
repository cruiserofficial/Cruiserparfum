import type { Metadata } from 'next'
import { Sparkles } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Sedang Maintenance',
  robots: { index: false, follow: false },
}

export default function MaintenancePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <Sparkles size={28} className="text-gold/60 mb-6" />
      <p className="font-sans text-xs tracking-[0.5em] uppercase text-gold/60 mb-6">
        Sedang Maintenance
      </p>
      <h1 className="font-display text-[clamp(2rem,6vw,3.5rem)] text-cream mb-4">
        Kami Akan Segera Kembali
      </h1>
      <p className="font-serif text-cream/50 text-lg max-w-md">
        Situs CRUISER sedang dalam perbaikan singkat. Silakan kembali beberapa saat lagi.
      </p>
    </div>
  )
}
