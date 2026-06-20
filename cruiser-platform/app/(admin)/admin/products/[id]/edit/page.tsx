'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Plus, X, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'

interface ScentNote {
  name: string
  icon: string
  type: 'top' | 'heart' | 'base'
}

interface FormState {
  id: string
  name: string
  slug: string
  tagline: string
  description: string
  story: string
  price: number
  comparePrice: number
  sku: string
  stock: number
  volumeMl: number
  concentration: string
  colorAccent: string
  dna: string[]
  scentNotes: ScentNote[]
  isFeatured: boolean
  isBestseller: boolean
  isNew: boolean
  isActive: boolean
}

export default function ProductEditPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string

  const [form, setForm] = useState<FormState | null>(null)
  const [loading, setLoading] = useState(true)
  const [newDna, setNewDna] = useState('')
  const [newNote, setNewNote] = useState<ScentNote>({ name: '', icon: '', type: 'top' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/products/${productId}`)
        if (!res.ok) {
          toast.error('Produk tidak ditemukan')
          router.push('/admin/products')
          return
        }
        const { product } = await res.json()
        setForm({
          id: product.id,
          name: product.name,
          slug: product.slug,
          tagline: product.tagline ?? '',
          description: product.description ?? '',
          story: product.story ?? '',
          price: product.price,
          comparePrice: product.comparePrice ?? 0,
          sku: product.sku ?? '',
          stock: product.stock,
          volumeMl: product.volumeMl,
          concentration: product.concentration,
          colorAccent: product.colorAccent ?? '#C9A84C',
          dna: product.dna ?? [],
          scentNotes: product.scentNotes ?? [],
          isFeatured: product.isFeatured,
          isBestseller: product.isBestseller,
          isNew: product.isNew,
          isActive: product.isActive,
        })
      } catch {
        toast.error('Gagal memuat produk')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [productId, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    )
  }

  if (!form) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="font-sans text-cream/30">Produk tidak ditemukan</p>
      </div>
    )
  }

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => prev ? { ...prev, [key]: value } : prev)
  }

  async function handleSave() {
    if (!form) return
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/products/${form.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          slug: form.slug,
          tagline: form.tagline || null,
          description: form.description || null,
          story: form.story || null,
          price: form.price,
          comparePrice: form.comparePrice || null,
          sku: form.sku,
          stock: form.stock,
          volumeMl: form.volumeMl,
          concentration: form.concentration,
          colorAccent: form.colorAccent,
          dna: form.dna,
          scentNotes: form.scentNotes,
          isFeatured: form.isFeatured,
          isBestseller: form.isBestseller,
          isNew: form.isNew,
          isActive: form.isActive,
        }),
      })

      if (!res.ok) {
        const { error } = await res.json()
        throw new Error(error ?? 'Gagal menyimpan')
      }

      toast.success(`${form.name} berhasil disimpan!`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menyimpan')
    } finally {
      setSaving(false)
    }
  }

  function addDna() {
    if (!form || !newDna.trim()) return
    update('dna', [...form.dna, newDna.trim()])
    setNewDna('')
  }

  function removeDna(i: number) {
    if (!form) return
    update('dna', form.dna.filter((_, idx) => idx !== i))
  }

  function addNote() {
    if (!form || !newNote.name.trim()) return
    update('scentNotes', [...form.scentNotes, { ...newNote, name: newNote.name.trim() }])
    setNewNote({ name: '', icon: '', type: 'top' })
  }

  function removeNote(i: number) {
    if (!form) return
    update('scentNotes', form.scentNotes.filter((_, idx) => idx !== i))
  }

  const NOTE_TYPE_COLOR = { top: 'text-emerald-400', heart: 'text-pink-400', base: 'text-amber-400' }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/products" className="text-cream/30 hover:text-cream transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="font-display text-2xl text-cream">Edit Produk</h1>
            <p className="font-sans text-xs text-cream/40">{form.name} · {form.sku}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/products/${form.slug}`}
            target="_blank"
            className="flex items-center gap-1.5 font-sans text-[10px] tracking-widest uppercase text-cream/40 hover:text-cream border border-white/10 hover:border-white/20 px-3 py-2 transition-all"
          >
            <ExternalLink size={11} /> Preview
          </Link>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-luxury flex items-center gap-2 px-5 py-2.5 text-xs disabled:opacity-60"
          >
            <Save size={13} /> {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </div>

      {/* Info Dasar */}
      <div className="glass p-6 space-y-4">
        <h2 className="font-sans text-[10px] tracking-widest uppercase text-gold/70">Informasi Dasar</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="font-sans text-[10px] tracking-widest uppercase text-cream/40 block mb-1.5">Nama Produk</label>
            <input type="text" value={form.name} onChange={(e) => update('name', e.target.value)} className="input-luxury w-full text-sm" />
          </div>
          <div className="col-span-2">
            <label className="font-sans text-[10px] tracking-widest uppercase text-cream/40 block mb-1.5">Tagline</label>
            <input type="text" value={form.tagline} onChange={(e) => update('tagline', e.target.value)} className="input-luxury w-full text-sm" />
          </div>
          <div className="col-span-2">
            <label className="font-sans text-[10px] tracking-widest uppercase text-cream/40 block mb-1.5">Deskripsi</label>
            <textarea rows={3} value={form.description} onChange={(e) => update('description', e.target.value)} className="input-luxury w-full text-sm resize-none" />
          </div>
          <div className="col-span-2">
            <label className="font-sans text-[10px] tracking-widest uppercase text-cream/40 block mb-1.5">Story (English)</label>
            <textarea rows={3} value={form.story} onChange={(e) => update('story', e.target.value)} className="input-luxury w-full text-sm resize-none" />
          </div>
        </div>
      </div>

      {/* Harga & Stok */}
      <div className="glass p-6 space-y-4">
        <h2 className="font-sans text-[10px] tracking-widest uppercase text-gold/70">Harga & Stok</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-sans text-[10px] tracking-widest uppercase text-cream/40 block mb-1.5">Harga Jual (Rp)</label>
            <input type="number" value={form.price} onChange={(e) => update('price', Number(e.target.value))} className="input-luxury w-full text-sm" />
          </div>
          <div>
            <label className="font-sans text-[10px] tracking-widest uppercase text-cream/40 block mb-1.5">Harga Coret (Rp)</label>
            <input type="number" value={form.comparePrice} onChange={(e) => update('comparePrice', Number(e.target.value))} className="input-luxury w-full text-sm" />
          </div>
          <div>
            <label className="font-sans text-[10px] tracking-widest uppercase text-cream/40 block mb-1.5">Stok</label>
            <input type="number" value={form.stock} onChange={(e) => update('stock', Number(e.target.value))} className="input-luxury w-full text-sm" />
          </div>
          <div>
            <label className="font-sans text-[10px] tracking-widest uppercase text-cream/40 block mb-1.5">SKU</label>
            <input type="text" value={form.sku} onChange={(e) => update('sku', e.target.value)} className="input-luxury w-full text-sm font-mono" />
          </div>
          <div>
            <label className="font-sans text-[10px] tracking-widest uppercase text-cream/40 block mb-1.5">Volume (ml)</label>
            <input type="number" value={form.volumeMl} onChange={(e) => update('volumeMl', Number(e.target.value))} className="input-luxury w-full text-sm" />
          </div>
          <div>
            <label className="font-sans text-[10px] tracking-widest uppercase text-cream/40 block mb-1.5">Konsentrasi</label>
            <input type="text" value={form.concentration} onChange={(e) => update('concentration', e.target.value)} className="input-luxury w-full text-sm" />
          </div>
        </div>
      </div>

      {/* DNA / Karakter */}
      <div className="glass p-6 space-y-4">
        <h2 className="font-sans text-[10px] tracking-widest uppercase text-gold/70">DNA / Karakter Aroma</h2>
        <div className="flex flex-wrap gap-2">
          {form.dna.map((d, i) => (
            <span key={i} className="flex items-center gap-1.5 font-sans text-xs text-cream bg-white/[0.04] border border-white/10 px-3 py-1.5">
              {d}
              <button onClick={() => removeDna(i)} className="text-cream/30 hover:text-red-400 transition-colors"><X size={11} /></button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newDna}
            onChange={(e) => setNewDna(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addDna()}
            placeholder="Tambah karakter (mis. Woody)"
            className="input-luxury flex-1 text-sm"
          />
          <button onClick={addDna} className="btn-luxury px-4 py-2 text-xs flex items-center gap-1">
            <Plus size={13} /> Tambah
          </button>
        </div>
      </div>

      {/* Scent Notes */}
      <div className="glass p-6 space-y-4">
        <h2 className="font-sans text-[10px] tracking-widest uppercase text-gold/70">Scent Notes</h2>
        <div className="space-y-2">
          {(['top', 'heart', 'base'] as const).map((type) => {
            const notes = form.scentNotes.filter((n) => n.type === type)
            const labels = { top: 'Top Notes', heart: 'Heart Notes', base: 'Base Notes' }
            return (
              <div key={type}>
                <p className={`font-sans text-[10px] tracking-widest uppercase mb-1.5 ${NOTE_TYPE_COLOR[type]}`}>{labels[type]}</p>
                <div className="flex flex-wrap gap-2">
                  {notes.map((note) => {
                    const globalIdx = form.scentNotes.indexOf(note)
                    return (
                      <span key={globalIdx} className="flex items-center gap-1.5 font-sans text-xs text-cream bg-white/[0.04] border border-white/10 px-3 py-1.5">
                        {note.icon} {note.name}
                        <button onClick={() => removeNote(globalIdx)} className="text-cream/30 hover:text-red-400 transition-colors"><X size={11} /></button>
                      </span>
                    )
                  })}
                  {notes.length === 0 && <span className="font-sans text-[10px] text-cream/20 italic">Kosong</span>}
                </div>
              </div>
            )
          })}
        </div>
        <div className="flex gap-2 pt-2 border-t border-white/[0.06]">
          <input
            type="text"
            value={newNote.icon}
            onChange={(e) => setNewNote((p) => ({ ...p, icon: e.target.value }))}
            placeholder="🌸"
            className="input-luxury w-14 text-center text-sm"
          />
          <input
            type="text"
            value={newNote.name}
            onChange={(e) => setNewNote((p) => ({ ...p, name: e.target.value }))}
            onKeyDown={(e) => e.key === 'Enter' && addNote()}
            placeholder="Nama note (mis. Rose)"
            className="input-luxury flex-1 text-sm"
          />
          <select
            value={newNote.type}
            onChange={(e) => setNewNote((p) => ({ ...p, type: e.target.value as 'top' | 'heart' | 'base' }))}
            className="input-luxury text-sm"
          >
            <option value="top" className="bg-obsidian-3">Top</option>
            <option value="heart" className="bg-obsidian-3">Heart</option>
            <option value="base" className="bg-obsidian-3">Base</option>
          </select>
          <button onClick={addNote} className="btn-luxury px-3 py-2 text-xs">
            <Plus size={13} />
          </button>
        </div>
      </div>

      {/* Pengaturan */}
      <div className="glass p-6 space-y-4">
        <h2 className="font-sans text-[10px] tracking-widest uppercase text-gold/70">Pengaturan Tampilan</h2>
        <div className="space-y-3">
          {[
            { key: 'isActive', label: 'Aktif', desc: 'Produk ditampilkan di toko' },
            { key: 'isFeatured', label: 'Featured', desc: 'Tampil di halaman utama' },
            { key: 'isBestseller', label: 'Bestseller', desc: 'Tampil badge bestseller' },
            { key: 'isNew', label: 'New Arrival', desc: 'Tampil badge "New"' },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between py-2.5 border-b border-white/[0.04] last:border-0">
              <div>
                <p className="font-sans text-sm text-cream">{label}</p>
                <p className="font-sans text-[10px] text-cream/30">{desc}</p>
              </div>
              <button
                onClick={() => update(key as keyof FormState, !form[key as keyof FormState] as never)}
                className={`relative w-10 h-5 rounded-full transition-colors duration-300 ${form[key as keyof FormState] ? 'bg-gold' : 'bg-white/10'}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-obsidian transition-all duration-300 ${form[key as keyof FormState] ? 'left-5' : 'left-0.5'}`} />
              </button>
            </div>
          ))}
        </div>
        <div>
          <label className="font-sans text-[10px] tracking-widest uppercase text-cream/40 block mb-1.5">Warna Aksen (Hex)</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={form.colorAccent}
              onChange={(e) => update('colorAccent', e.target.value)}
              className="w-10 h-10 bg-transparent border border-white/10 cursor-pointer"
            />
            <input
              type="text"
              value={form.colorAccent}
              onChange={(e) => update('colorAccent', e.target.value)}
              className="input-luxury w-32 text-sm font-mono"
            />
          </div>
        </div>
      </div>

      {/* Save footer */}
      <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
        <Link href="/admin/products" className="font-sans text-xs text-cream/30 hover:text-cream transition-colors">
          ← Kembali ke Products
        </Link>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-luxury flex items-center gap-2 px-6 py-3 text-xs disabled:opacity-60"
        >
          <Save size={13} /> {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </div>
    </div>
  )
}
