'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Instagram, Mail, MessageCircle } from 'lucide-react'
import { SITE } from '@/lib/constants'

const SHOP_LINKS = [
  { href: '/shop', label: 'All Products' },
  { href: '/shop?filter=bestseller', label: 'Bestsellers' },
  { href: '/shop?filter=new', label: 'New Arrivals' },
  { href: '/products/eternity', label: 'Eternity' },
  { href: '/products/noctis', label: 'Noctis' },
  { href: '/products/liberea', label: 'Liberea' },
]

const HELP_LINKS = [
  { href: '/faq', label: 'FAQ' },
  { href: '/shipping', label: 'Shipping Info' },
  { href: '/returns', label: 'Returns & Exchanges' },
  { href: '/track-order', label: 'Track Order' },
  { href: '/contact', label: 'Contact Us' },
]

const LEGAL_LINKS = [
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/terms', label: 'Terms of Service' },
]

export function Footer() {
  const pathname = usePathname()
  const [shopeeUrl, setShopeeUrl] = useState<string>(SITE.shopee)

  useEffect(() => {
    fetch('/api/site-status')
      .then((res) => res.json())
      .then((data: { shopee?: string | null }) => {
        if (data.shopee) setShopeeUrl(data.shopee)
      })
      .catch(() => {})
  }, [])

  if (pathname.startsWith('/admin')) return null

  return (
    <footer className="bg-obsidian-2 border-t border-white/[0.06] mt-24">
      {/* CTA Band */}
      <div className="border-b border-white/[0.06] py-16 text-center">
        <div className="ornament mb-8">
          <span className="text-gold text-xs">◆</span>
        </div>
        <p className="label-gold mx-auto w-fit mb-6">Newsletter</p>
        <h3 className="font-display text-3xl md:text-4xl text-cream mb-4">
          Stay in the Luxury Circle
        </h3>
        <p className="font-serif text-cream/60 mb-8 max-w-md mx-auto">
          Dapatkan update koleksi terbaru, promo eksklusif, dan cerita di balik setiap wangi CRUISER.
        </p>
        <form action="/api/newsletter" method="POST" className="flex gap-0 max-w-sm mx-auto">
          <input
            type="email"
            name="email"
            required
            placeholder="Email kamu"
            className="input-luxury flex-1 border-r-0"
          />
          <button
            type="submit"
            className="btn-luxury whitespace-nowrap px-6"
          >
            Subscribe
          </button>
        </form>
      </div>

      {/* Main footer */}
      <div className="container max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="block mb-4">
              <span className="font-display text-2xl tracking-[0.3em] text-gold">CRUISER</span>
            </Link>
            <p className="font-serif italic text-cream/50 text-sm mb-6">
              &ldquo;Luxury in Every Note.&rdquo;
            </p>
            <p className="font-sans text-xs text-cream/40 leading-relaxed mb-6">
              Extrait De Parfum premium Indonesia. Crafted with the world&rsquo;s finest ingredients.
              Est. 2026.
            </p>
            <div className="flex gap-4">
              <a
                href={SITE.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 border border-white/10 flex items-center justify-center text-cream/40 hover:text-gold hover:border-gold/40 transition-all duration-300"
                aria-label="Instagram"
              >
                <Instagram size={15} />
              </a>
              <a
                href={`mailto:${SITE.email}`}
                className="w-9 h-9 border border-white/10 flex items-center justify-center text-cream/40 hover:text-gold hover:border-gold/40 transition-all duration-300"
                aria-label="Email"
              >
                <Mail size={15} />
              </a>
              <a
                href={SITE.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 border border-white/10 flex items-center justify-center text-cream/40 hover:text-gold hover:border-gold/40 transition-all duration-300"
                aria-label="WhatsApp"
              >
                <MessageCircle size={15} />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-sans text-xs tracking-[0.25em] uppercase text-gold mb-6">
              Collection
            </h4>
            <ul className="space-y-3">
              {SHOP_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-sans text-xs text-cream/50 hover:text-cream transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="font-sans text-xs tracking-[0.25em] uppercase text-gold mb-6">
              Support
            </h4>
            <ul className="space-y-3">
              {HELP_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-sans text-xs text-cream/50 hover:text-cream transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-sans text-xs tracking-[0.25em] uppercase text-gold mb-6">
              Contact
            </h4>
            <div className="space-y-4 font-sans text-xs text-cream/50">
              <div>
                <p className="text-cream/30 mb-1">Instagram</p>
                <a
                  href={SITE.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cream transition-colors"
                >
                  @cruiser.official
                </a>
              </div>
              <div>
                <p className="text-cream/30 mb-1">Email</p>
                <a href={`mailto:${SITE.email}`} className="hover:text-cream transition-colors">
                  {SITE.email}
                </a>
              </div>
              <div>
                <p className="text-cream/30 mb-1">WhatsApp</p>
                <a
                  href={SITE.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cream transition-colors"
                >
                  Chat with us
                </a>
              </div>
              <div className="pt-2">
                <p className="text-cream/30 mb-1">Also available at</p>
                <a
                  href={shopeeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cream transition-colors"
                >
                  Shopee Official Store
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/[0.06] py-6">
        <div className="container max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-sans text-xs text-cream/30">
            &copy; 2026 CRUISER. All rights reserved.
          </p>
          <div className="flex gap-6">
            {LEGAL_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-sans text-xs text-cream/30 hover:text-cream/60 transition-colors duration-300"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <p className="font-sans text-xs text-cream/20">
            Luxury in Every Note. ◆ est. 2026
          </p>
        </div>
      </div>
    </footer>
  )
}
