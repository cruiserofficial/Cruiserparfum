'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MapPin, Plus, Trash2, Edit2, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

interface Address {
  id: string
  label: string
  recipientName: string
  phone: string
  street: string
  city: string
  province: string
  postalCode: string
  isDefault: boolean
}

const ADDRESSES_INITIAL: Address[] = [
  {
    id: 'a1',
    label: 'Rumah',
    recipientName: 'Cruiser Member',
    phone: '081234567890',
    street: 'Jl. Merdeka No. 10',
    city: 'Jakarta Selatan',
    province: 'DKI Jakarta',
    postalCode: '12940',
    isDefault: true,
  },
]

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>(ADDRESSES_INITIAL)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({
    label: '',
    recipientName: '',
    phone: '',
    street: '',
    city: '',
    province: '',
    postalCode: '',
  })

  function openAdd() {
    setEditId(null)
    setForm({ label: '', recipientName: '', phone: '', street: '', city: '', province: '', postalCode: '' })
    setShowForm(true)
  }

  function openEdit(addr: Address) {
    setEditId(addr.id)
    setForm({
      label: addr.label,
      recipientName: addr.recipientName,
      phone: addr.phone,
      street: addr.street,
      city: addr.city,
      province: addr.province,
      postalCode: addr.postalCode,
    })
    setShowForm(true)
  }

  function submit() {
    if (!form.recipientName || !form.street || !form.city) {
      toast.error('Lengkapi data alamat')
      return
    }
    if (editId) {
      setAddresses((prev) => prev.map((a) => a.id === editId ? { ...a, ...form } : a))
      toast.success('Alamat diperbarui')
    } else {
      const newAddr: Address = {
        ...form,
        id: `a${Date.now()}`,
        isDefault: addresses.length === 0,
      }
      setAddresses((prev) => [...prev, newAddr])
      toast.success('Alamat ditambahkan')
    }
    setShowForm(false)
    setEditId(null)
  }

  function setDefault(id: string) {
    setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })))
    toast.success('Alamat utama diubah')
  }

  function deleteAddress(id: string) {
    setAddresses((prev) => prev.filter((a) => a.id !== id))
    toast.success('Alamat dihapus')
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container max-w-3xl mx-auto px-6">
        <div className="flex items-center justify-between mb-10 pb-6 border-b border-white/[0.06]">
          <div className="flex items-center gap-4">
            <Link href="/account" className="font-sans text-xs text-cream/30 hover:text-cream transition-colors">
              ← Akun
            </Link>
            <span className="text-cream/10">/</span>
            <h1 className="font-display text-2xl text-cream">Alamat Pengiriman</h1>
          </div>
          <button onClick={openAdd} className="btn-luxury flex items-center gap-2 px-4 py-2.5 text-xs">
            <Plus size={13} />
            Tambah Alamat
          </button>
        </div>

        {/* Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-6"
            >
              <div className="glass p-6 space-y-4">
                <p className="font-sans text-xs tracking-widest uppercase text-gold/70">
                  {editId ? 'Edit Alamat' : 'Alamat Baru'}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-sans text-[10px] tracking-widest uppercase text-cream/40 block mb-1.5">Label (mis. Rumah, Kantor)</label>
                    <input
                      type="text"
                      value={form.label}
                      onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))}
                      placeholder="Rumah"
                      className="input-luxury w-full text-sm"
                    />
                  </div>
                  <div>
                    <label className="font-sans text-[10px] tracking-widest uppercase text-cream/40 block mb-1.5">Nama Penerima</label>
                    <input
                      type="text"
                      value={form.recipientName}
                      onChange={(e) => setForm((p) => ({ ...p, recipientName: e.target.value }))}
                      placeholder="Nama lengkap"
                      className="input-luxury w-full text-sm"
                    />
                  </div>
                  <div>
                    <label className="font-sans text-[10px] tracking-widest uppercase text-cream/40 block mb-1.5">No. Telepon</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                      placeholder="08xxxxxxxxxx"
                      className="input-luxury w-full text-sm"
                    />
                  </div>
                  <div>
                    <label className="font-sans text-[10px] tracking-widest uppercase text-cream/40 block mb-1.5">Kode Pos</label>
                    <input
                      type="text"
                      value={form.postalCode}
                      onChange={(e) => setForm((p) => ({ ...p, postalCode: e.target.value }))}
                      placeholder="12345"
                      className="input-luxury w-full text-sm"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="font-sans text-[10px] tracking-widest uppercase text-cream/40 block mb-1.5">Alamat Lengkap</label>
                    <input
                      type="text"
                      value={form.street}
                      onChange={(e) => setForm((p) => ({ ...p, street: e.target.value }))}
                      placeholder="Jl. Nama Jalan No. XX, RT/RW"
                      className="input-luxury w-full text-sm"
                    />
                  </div>
                  <div>
                    <label className="font-sans text-[10px] tracking-widest uppercase text-cream/40 block mb-1.5">Kota / Kecamatan</label>
                    <input
                      type="text"
                      value={form.city}
                      onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
                      placeholder="Jakarta Selatan"
                      className="input-luxury w-full text-sm"
                    />
                  </div>
                  <div>
                    <label className="font-sans text-[10px] tracking-widest uppercase text-cream/40 block mb-1.5">Provinsi</label>
                    <input
                      type="text"
                      value={form.province}
                      onChange={(e) => setForm((p) => ({ ...p, province: e.target.value }))}
                      placeholder="DKI Jakarta"
                      className="input-luxury w-full text-sm"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={submit} className="btn-luxury px-5 py-2.5 text-xs">Simpan</button>
                  <button onClick={() => setShowForm(false)} className="btn-luxury-outline px-5 py-2.5 text-xs">Batal</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Address cards */}
        {addresses.length === 0 ? (
          <div className="text-center py-20">
            <MapPin size={40} className="text-cream/10 mx-auto mb-4" />
            <p className="font-display text-xl text-cream/30">Belum ada alamat tersimpan</p>
          </div>
        ) : (
          <div className="space-y-4">
            {addresses.map((addr) => (
              <div key={addr.id} className={`glass p-5 ${addr.isDefault ? 'border-gold/20' : ''}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 flex items-center justify-center flex-shrink-0 mt-0.5 ${addr.isDefault ? 'bg-gold/10 border-gold/20' : 'bg-white/5 border-white/10'} border`}>
                      <MapPin size={14} className={addr.isDefault ? 'text-gold' : 'text-cream/30'} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-sans text-sm font-medium text-cream">{addr.label || 'Alamat'}</p>
                        {addr.isDefault && (
                          <span className="font-sans text-[9px] tracking-widest uppercase text-gold bg-gold/10 border border-gold/20 px-2 py-0.5">
                            Utama
                          </span>
                        )}
                      </div>
                      <p className="font-sans text-sm text-cream/70">{addr.recipientName}</p>
                      <p className="font-sans text-xs text-cream/40 mt-0.5">{addr.phone}</p>
                      <p className="font-sans text-xs text-cream/50 mt-1 leading-relaxed">
                        {addr.street}, {addr.city}, {addr.province} {addr.postalCode}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!addr.isDefault && (
                      <button
                        onClick={() => setDefault(addr.id)}
                        className="font-sans text-[10px] text-cream/30 hover:text-gold transition-colors flex items-center gap-1"
                        title="Jadikan alamat utama"
                      >
                        <Check size={12} />
                        Utamakan
                      </button>
                    )}
                    <button
                      onClick={() => openEdit(addr)}
                      className="w-8 h-8 border border-white/10 flex items-center justify-center text-cream/30 hover:text-cream transition-colors"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => deleteAddress(addr.id)}
                      className="w-8 h-8 border border-white/10 flex items-center justify-center text-cream/20 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
