'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { X } from 'lucide-react'

interface PopupConfig {
  imageUrl: string
  title?: string
  subtitle?: string
  linkUrl?: string
  buttonText?: string
}

const DISMISS_KEY = 'cruiser_popup_dismissed'

export function PopupBanner() {
  const pathname = usePathname()
  const [popup, setPopup] = useState<PopupConfig | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem(DISMISS_KEY)) return

    fetch('/api/popup')
      .then((r) => r.json())
      .then((data: { popup: PopupConfig | null }) => {
        if (data.popup) {
          setPopup(data.popup)
          setTimeout(() => setVisible(true), 700)
        }
      })
      .catch(() => {})
  }, [])

  function dismiss() {
    setVisible(false)
    sessionStorage.setItem(DISMISS_KEY, '1')
  }

  if (pathname?.startsWith('/admin')) return null
  if (!popup || !visible) return null

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300"
      onClick={dismiss}
    >
      <div
        className="relative max-w-md w-full bg-obsidian border border-gold/20 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={dismiss}
          className="absolute -top-3 -right-3 w-8 h-8 bg-obsidian border border-white/20 rounded-full flex items-center justify-center text-cream/60 hover:text-cream hover:border-gold/40 transition-colors z-10"
          aria-label="Tutup"
        >
          <X size={16} />
        </button>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={popup.imageUrl} alt={popup.title ?? 'Promo CRUISER'} className="w-full h-auto block" />

        {(popup.title || popup.buttonText) && (
          <div className="p-6 text-center space-y-3">
            {popup.title && <h3 className="font-display text-xl text-cream">{popup.title}</h3>}
            {popup.subtitle && <p className="font-sans text-sm text-cream/50">{popup.subtitle}</p>}
            {popup.buttonText && (
              <Link
                href={popup.linkUrl || '/shop'}
                onClick={dismiss}
                className="btn-luxury inline-flex px-6 py-3 text-sm tracking-widest"
              >
                {popup.buttonText}
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
