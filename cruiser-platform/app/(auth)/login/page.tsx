'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, Chrome, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') ?? '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) { toast.error('Isi email dan password'); return }
    setLoading(true)
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })
      if (result?.ok) {
        toast.success('Berhasil masuk!')
        router.push(callbackUrl)
        router.refresh()
      } else {
        toast.error('Email atau password salah')
      }
    } catch {
      toast.error('Terjadi kesalahan, coba lagi')
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
        <Image src="/images/hero-banner.png" alt="CRUISER" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-r from-obsidian/20 to-obsidian/60" />
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
          transition={{ duration: 0.7 }}
          className="w-full max-w-sm"
        >
          {/* Logo */}
          <div className="text-center mb-10">
            <Link href="/" className="font-display text-3xl tracking-[0.3em] text-gold">CRUISER</Link>
            <p className="font-sans text-xs tracking-widest uppercase text-cream/30 mt-2">Masuk ke akun kamu</p>
          </div>

          <div className="space-y-4">
            {/* Google */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 py-3.5 border border-white/10 text-cream/70 hover:text-cream hover:border-white/20 transition-all font-sans text-sm"
            >
              <Chrome size={17} />
              Masuk dengan Google
            </button>

            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-white/10" />
              <span className="font-sans text-xs text-cream/20">atau</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Email + Password form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Email */}
              <div>
                <label className="font-sans text-[11px] tracking-widest uppercase text-cream/40 block mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cream/25 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="contoh@email.com"
                    autoComplete="email"
                    className="w-full bg-white/[0.04] border border-white/10 focus:border-gold/50 outline-none pl-9 pr-4 py-3 font-sans text-sm text-cream placeholder:text-cream/20 transition-colors"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-sans text-[11px] tracking-widest uppercase text-cream/40">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <Lock size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cream/25 pointer-events-none" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Password kamu"
                    autoComplete="current-password"
                    className="w-full bg-white/[0.04] border border-white/10 focus:border-gold/50 outline-none pl-9 pr-10 py-3 font-sans text-sm text-cream placeholder:text-cream/20 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-cream/25 hover:text-cream/60 transition-colors"
                  >
                    {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-luxury w-full py-3.5 flex items-center justify-center gap-2 font-sans text-sm tracking-widest disabled:opacity-60 mt-1"
              >
                {loading ? (
                  <><Loader2 size={15} className="animate-spin" /> Memproses...</>
                ) : (
                  'Masuk'
                )}
              </button>
            </form>

            <p className="text-center font-sans text-xs text-cream/30 pt-2">
              Belum punya akun?{' '}
              <Link href="/register" className="text-gold/70 hover:text-gold transition-colors">
                Daftar sekarang
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-obsidian" />}>
      <LoginForm />
    </Suspense>
  )
}
