'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Copy, Trash2, Tag } from 'lucide-react'
import toast from 'react-hot-toast'

type CouponType = 'percentage' | 'fixed' | 'free_shipping'

interface Coupon {
  id: string
  code: string
  type: CouponType
  value: number
  minOrder: number
  usedCount: number
  maxUses: number | null
  isActive: boolean
  expiresAt: string | null
  createdAt: string
}

const TYPE_LABEL: Record<CouponType, string> = {
  percentage: 'Persen (%)',
  fixed: 'Nominal (Rp)',
  free_shipping: 'Gratis Ongkir',
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    code: '', type: 'percentage' as CouponType, value: '', minOrder: '', maxUses: '', expiresAt: '',
  })

  const loadCoupons = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/coupons')
      if (!res.ok) throw new Error('Failed')
      const { coupons: data } = await res.json()
      setCoupons(data)
    } catch {
      toast.error('Gagal memuat kupon')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCoupons()
  }, [loadCoupons])

  async function toggleActive(coupon: Coupon) {
    try {
      const res = await fetch(`/api/admin/coupons/${coupon.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !coupon.isActive }),
      })
      if (!res.ok) throw new Error('Failed')
      setCoupons((prev) => prev.map((c) => c.id === coupon.id ? { ...c, isActive: !c.isActive } : c))
    } catch {
      toast.error('Gagal mengubah status')
    }
  }

  async function deleteCoupon(id: string) {
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed')
      setCoupons((prev) => prev.filter((c) => c.id !== id))
      toast.success('Kupon dihapus')
    } catch {
      toast.error('Gagal menghapus kupon')
    }
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code)
    toast.success(`Kode ${code} disalin`)
  }

  async function addCoupon(e: React.FormEvent) {
    e.preventDefault()
    if (!form.code) { toast.error('Masukkan kode kupon'); return }
    if (form.type !== 'free_shipping' && !form.value) { toast.error('Masukkan nilai diskon'); return }
    if (coupons.find((c) => c.code === form.code.toUpperCase())) { toast.error('Kode sudah dipakai'); return }

    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: form.code.toUpperCase(),
          type: form.type,
          value: Number(form.value) || 0,
          minOrder: Number(form.minOrder) || 0,
          maxUses: form.maxUses ? Number(form.maxUses) : null,
          expiresAt: form.expiresAt || null,
          isActive: true,
        }),
      })
      if (!res.ok) {
        const { error } = await res.json()
        throw new Error(error ?? 'Failed')
      }
      const { coupon } = await res.json()
      setCoupons((prev) => [coupon, ...prev])
      toast.success('Kupon berhasil dibuat!')
      setForm({ code: '', type: 'percentage', value: '', minOrder: '', maxUses: '', expiresAt: '' })
      setShowForm(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal membuat kupon')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-cream">Coupons</h1>
          <p className="font-sans text-xs text-cream/40 mt-1">
            {coupons.filter((c) => c.isActive).length} kode aktif
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="btn-luxury flex items-center gap-2 px-4 py-2.5 text-xs"
        >
          <Plus size={13} />
          Buat Kupon
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={addCoupon} className="glass p-6 space-y-4">
          <p className="font-sans text-xs tracking-widest uppercase text-gold/70">Kupon Baru</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="font-sans text-[10px] tracking-widest uppercase text-cream/40 block mb-1.5">Kode *</label>
              <input
                type="text"
                value={form.code}
                onChange={(e) => setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
                placeholder="mis. CRUISER10"
                className="input-luxury w-full text-sm uppercase"
              />
            </div>
            <div>
              <label className="font-sans text-[10px] tracking-widest uppercase text-cream/40 block mb-1.5">Tipe *</label>
              <select
                value={form.type}
                onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as CouponType }))}
                className="input-luxury w-full text-sm"
              >
                <option value="percentage" className="bg-obsidian-3">Persentase (%)</option>
                <option value="fixed" className="bg-obsidian-3">Nominal Tetap (Rp)</option>
                <option value="free_shipping" className="bg-obsidian-3">Gratis Ongkir</option>
              </select>
            </div>
            {form.type !== 'free_shipping' && (
              <div>
                <label className="font-sans text-[10px] tracking-widest uppercase text-cream/40 block mb-1.5">
                  Nilai {form.type === 'percentage' ? '(%)' : '(Rp)'} *
                </label>
                <input
                  type="number"
                  value={form.value}
                  onChange={(e) => setForm((p) => ({ ...p, value: e.target.value }))}
                  placeholder={form.type === 'percentage' ? '10' : '50000'}
                  className="input-luxury w-full text-sm"
                />
              </div>
            )}
            <div>
              <label className="font-sans text-[10px] tracking-widest uppercase text-cream/40 block mb-1.5">Min. Order (Rp)</label>
              <input
                type="number"
                value={form.minOrder}
                onChange={(e) => setForm((p) => ({ ...p, minOrder: e.target.value }))}
                placeholder="0 = tidak ada minimum"
                className="input-luxury w-full text-sm"
              />
            </div>
            <div>
              <label className="font-sans text-[10px] tracking-widest uppercase text-cream/40 block mb-1.5">Maks. Penggunaan</label>
              <input
                type="number"
                value={form.maxUses}
                onChange={(e) => setForm((p) => ({ ...p, maxUses: e.target.value }))}
                placeholder="Kosong = tidak terbatas"
                className="input-luxury w-full text-sm"
              />
            </div>
            <div>
              <label className="font-sans text-[10px] tracking-widest uppercase text-cream/40 block mb-1.5">Kadaluarsa</label>
              <input
                type="date"
                value={form.expiresAt}
                onChange={(e) => setForm((p) => ({ ...p, expiresAt: e.target.value }))}
                className="input-luxury w-full text-sm"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="btn-luxury px-5 py-2.5 text-xs">Simpan Kupon</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-luxury-outline px-5 py-2.5 text-xs">Batal</button>
          </div>
        </form>
      )}

      {/* List */}
      {coupons.length === 0 && !showForm ? (
        <div className="glass flex flex-col items-center justify-center py-16 text-center">
          <Tag size={36} className="text-cream/10 mb-4" />
          <p className="font-sans text-sm text-cream/30">Belum ada kupon</p>
          <p className="font-sans text-xs text-cream/20 mt-1">Klik "Buat Kupon" untuk membuat kode diskon</p>
        </div>
      ) : (
        <div className="space-y-3">
          {coupons.map((c) => (
            <div
              key={c.id}
              className={`glass p-5 flex flex-col sm:flex-row sm:items-center gap-4 transition-opacity ${!c.isActive ? 'opacity-40' : ''}`}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0">
                  <Tag size={16} className="text-gold" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-cream tracking-widest">{c.code}</span>
                    <button onClick={() => copyCode(c.code)} className="text-cream/30 hover:text-gold transition-colors">
                      <Copy size={12} />
                    </button>
                  </div>
                  <p className="font-sans text-[10px] text-cream/40">
                    {TYPE_LABEL[c.type]}
                    {c.type === 'percentage' && ` · ${c.value}% off`}
                    {c.type === 'fixed' && ` · Rp${c.value.toLocaleString('id-ID')} off`}
                    {c.minOrder > 0 && ` · Min. Rp${c.minOrder.toLocaleString('id-ID')}`}
                    {c.expiresAt && ` · Exp. ${c.expiresAt}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="font-display text-lg text-cream">{c.usedCount}</p>
                  <p className="font-sans text-[9px] text-cream/30">{c.maxUses ? `/ ${c.maxUses}` : '∞'} pakai</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleActive(c)}
                    title={c.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                    className={`relative w-10 h-5 rounded-full transition-colors duration-300 ${c.isActive ? 'bg-gold' : 'bg-white/10'}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-obsidian transition-all duration-300 ${c.isActive ? 'left-5' : 'left-0.5'}`} />
                  </button>
                  <button onClick={() => deleteCoupon(c.id)} className="text-cream/20 hover:text-red-400 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
