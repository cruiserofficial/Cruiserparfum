import Link from 'next/link'
import { Home, ShoppingBag } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <p className="font-sans text-xs tracking-[0.5em] uppercase text-gold/60 mb-6">
        404 — Not Found
      </p>
      <h1 className="font-display text-[clamp(4rem,15vw,10rem)] leading-none text-gold/10 mb-6">
        404
      </h1>
      <h2 className="font-display text-3xl text-cream mb-4">
        This Page Has Faded
      </h2>
      <p className="font-serif text-cream/50 text-lg mb-12 max-w-md">
        Like a whisper of scent that lingers just out of reach, the page you&apos;re looking for
        has drifted away.
      </p>
      <div className="flex gap-4 flex-wrap justify-center">
        <Link href="/" className="btn-luxury flex items-center gap-2">
          <Home size={16} />
          Go Home
        </Link>
        <Link href="/shop" className="btn-luxury-outline flex items-center gap-2">
          <ShoppingBag size={16} />
          Shop Collection
        </Link>
      </div>
    </div>
  )
}
