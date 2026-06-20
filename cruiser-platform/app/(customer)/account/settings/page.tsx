'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, User, Mail, LogOut, Save, Bell, Shield } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AccountSettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [displayName, setDisplayName] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/account/settings')
      return
    }
    if (session?.user?.name) {
      const stored = typeof window !== 'undefined'
        ? localStorage.getItem('cruiser_display_name')
        : null
      setDisplayName(stored ?? session.user.name)
    }
  }, [session, status, router])

  function handleSave() {
    if (!displayName.trim()) { toast.error('Nama tidak boleh kosong'); return }
    localStorage.setItem('cruiser_display_name', displayName.trim())
    setSaved(true)
    toast.success('Pengaturan disimpan!')
    setTimeout(() => setSaved(false), 2000)
  }

  async function handleSignOut() {
    await signOut({ callbackUrl: '/' })
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="font-display text-cream/20">Memuat...</div>
      </div>
    )
  }

  if (!session) return null

  const initials = (session.user.name ?? session.user.email ?? '?')[0].toUpperCase()

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container max-w-2xl mx-auto px-6">
        <Link href="/account" className="flex items-center gap-2 font-sans text-xs text-cream/40 hover:text-cream transition-colors mb-8">
          <ArrowLeft size={13} /> Kembali ke akun
        </Link>

        <h1 className="font-display text-3xl text-cream mb-8">Pengaturan</h1>

        {/* Profile */}
        <div className="glass p-6 mb-4">
          <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-white/[0.06]">
            <User size={14} className="text-gold/60" />
            <h2 className="font-sans text-[10px] tracking-widest uppercase text-cream/50">Profil</h2>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0">
              <span className="font-display text-xl text-gold">{initials}</span>
            </div>
            <div>
              <p className="font-sans text-sm text-cream">{session.user.name ?? 'Cruiser Member'}</p>
              <p className="font-sans text-xs text-cream/40">{session.user.email}</p>
              {session.user.image && (
                <p className="font-sans text-[10px] text-gold/40 mt-0.5">Masuk via Google</p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="font-sans text-[10px] tracking-widest uppercase text-cream/40 block mb-1.5">
                Nama Tampilan
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                placeholder="Nama kamu"
                className="input-luxury w-full text-sm"
              />
            </div>

            <div>
              <label className="font-sans text-[10px] tracking-widest uppercase text-cream/40 block mb-1.5">
                Email
              </label>
              <div className="flex items-center gap-2 bg-white/[0.02] border border-white/[0.06] px-4 py-3">
                <Mail size={13} className="text-cream/20 flex-shrink-0" />
                <p className="font-sans text-sm text-cream/50">{session.user.email}</p>
                <span className="ml-auto font-sans text-[9px] tracking-widest uppercase text-cream/20">Tidak dapat diubah</span>
              </div>
            </div>

            <button
              onClick={handleSave}
              className="btn-luxury flex items-center gap-2 px-5 py-2.5 text-xs"
            >
              <Save size={13} />
              {saved ? 'Disimpan!' : 'Simpan Perubahan'}
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="glass p-6 mb-4">
          <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-white/[0.06]">
            <Bell size={14} className="text-gold/60" />
            <h2 className="font-sans text-[10px] tracking-widest uppercase text-cream/50">Notifikasi</h2>
          </div>
          <p className="font-sans text-sm text-cream/30 italic">Pengaturan notifikasi akan tersedia segera.</p>
        </div>

        {/* Security */}
        <div className="glass p-6 mb-6">
          <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-white/[0.06]">
            <Shield size={14} className="text-gold/60" />
            <h2 className="font-sans text-[10px] tracking-widest uppercase text-cream/50">Keamanan</h2>
          </div>
          <p className="font-sans text-xs text-cream/30 mb-4">
            {session.user.image
              ? 'Akun ini masuk menggunakan Google. Password dikelola oleh Google.'
              : 'Untuk mengubah password, silakan hubungi kami melalui WhatsApp atau email.'}
          </p>
          <a
            href="mailto:cruiser.official1@gmail.com?subject=Ubah Password - CRUISER"
            className="font-sans text-xs text-gold/50 hover:text-gold transition-colors"
          >
            Minta ubah password →
          </a>
        </div>

        {/* Sign Out */}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 border border-red-400/20 text-red-400/60 hover:border-red-400/40 hover:text-red-400 transition-all py-3 font-sans text-sm"
        >
          <LogOut size={14} />
          Keluar dari Akun
        </button>
      </div>
    </div>
  )
}
