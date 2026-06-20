'use client'

import { useState, useCallback, useRef, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { Phone, MapPin, Search, X, Loader2, CheckCircle2 } from 'lucide-react'
import type { BiteshipArea } from '@/lib/biteship'
import toast from 'react-hot-toast'

function CompleteProfileForm() {
  const router = useRouter()
  const { update } = useSession()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') ?? '/account'

  const [loading, setLoading] = useState(false)
  const [phone, setPhone] = useState('')
  const [street, setStreet] = useState('')
  const [areaQuery, setAreaQuery] = useState('')
  const [areaResults, setAreaResults] = useState<BiteshipArea[]>([])
  const [selectedArea, setSelectedArea] = useState<BiteshipArea | null>(null)
  const [searchingArea, setSearchingArea] = useState(false)
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleAreaSearch = useCallback((q: string) => {
    setAreaQuery(q)
    setSelectedArea(null)
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    if (q.length < 3) { setAreaResults([]); return }
    searchTimeout.current = setTimeout(async () => {
      setSearchingArea(true)
      try {
        const res = await fetch(`/api/shipping/areas?q=${encodeURIComponent(q)}`)
        const data = await res.json() as { areas: BiteshipArea[] }
        setAreaResults(data.areas ?? [])
      } catch { setAreaResults([]) }
      finally { setSearchingArea(false) }
    }, 400)
  }, [])

  function selectArea(area: BiteshipArea) {
    setSelectedArea(area)
    setAreaQuery('')
    setAreaResults([])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!phone.trim() || phone.trim().length < 9) { toast.error('Masukkan nomor HP yang valid'); return }
    if (!street.trim()) { toast.error('Masukkan alamat lengkap'); return }
    if (!selectedArea) { toast.error('Pilih kota / kecamatan'); return }

    setLoading(true)
    try {
      const res = await fetch('/api/account/complete-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phone.trim(),
          address: street.trim(),
          city: selectedArea.administrative_division_level_2_name,
          province: selectedArea.administrative_division_level_1_name,
          postalCode: selectedArea.postal_code,
        }),
      })
      if (!res.ok) throw new Error('Gagal menyimpan')

      await update({ profileComplete: true })
      toast.success('Profil lengkap! Selamat datang di CRUISER 🎉')
      router.push(callbackUrl)
      router.refresh()
    } catch {
      toast.error('Gagal menyimpan data. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left visual */}
      <div className="hidden lg:block flex-1 relative overflow-hidden">
        <Image src="/images/eternity-splash.png" alt="CRUISER" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-r from-obsidian/30 to-obsidian/70" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12">
          <p className="font-sans text-xs tracking-[0.5em] uppercase text-gold/80 mb-4">Hampir selesai</p>
          <h1 className="font-display text-6xl text-gold-gradient mb-4">CRUISER</h1>
          <p className="font-serif italic text-cream/70 text-xl">&ldquo;Satu langkah lagi.&rdquo;</p>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 max-w-md mx-auto flex flex-col items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-sm"
        >
          <div className="text-center mb-8">
            <Link href="/" className="font-display text-3xl tracking-[0.3em] text-gold">CRUISER</Link>
            <p className="font-sans text-xs tracking-widest uppercase text-cream/30 mt-2">Lengkapi Profil Kamu</p>
            <p className="font-sans text-sm text-cream/50 mt-3">
              Sebelum lanjut, lengkapi nomor HP dan alamat pengiriman supaya pesanan kamu bisa diproses dengan cepat.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Phone */}
            <div>
              <label className="font-sans text-[11px] tracking-widest uppercase text-cream/40 block mb-1.5">Nomor HP *</label>
              <div className="relative">
                <Phone size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cream/25 pointer-events-none" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="08xxxxxxxxxx"
                  className="w-full bg-white/[0.04] border border-white/10 focus:border-gold/50 outline-none pl-9 pr-4 py-3 font-sans text-sm text-cream placeholder:text-cream/20 transition-colors"
                  required
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="font-sans text-[11px] tracking-widest uppercase text-cream/40 block mb-1.5">Alamat Lengkap *</label>
              <textarea
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                rows={2}
                placeholder="Nama jalan, nomor rumah, RT/RW..."
                className="w-full bg-white/[0.04] border border-white/10 focus:border-gold/50 outline-none px-4 py-3 font-sans text-sm text-cream placeholder:text-cream/20 transition-colors resize-none"
                required
              />
            </div>

            {/* Area search */}
            <div>
              <label className="font-sans text-[11px] tracking-widest uppercase text-cream/40 block mb-1.5">Kota / Kecamatan *</label>
              {selectedArea ? (
                <div className="border border-gold/30 bg-gold/5 px-3 py-2.5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <CheckCircle2 size={14} className="text-gold flex-shrink-0" />
                    <div>
                      <p className="font-sans text-sm text-cream truncate">{selectedArea.administrative_division_level_3_name}, {selectedArea.administrative_division_level_2_name}</p>
                      <p className="font-sans text-xs text-cream/35">{selectedArea.administrative_division_level_1_name} · {selectedArea.postal_code}</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => { setSelectedArea(null); setAreaQuery('') }} className="text-cream/30 hover:text-cream flex-shrink-0">
                    <X size={13} />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cream/25 pointer-events-none" />
                  <input
                    type="text"
                    value={areaQuery}
                    onChange={(e) => handleAreaSearch(e.target.value)}
                    placeholder="Cari kecamatan atau kode pos..."
                    className="w-full bg-white/[0.04] border border-white/10 focus:border-gold/50 outline-none pl-9 pr-9 py-3 font-sans text-sm text-cream placeholder:text-cream/20 transition-colors"
                  />
                  {searchingArea && <Loader2 size={13} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-cream/25 animate-spin" />}
                  {areaResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 z-50 border border-white/10 border-t-0 bg-[#111] max-h-44 overflow-y-auto">
                      {areaResults.map((area) => (
                        <button key={area.id} type="button" onClick={() => selectArea(area)}
                          className="w-full text-left px-3 py-2.5 hover:bg-white/5 border-b border-white/[0.04] last:border-0 flex items-start gap-2">
                          <MapPin size={12} className="text-cream/20 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-sans text-sm text-cream">{area.administrative_division_level_3_name}</p>
                            <p className="font-sans text-xs text-cream/35">{area.administrative_division_level_2_name} · {area.postal_code}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-luxury w-full py-3.5 mt-2 flex items-center justify-center gap-2 font-sans text-sm tracking-widest disabled:opacity-60"
            >
              {loading ? <><Loader2 size={14} className="animate-spin" /> Menyimpan...</> : 'Simpan & Lanjutkan'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  )
}

export default function CompleteProfilePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-obsidian" />}>
      <CompleteProfileForm />
    </Suspense>
  )
}
