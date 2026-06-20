'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Plus, X } from 'lucide-react'
import toast from 'react-hot-toast'

type NoteType = 'top' | 'heart' | 'base'

interface ScentNote {
  name: string
  icon: string
  type: NoteType
}

interface NewProduct {
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

const DEFAULT: NewProduct = {
  name: '', slug: '', tagline: '', description: '', story: '',
  price: 299000, comparePrice: 350000,
  sku: '', stock: 0, volumeMl: 50,
  concentration: 'Extrait De Parfum',
  colorAccent: '#C9A84C',
  dna: [],
  scentNotes: [],
  isFeatured: false, isBestseller: false, isNew: true, isActive: true,
}

export default function NewProductPage() {
  const router = useRouter()
  const [form, setForm] = useState<NewProduct>(DEFAULT)
  const [newDna, setNewDna] = useState('')
  const [newNote, setNewNote] = useState<ScentNote>({ name: '', icon: '', type: 'top' })
  const [saving, setSaving] = useState(false)

  function update<K extends keyof NewProduct>(key: K, value: NewProduct[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function autoSlug(name: string) {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  }

  async function handleSave() {
    if (!form.name.trim()) { toast.error('Masukkan nama produk'); return }
    if (!form.price) { toast.error('Masukkan harga'); return }
    setSaving(true)

    try {
      const slug = form.slug || autoSlug(form.name)
      const sku = form.sku || `CRS-${form.name.slice(0, 3).toUpperCase()}-50`

      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, slug, sku }),
      })

      if (!res.ok) {
        const { error } = await res.json()
        throw new Error(error ?? 'Gagal menyimpan')
      }

      toast.success(`Produk "${form.name}" berhasil ditambahkan!`)
      setTimeout(() => {
        setSaving(false)
        router.push('/admin/products')
      }, 800)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menyimpan')
      setSaving(false)
    }
  }

  function addDna() {
    if (!newDna.trim()) return
    update('dna', [...form.dna, newDna.trim()])
    setNewDna('')
  }

  function removeDna(i: number) {
    update('dna', form.dna.filter((_, idx) => idx !== i))
  }

  function addNote() {
    if (!newNote.name.trim()) return
    update('scentNotes', [...form.scentNotes, { ...newNote, name: newNote.name.trim() }])
    setNewNote({ name: '', icon: '', type: 'top' })
  }

  function removeNote(i: number) {
    update('scentNotes', form.scentNotes.filter((_, idx) => idx !== i))
  }

  const NOTE_COLOR = { top: 'text-emerald-400', heart: 'text-pink-400', base: 'text-amber-400' }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/products" className="text-cream/30 hover:text-cream transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="font-display text-2xl text-cream">Produk Baru</h1>
            <p className="font-sans text-xs text-cream/40">Tambah produk ke katalog CRUISER</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-luxury flex items-center gap-2 px-5 py-2.5 text-xs disabled:opacity-60"
        >
          <Save size={13} /> {saving ? 'Menyimpan...' : 'Simpan Produk'}
        </button>
      </div>

      {/* Info Dasar */}
      <div className="glass p-6 space-y-4">
        <h2 className="font-sans text-[10px] tracking-widest uppercase text-gold/70">Informasi Dasar</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="font-sans text-[10px] tracking-widest uppercase text-cream/40 block mb-1.5">Nama Produk *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => {
                update('name', e.target.value)
                update('slug', autoSlug(e.target.value))
                update('sku', `CRS-${e.target.value.slice(0, 3).toUpperCase()}-50`)
              }}
              placeholder="mis. Aurora"
              className="input-luxury w-full text-sm"
            />
          </div>
          <div>
            <label className="font-sans text-[10px] tracking-widest uppercase text-cream/40 block mb-1.5">Slug (URL)</label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => update('slug', autoSlug(e.target.value))}
              placeholder="aurora"
              className="input-luxury w-full text-sm font-mono"
            />
            <p className="font-sans text-[9px] text-cream/20 mt-1">/products/{form.slug || 'nama-produk'}</p>
          </div>
          <div>
            <label className="font-sans text-[10px] tracking-widest uppercase text-cream/40 block mb-1.5">SKU</label>
            <input
              type="text"
              value={form.sku}
              onChange={(e) => update('sku', e.target.value)}
              placeholder="CRS-AUR-50"
              className="input-luxury w-full text-sm font-mono"
            />
          </div>
          <div className="col-span-2">
            <label className="font-sans text-[10px] tracking-widest uppercase text-cream/40 block mb-1.5">Tagline</label>
            <input type="text" value={form.tagline} onChange={(e) => update('tagline', e.target.value)} placeholder="mis. Beauty in Bloom." className="input-luxury w-full text-sm" />
          </div>
          <div className="col-span-2">
            <label className="font-sans text-[10px] tracking-widest uppercase text-cream/40 block mb-1.5">Deskripsi</label>
            <textarea rows={3} value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="Deskripsi aroma..." className="input-luxury w-full text-sm resize-none" />
          </div>
          <div className="col-span-2">
            <label className="font-sans text-[10px] tracking-widest uppercase text-cream/40 block mb-1.5">Story (English)</label>
            <textarea rows={3} value={form.story} onChange={(e) => update('story', e.target.value)} placeholder="The story behind this fragrance..." className="input-luxury w-full text-sm resize-none" />
          </div>
        </div>
      </div>

      {/* Harga & Stok */}
      <div className="glass p-6 space-y-4">
        <h2 className="font-sans text-[10px] tracking-widest uppercase text-gold/70">Harga & Stok</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-sans text-[10px] tracking-widest uppercase text-cream/40 block mb-1.5">Harga Jual (Rp) *</label>
            <input type="number" value={form.price} onChange={(e) => update('price', Number(e.target.value))} className="input-luxury w-full text-sm" />
          </div>
          <div>
            <label className="font-sans text-[10px] tracking-widest uppercase text-cream/40 block mb-1.5">Harga Coret (Rp)</label>
            <input type="number" value={form.comparePrice} onChange={(e) => update('comparePrice', Number(e.target.value))} className="input-luxury w-full text-sm" />
          </div>
          <div>
            <label className="font-sans text-[10px] tracking-widest uppercase text-cream/40 block mb-1.5">Stok *</label>
            <input type="number" value={form.stock} onChange={(e) => update('stock', Number(e.target.value))} className="input-luxury w-full text-sm" />
          </div>
          <div>
            <label className="font-sans text-[10px] tracking-widest uppercase text-cream/40 block mb-1.5">Volume (ml)</label>
            <input type="number" value={form.volumeMl} onChange={(e) => update('volumeMl', Number(e.target.value))} className="input-luxury w-full text-sm" />
          </div>
          <div className="col-span-2">
            <label className="font-sans text-[10px] tracking-widest uppercase text-cream/40 block mb-1.5">Konsentrasi</label>
            <input type="text" value={form.concentration} onChange={(e) => update('concentration', e.target.value)} className="input-luxury w-full text-sm" />
          </div>
        </div>
      </div>

      {/* DNA */}
      <div className="glass p-6 space-y-4">
        <h2 className="font-sans text-[10px] tracking-widest uppercase text-gold/70">DNA / Karakter Aroma</h2>
        <div className="flex flex-wrap gap-2">
          {form.dna.map((d, i) => (
            <span key={i} className="flex items-center gap-1.5 font-sans text-xs text-cream bg-white/[0.04] border border-white/10 px-3 py-1.5">
              {d}
              <button onClick={() => removeDna(i)} className="text-cream/30 hover:text-red-400 transition-colors"><X size={11} /></button>
            </span>
          ))}
          {form.dna.length === 0 && <span className="font-sans text-[10px] text-cream/20 italic">Belum ada karakter</span>}
        </div>
        <div className="flex gap-2">
          <input type="text" value={newDna} onChange={(e) => setNewDna(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addDna()} placeholder="mis. Floral, Woody, Fresh..." className="input-luxury flex-1 text-sm" />
          <button onClick={addDna} className="btn-luxury px-4 py-2 text-xs flex items-center gap-1"><Plus size={13} /> Tambah</button>
        </div>
      </div>

      {/* Scent Notes */}
      <div className="glass p-6 space-y-4">
        <h2 className="font-sans text-[10px] tracking-widest uppercase text-gold/70">Scent Notes</h2>
        <div className="space-y-3">
          {(['top', 'heart', 'base'] as NoteType[]).map((type) => {
            const notes = form.scentNotes.filter((n) => n.type === type)
            const labels = { top: 'Top Notes', heart: 'Heart Notes', base: 'Base Notes' }
            return (
              <div key={type}>
                <p className={`font-sans text-[10px] tracking-widest uppercase mb-1.5 ${NOTE_COLOR[type]}`}>{labels[type]}</p>
                <div className="flex flex-wrap gap-2">
                  {notes.map((note) => {
                    const gi = form.scentNotes.indexOf(note)
                    return (
                      <span key={gi} className="flex items-center gap-1.5 font-sans text-xs text-cream bg-white/[0.04] border border-white/10 px-3 py-1.5">
                        {note.icon} {note.name}
                        <button onClick={() => removeNote(gi)} className="text-cream/30 hover:text-red-400"><X size={11} /></button>
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
          <input type="text" value={newNote.icon} onChange={(e) => setNewNote((p) => ({ ...p, icon: e.target.value }))} placeholder="🌸" className="input-luxury w-14 text-center text-sm" />
          <input type="text" value={newNote.name} onChange={(e) => setNewNote((p) => ({ ...p, name: e.target.value }))} onKeyDown={(e) => e.key === 'Enter' && addNote()} placeholder="Nama note (mis. Rose)" className="input-luxury flex-1 text-sm" />
          <select value={newNote.type} onChange={(e) => setNewNote((p) => ({ ...p, type: e.target.value as NoteType }))} className="input-luxury text-sm">
            <option value="top" className="bg-obsidian-3">Top</option>
            <option value="heart" className="bg-obsidian-3">Heart</option>
            <option value="base" className="bg-obsidian-3">Base</option>
          </select>
          <button onClick={addNote} className="btn-luxury px-3 py-2 text-xs"><Plus size={13} /></button>
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
                onClick={() => update(key as keyof NewProduct, !form[key as keyof NewProduct] as never)}
                className={`relative w-10 h-5 rounded-full transition-colors duration-300 ${form[key as keyof NewProduct] ? 'bg-gold' : 'bg-white/10'}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-obsidian transition-all duration-300 ${form[key as keyof NewProduct] ? 'left-5' : 'left-0.5'}`} />
              </button>
            </div>
          ))}
        </div>
        <div>
          <label className="font-sans text-[10px] tracking-widest uppercase text-cream/40 block mb-1.5">Warna Aksen (Hex)</label>
          <div className="flex items-center gap-3">
            <input type="color" value={form.colorAccent} onChange={(e) => update('colorAccent', e.target.value)} className="w-10 h-10 bg-transparent border border-white/10 cursor-pointer" />
            <input type="text" value={form.colorAccent} onChange={(e) => update('colorAccent', e.target.value)} className="input-luxury w-32 text-sm font-mono" />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
        <Link href="/admin/products" className="font-sans text-xs text-cream/30 hover:text-cream transition-colors">
          ← Kembali
        </Link>
        <button onClick={handleSave} disabled={saving} className="btn-luxury flex items-center gap-2 px-6 py-3 text-xs disabled:opacity-60">
          <Save size={13} /> {saving ? 'Menyimpan...' : 'Simpan Produk'}
        </button>
      </div>
    </div>
  )
}
