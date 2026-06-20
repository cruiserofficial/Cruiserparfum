'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Save, Upload, X, ImageIcon, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'

interface PopupConfig {
  enabled: boolean
  imageUrl: string
  title: string
  subtitle: string
  linkUrl: string
  buttonText: string
}

const DEFAULT_POPUP: PopupConfig = {
  enabled: false,
  imageUrl: '',
  title: '',
  subtitle: '',
  linkUrl: '/shop',
  buttonText: '',
}

export default function AdminBannersPage() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [popup, setPopup] = useState<PopupConfig>(DEFAULT_POPUP)
  const [loaded, setLoaded] = useState(false)
  const [saving, setSaving] = useState(false)

  const loadSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/settings')
      if (!res.ok) return
      const { settings } = await res.json()
      if (settings.popup_banner) {
        setPopup({ ...DEFAULT_POPUP, ...(settings.popup_banner as Partial<PopupConfig>) })
      }
    } catch {
      // not critical
    } finally {
      setLoaded(true)
    }
  }, [])

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  function update<K extends keyof PopupConfig>(key: K, value: PopupConfig[K]) {
    setPopup((prev) => ({ ...prev, [key]: value }))
  }

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { toast.error('File harus berupa gambar'); return }
    if (file.size > 3 * 1024 * 1024) { toast.error('Ukuran gambar maks. 3MB'); return }
    const reader = new FileReader()
    reader.onload = (ev) => {
      const result = ev.target?.result as string
      update('imageUrl', result)
    }
    reader.readAsDataURL(file)
  }

  function removeImage() {
    update('imageUrl', '')
  }

  async function handleSave() {
    if (popup.enabled && !popup.imageUrl) {
      toast.error('Upload gambar dulu sebelum mengaktifkan popup')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ popup_banner: popup }),
      })
      if (!res.ok) throw new Error('Failed')
      toast.success('Popup banner disimpan!')
    } catch {
      toast.error('Gagal menyimpan popup banner')
    } finally {
      setSaving(false)
    }
  }

  if (!loaded) return null

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-cream">Pop-up Iklan</h1>
          <p className="font-sans text-xs text-cream/40 mt-1">
            Gambar promo yang muncul otomatis saat pengunjung baru masuk ke situs
          </p>
        </div>
        <a
          href="/"
          target="_blank"
          className="flex items-center gap-1.5 font-sans text-[10px] tracking-widest uppercase text-cream/40 hover:text-cream border border-white/10 hover:border-white/20 px-3 py-2 transition-all"
        >
          <ExternalLink size={11} /> Lihat di Situs
        </a>
      </div>

      {/* Enable toggle */}
      <div className="glass p-6 flex items-center justify-between">
        <div>
          <p className="font-sans text-sm text-cream">Aktifkan Pop-up</p>
          <p className="font-sans text-[10px] text-cream/30 mt-0.5">
            Tampilkan popup ini ke semua pengunjung baru di halaman manapun
          </p>
        </div>
        <button
          onClick={() => update('enabled', !popup.enabled)}
          className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${popup.enabled ? 'bg-gold' : 'bg-white/10'}`}
        >
          <span className={`absolute top-1 w-4 h-4 rounded-full bg-obsidian transition-all duration-300 ${popup.enabled ? 'left-7' : 'left-1'}`} />
        </button>
      </div>

      {/* Image upload */}
      <div className="glass p-6 space-y-4">
        <div className="flex items-center gap-2">
          <ImageIcon size={15} className="text-gold/70" />
          <h2 className="font-sans text-xs tracking-widest uppercase text-gold/70">Gambar Pop-up</h2>
        </div>

        {popup.imageUrl ? (
          <div className="flex flex-col items-start gap-4">
            <div className="relative border border-white/10 p-2 bg-white/[0.02]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={popup.imageUrl} alt="Popup preview" className="max-w-[260px] max-h-[260px] object-contain" />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 font-sans text-xs text-cream/50 hover:text-cream border border-white/10 hover:border-white/20 px-4 py-2 transition-all"
              >
                <Upload size={13} /> Ganti Gambar
              </button>
              <button
                onClick={removeImage}
                className="flex items-center gap-2 font-sans text-xs text-red-400/60 hover:text-red-400 border border-red-400/10 hover:border-red-400/30 px-4 py-2 transition-all"
              >
                <X size={13} /> Hapus
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full border border-dashed border-white/15 hover:border-gold/30 py-10 flex flex-col items-center gap-3 transition-all group"
          >
            <ImageIcon size={32} className="text-cream/15 group-hover:text-gold/30 transition-colors" />
            <div className="text-center">
              <p className="font-sans text-sm text-cream/30 group-hover:text-cream/50 transition-colors">Klik untuk upload gambar popup</p>
              <p className="font-sans text-xs text-cream/15 mt-1">JPG, PNG, atau WebP · Maks. 3MB · Disarankan persegi (1:1)</p>
            </div>
          </button>
        )}
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
      </div>

      {/* Text & link (optional) */}
      <div className="glass p-6 space-y-4">
        <h2 className="font-sans text-xs tracking-widest uppercase text-gold/70">Teks & Tombol (opsional)</h2>
        <p className="font-sans text-xs text-cream/30">
          Kosongkan kalau gambar popup sudah berisi semua info — judul/tombol tidak akan ditampilkan kalau kosong.
        </p>
        <div className="space-y-3">
          <div>
            <label className="font-sans text-[10px] tracking-widest uppercase text-cream/40 block mb-1.5">Judul</label>
            <input
              type="text"
              value={popup.title}
              onChange={(e) => update('title', e.target.value)}
              placeholder="mis. Diskon 20% Hari Ini!"
              className="input-luxury w-full text-sm"
            />
          </div>
          <div>
            <label className="font-sans text-[10px] tracking-widest uppercase text-cream/40 block mb-1.5">Subjudul</label>
            <input
              type="text"
              value={popup.subtitle}
              onChange={(e) => update('subtitle', e.target.value)}
              placeholder="mis. Khusus pembelian pertama"
              className="input-luxury w-full text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-sans text-[10px] tracking-widest uppercase text-cream/40 block mb-1.5">Teks Tombol</label>
              <input
                type="text"
                value={popup.buttonText}
                onChange={(e) => update('buttonText', e.target.value)}
                placeholder="mis. Belanja Sekarang"
                className="input-luxury w-full text-sm"
              />
            </div>
            <div>
              <label className="font-sans text-[10px] tracking-widest uppercase text-cream/40 block mb-1.5">Link Tombol</label>
              <input
                type="text"
                value={popup.linkUrl}
                onChange={(e) => update('linkUrl', e.target.value)}
                placeholder="/shop"
                className="input-luxury w-full text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="btn-luxury flex items-center gap-2 px-6 py-3 text-xs disabled:opacity-60"
      >
        <Save size={13} /> {saving ? 'Menyimpan...' : 'Simpan Pop-up'}
      </button>
    </div>
  )
}
