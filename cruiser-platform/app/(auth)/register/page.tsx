'use client'

import { useState, useCallback, useRef, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn, useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Mail, Lock, Eye, EyeOff, MapPin, Search, X, Loader2, CheckCircle2, Chrome, Phone } from 'lucide-react'
import type { BiteshipArea } from '@/lib/biteship'
import toast from 'react-hot-toast'

function RegisterForm() {
  const router = useRouter()
  const { update } = useSession()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') ?? '/'

  const [step, setStep] = useState<1 | 2>(1)
  const [loading, setLoading] = useState(false)
  const [checkingEmail, setCheckingEmail] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  // Step 1 — Info akun
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')

  // Step 2 — Alamat (opsional)
  const [phone, setPhone] = useState('')
  const [street, setStreet] = useState('')
  const [areaQuery, setAreaQuery] = useState('')
  const [areaResults, setAreaResults] = useState<BiteshipArea[]>([])
  const [selectedArea, setSelectedArea] = useState<BiteshipArea | null>(null)
  const [searchingArea, setSearchingArea] = useState(false)
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Area search
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
    setAreaQuery(`${area.administrative_division_level_3_name}, ${area.administrative_division_level_2_name}`)
    setAreaResults([])
  }

  // Step 1 → Step 2
  async function handleStep1(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { toast.error('Masukkan nama lengkap'); return }
    if (!email.trim() || !email.includes('@')) { toast.error('Email tidak valid'); return }
    if (password.length < 6) { toast.error('Password minimal 6 karakter'); return }
    if (password !== confirm) { toast.error('Password tidak cocok'); return }

    setCheckingEmail(true)
    try {
      const res = await fetch(`/api/account/check-email?email=${encodeURIComponent(email.trim())}`)
      const data = await res.json() as { exists: boolean }
      if (data.exists) {
        toast.error('Email ini sudah terdaftar. Silakan login.')
        return
      }
    } catch {
      // Fail open — let the server-side authorize() catch a true duplicate
    } finally {
      setCheckingEmail(false)
    }
    setStep(2)
  }

  async function handleFinish() {
    setLoading(true)
    try {
      const result = await signIn('credentials', {
        email,
        password,
        name,
        isNew: 'true',
        callbackUrl,
        redirect: false,
      })

      if (!result?.ok) {
        toast.error('Gagal membuat akun. Coba lagi.')
        return
      }

      // Jika alamat lengkap diisi, simpan ke DB sekaligus jadi profil yang
      // bisa dipakai otomatis nanti di checkout — tanpa ini, address yang
      // diisi di sini sebelumnya cuma tersimpan di localStorage dan hilang.
      if (phone.trim() && street.trim() && selectedArea) {
        try {
          await fetch('/api/account/complete-profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              phone: phone.trim(),
              address: street.trim(),
              district: selectedArea.administrative_division_level_3_name,
              city: selectedArea.administrative_division_level_2_name,
              province: selectedArea.administrative_division_level_1_name,
              postalCode: selectedArea.postal_code,
              areaId: selectedArea.id,
            }),
          })
          await update({ profileComplete: true })
        } catch {
          // Non-fatal — the mandatory /complete-profile gate will catch it later
        }
      }

      toast.success(`Selamat datang, ${name.split(' ')[0]}! 🎉`)
      router.push(callbackUrl)
      router.refresh()
    } catch {
      toast.error('Terjadi kesalahan. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleSignIn() {
    await signIn('google', { callbackUrl })
  }

  return (
    <div className="min-h-screen flex">
      {/* Left visual */}
      <div className="hidden lg:block flex-1 relative overflow-hidden">
        <Image src="/images/noctis-splash.png" alt="CRUISER" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-r from-obsidian/30 to-obsidian/70" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12">
          <p className="font-sans text-xs tracking-[0.5em] uppercase text-gold/80 mb-4">est. 2026 · Extrait De Parfum</p>
          <h1 className="font-display text-6xl text-gold-gradient mb-4">CRUISER</h1>
          <p className="font-serif italic text-cream/70 text-xl">&ldquo;Luxury in Every Note.&rdquo;</p>
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
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="font-display text-3xl tracking-[0.3em] text-gold">CRUISER</Link>
            <p className="font-sans text-xs tracking-widest uppercase text-cream/30 mt-2">Buat Akun Baru</p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-3 mb-8">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-3">
                <div className={`w-6 h-6 flex items-center justify-center text-[10px] font-sans font-medium transition-all ${
                  s < step ? 'bg-gold text-obsidian' : s === step ? 'border border-gold text-gold' : 'border border-white/20 text-cream/20'
                }`}>
                  {s < step ? '✓' : s}
                </div>
                <span className={`font-sans text-[10px] tracking-widest uppercase ${s === step ? 'text-cream/60' : 'text-cream/20'}`}>
                  {s === 1 ? 'Akun' : 'Alamat'}
                </span>
                {s < 2 && <div className={`w-8 h-px ${step > 1 ? 'bg-gold/40' : 'bg-white/10'}`} />}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">

            {/* Step 1: Info akun */}
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                {/* Google */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="w-full flex items-center justify-center gap-3 py-3.5 border border-white/10 text-cream/70 hover:text-cream hover:border-white/20 transition-all font-sans text-sm mb-5"
                >
                  <Chrome size={17} />
                  Daftar dengan Google
                </button>

                <div className="flex items-center gap-3 mb-5">
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="font-sans text-xs text-cream/20">atau isi manual</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>

                <form onSubmit={handleStep1} className="space-y-3">
                  {/* Nama */}
                  <div>
                    <label className="font-sans text-[11px] tracking-widest uppercase text-cream/40 block mb-1.5">Nama Lengkap</label>
                    <div className="relative">
                      <User size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cream/25 pointer-events-none" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Nama lengkap kamu"
                        className="w-full bg-white/[0.04] border border-white/10 focus:border-gold/50 outline-none pl-9 pr-4 py-3 font-sans text-sm text-cream placeholder:text-cream/20 transition-colors"
                        required
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="font-sans text-[11px] tracking-widest uppercase text-cream/40 block mb-1.5">Email</label>
                    <div className="relative">
                      <Mail size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cream/25 pointer-events-none" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="contoh@email.com"
                        className="w-full bg-white/[0.04] border border-white/10 focus:border-gold/50 outline-none pl-9 pr-4 py-3 font-sans text-sm text-cream placeholder:text-cream/20 transition-colors"
                        required
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="font-sans text-[11px] tracking-widest uppercase text-cream/40 block mb-1.5">Password</label>
                    <div className="relative">
                      <Lock size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cream/25 pointer-events-none" />
                      <input
                        type={showPass ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min. 6 karakter"
                        className="w-full bg-white/[0.04] border border-white/10 focus:border-gold/50 outline-none pl-9 pr-10 py-3 font-sans text-sm text-cream placeholder:text-cream/20 transition-colors"
                        required
                      />
                      <button type="button" onClick={() => setShowPass((v) => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-cream/25 hover:text-cream/60">
                        {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  {/* Konfirmasi */}
                  <div>
                    <label className="font-sans text-[11px] tracking-widest uppercase text-cream/40 block mb-1.5">Konfirmasi Password</label>
                    <div className="relative">
                      <Lock size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cream/25 pointer-events-none" />
                      <input
                        type={showConfirm ? 'text' : 'password'}
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        placeholder="Ulangi password"
                        className={`w-full bg-white/[0.04] border focus:border-gold/50 outline-none pl-9 pr-10 py-3 font-sans text-sm text-cream placeholder:text-cream/20 transition-colors ${
                          confirm && confirm !== password ? 'border-red-400/40' : 'border-white/10'
                        }`}
                        required
                      />
                      <button type="button" onClick={() => setShowConfirm((v) => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-cream/25 hover:text-cream/60">
                        {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                    {confirm && confirm !== password && (
                      <p className="font-sans text-[11px] text-red-400 mt-1">Password tidak cocok</p>
                    )}
                  </div>

                  <button type="submit" disabled={checkingEmail} className="btn-luxury w-full py-3.5 mt-2 font-sans text-sm tracking-widest disabled:opacity-60 flex items-center justify-center gap-2">
                    {checkingEmail && <Loader2 size={14} className="animate-spin" />}
                    Lanjut →
                  </button>
                </form>

                <p className="text-center font-sans text-xs text-cream/30 mt-5">
                  Sudah punya akun?{' '}
                  <Link href="/login" className="text-gold/70 hover:text-gold transition-colors">Masuk di sini</Link>
                </p>
              </motion.div>
            )}

            {/* Step 2: Alamat */}
            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <div className="text-center mb-2">
                  <p className="font-sans text-xs text-cream/40">Halo, <span className="text-cream">{name}</span>! 👋</p>
                  <p className="font-sans text-xs text-cream/30 mt-1">Isi alamat pengiriman utama kamu (opsional)</p>
                </div>

                {/* Nomor HP */}
                <div>
                  <label className="font-sans text-[11px] tracking-widest uppercase text-cream/40 block mb-1.5">Nomor HP</label>
                  <div className="relative">
                    <Phone size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cream/25 pointer-events-none" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="08xxxxxxxxxx"
                      className="w-full bg-white/[0.04] border border-white/10 focus:border-gold/50 outline-none pl-9 pr-4 py-3 font-sans text-sm text-cream placeholder:text-cream/20 transition-colors"
                    />
                  </div>
                </div>

                {/* Detail jalan */}
                <div>
                  <label className="font-sans text-[11px] tracking-widest uppercase text-cream/40 block mb-1.5">Alamat Lengkap</label>
                  <textarea
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    rows={2}
                    placeholder="Nama jalan, nomor rumah, RT/RW..."
                    className="w-full bg-white/[0.04] border border-white/10 focus:border-gold/50 outline-none px-4 py-3 font-sans text-sm text-cream placeholder:text-cream/20 transition-colors resize-none"
                  />
                </div>

                {/* Area search */}
                <div>
                  <label className="font-sans text-[11px] tracking-widest uppercase text-cream/40 block mb-1.5">Kota / Kecamatan</label>
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

                {/* Kode pos auto */}
                {selectedArea && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-sans text-[11px] tracking-widest uppercase text-cream/40 block mb-1.5">Kota</label>
                      <div className="bg-white/[0.02] border border-white/[0.06] px-3 py-2.5 font-sans text-sm text-cream/50">{selectedArea.administrative_division_level_2_name}</div>
                    </div>
                    <div>
                      <label className="font-sans text-[11px] tracking-widest uppercase text-cream/40 block mb-1.5">Kode Pos</label>
                      <div className="bg-white/[0.02] border border-white/[0.06] px-3 py-2.5 font-sans text-sm text-cream/50">{selectedArea.postal_code}</div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setStep(1)} className="flex-1 py-3 border border-white/10 text-cream/40 hover:text-cream hover:border-white/20 transition-all font-sans text-sm">
                    ← Kembali
                  </button>
                  <button type="button" onClick={handleFinish} disabled={loading} className="flex-2 flex-grow btn-luxury py-3 flex items-center justify-center gap-2 font-sans text-sm tracking-widest disabled:opacity-60">
                    {loading ? <><Loader2 size={14} className="animate-spin" /> Membuat akun...</> : 'Buat Akun ✓'}
                  </button>
                </div>

                <button type="button" onClick={handleFinish} disabled={loading} className="w-full font-sans text-xs text-cream/25 hover:text-cream/50 transition-colors">
                  Lewati, isi alamat nanti
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-obsidian" />}>
      <RegisterForm />
    </Suspense>
  )
}
