'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Save, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'

const PRODUCTS_INITIAL = [
  {
    id: 'prod-eternity',
    name: 'Eternity',
    slug: 'eternity',
    sku: 'CRS-ETR-50',
    stock: 50,
    lowStockThreshold: 10,
    price: 299_000,
    image: '/images/eternity-splash.png',
    color: '#8B9E6A',
  },
  {
    id: 'prod-noctis',
    name: 'Noctis',
    slug: 'noctis',
    sku: 'CRS-NCT-50',
    stock: 30,
    lowStockThreshold: 10,
    price: 299_000,
    image: '/images/noctis-splash.png',
    color: '#7A1A45',
  },
  {
    id: 'prod-liberea',
    name: 'Liberea',
    slug: 'liberea',
    sku: 'CRS-LBR-50',
    stock: 45,
    lowStockThreshold: 10,
    price: 299_000,
    image: '/images/liberea-splash.png',
    color: '#1A5F8A',
  },
]

export default function InventoryPage() {
  const [products, setProducts] = useState(PRODUCTS_INITIAL)
  const [edited, setEdited] = useState<Record<string, { stock?: number; threshold?: number }>>({})

  function updateField(id: string, field: 'stock' | 'threshold', value: number) {
    setEdited((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }))
  }

  function save(id: string) {
    const e = edited[id]
    if (!e) return
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              ...(e.stock !== undefined ? { stock: e.stock } : {}),
              ...(e.threshold !== undefined ? { lowStockThreshold: e.threshold } : {}),
            }
          : p,
      ),
    )
    setEdited((prev) => { const next = { ...prev }; delete next[id]; return next })
    toast.success('Stok disimpan')
  }

  const totalStock = products.reduce((s, p) => s + p.stock, 0)
  const lowStock = products.filter((p) => p.stock <= p.lowStockThreshold)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-cream">Inventory</h1>
        <p className="font-sans text-xs text-cream/40 mt-1">Total {totalStock} unit tersedia</p>
      </div>

      {/* Low stock alert */}
      {lowStock.length > 0 && (
        <div className="flex items-center gap-3 p-4 border border-amber-400/20 bg-amber-400/5">
          <AlertTriangle size={16} className="text-amber-400 flex-shrink-0" />
          <p className="font-sans text-xs text-amber-400">
            <strong>{lowStock.map((p) => p.name).join(', ')}</strong> stok menipis — segera restock
          </p>
        </div>
      )}

      {/* Stock overview */}
      <div className="grid grid-cols-3 gap-4">
        {products.map((p) => {
          const isLow = p.stock <= p.lowStockThreshold
          const pct = Math.min((p.stock / 100) * 100, 100)
          return (
            <div key={p.id} className="glass p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative w-10 h-12 flex-shrink-0">
                  <Image src={p.image} alt={p.name} fill className="object-cover" sizes="40px" />
                </div>
                <div>
                  <p className="font-display text-sm text-cream">{p.name}</p>
                  <p className="font-sans text-[10px] text-cream/30">{p.sku}</p>
                </div>
              </div>
              <div className="h-1.5 bg-white/5 overflow-hidden mb-2">
                <div
                  className="h-full transition-all duration-700"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: isLow ? '#f59e0b' : p.color,
                  }}
                />
              </div>
              <div className="flex justify-between items-center">
                <span className={`font-display text-2xl ${isLow ? 'text-amber-400' : 'text-cream'}`}>
                  {p.stock}
                </span>
                <span className="font-sans text-[10px] text-cream/30">/ 100 unit</span>
              </div>
              {isLow && (
                <p className="font-sans text-[10px] text-amber-400 mt-1 flex items-center gap-1">
                  <AlertTriangle size={10} /> Stok rendah
                </p>
              )}
            </div>
          )
        })}
      </div>

      {/* Edit table */}
      <div className="glass p-6">
        <h2 className="font-sans text-xs tracking-widest uppercase text-gold/70 mb-6">Update Stok</h2>
        <div className="space-y-4">
          {products.map((p) => {
            const e = edited[p.id] ?? {}
            const currentStock = e.stock !== undefined ? e.stock : p.stock
            const currentThreshold = e.threshold !== undefined ? e.threshold : p.lowStockThreshold
            const isDirty = edited[p.id] !== undefined

            return (
              <div key={p.id} className="flex items-center gap-6 py-4 border-b border-white/[0.04] last:border-0">
                <div className="flex items-center gap-3 w-40">
                  <div className="w-2 h-6 flex-shrink-0" style={{ backgroundColor: p.color }} />
                  <div>
                    <p className="font-sans text-sm text-cream">{p.name}</p>
                    <p className="font-sans text-[10px] text-cream/30">{p.sku}</p>
                  </div>
                </div>

                <div className="flex-1 grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-sans text-[10px] tracking-widest uppercase text-cream/30 block mb-1.5">Stok Sekarang</label>
                    <input
                      type="number"
                      min={0}
                      value={currentStock}
                      onChange={(e) => updateField(p.id, 'stock', Number(e.target.value))}
                      className="input-luxury w-full text-sm"
                    />
                  </div>
                  <div>
                    <label className="font-sans text-[10px] tracking-widest uppercase text-cream/30 block mb-1.5">Low Stock Alert</label>
                    <input
                      type="number"
                      min={0}
                      value={currentThreshold}
                      onChange={(e) => updateField(p.id, 'threshold', Number(e.target.value))}
                      className="input-luxury w-full text-sm"
                    />
                  </div>
                </div>

                <button
                  onClick={() => save(p.id)}
                  disabled={!isDirty}
                  className="flex items-center gap-2 px-4 py-2.5 btn-luxury text-xs disabled:opacity-30"
                >
                  <Save size={13} />
                  Simpan
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
