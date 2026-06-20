'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Save, Upload, X, Plus, Trash2, QrCode, Building2, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

interface BankAccount {
  id: string
  bankName: string
  accountNumber: string
  accountName: string
}

export default function SettingsPage() {
  const qrisInputRef = useRef<HTMLInputElement>(null)

  const [general, setGeneral] = useState({
    storeName: 'CRUISER',
    storeEmail: 'cruiser.official1@gmail.com',
    whatsapp: '',
    instagram: 'https://instagram.com/cruiser.official',
    shopee: '',
    freeShippingThreshold: 500_000,
    maintenanceMode: false,
  })

  const [payment, setPayment] = useState({
    midtransActive: false,
    qrisActive: true,
    bankTransferActive: true,
    codActive: false,
  })

  const [qrisImage, setQrisImage] = useState<string>('')
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
  const [showAddBank, setShowAddBank] = useState(false)
  const [newBank, setNewBank] = useState({ bankName: '', accountNumber: '', accountName: '' })
  const [showKey, setShowKey] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const loadSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/settings')
      if (!res.ok) return
      const { settings } = await res.json()

      if (settings.store_info) {
        const info = settings.store_info as { phone?: string; instagram?: string }
        setGeneral((prev) => ({
          ...prev,
          whatsapp: info.phone ?? '',
          instagram: info.instagram ? `https://instagram.com/${info.instagram}` : prev.instagram,
        }))
      }
      if (settings.payment_methods) {
        const pm = settings.payment_methods as { midtrans?: boolean; qris?: boolean; bankTransfer?: boolean; cod?: boolean }
        setPayment({
          midtransActive: pm.midtrans ?? false,
          qrisActive: pm.qris ?? true,
          bankTransferActive: pm.bankTransfer ?? true,
          codActive: pm.cod ?? false,
        })
      }
      if (settings.qris_image && settings.qris_image !== null) {
        setQrisImage(String(settings.qris_image))
      }
      if (Array.isArray(settings.bank_accounts)) {
        setBankAccounts(settings.bank_accounts as BankAccount[])
      }
    } catch {
      // Settings not critical — fail silently
    } finally {
      setLoaded(true)
    }
  }, [])

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  async function saveToDb(key: string, value: unknown) {
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: value }),
      })
      if (!res.ok) throw new Error('Failed')
    } catch {
      toast.error('Gagal menyimpan ke database')
    }
  }

  async function saveGeneral() {
    await saveToDb('store_info', {
      phone: general.whatsapp,
      address: '',
      instagram: general.instagram.replace('https://instagram.com/', ''),
    })
    toast.success('Pengaturan umum disimpan')
  }

  async function savePayment() {
    await saveToDb('payment_methods', {
      midtrans: payment.midtransActive,
      qris: payment.qrisActive,
      bankTransfer: payment.bankTransferActive,
      cod: payment.codActive,
    })
    toast.success('Metode pembayaran disimpan')
  }

  function handleQrisUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { toast.error('File harus berupa gambar'); return }
    if (file.size > 3 * 1024 * 1024) { toast.error('Ukuran gambar maks. 3MB'); return }
    const reader = new FileReader()
    reader.onload = async (ev) => {
      const result = ev.target?.result as string
      setQrisImage(result)
      await saveToDb('qris_image', result)
      toast.success('Gambar QRIS berhasil disimpan')
    }
    reader.readAsDataURL(file)
  }

  async function removeQris() {
    setQrisImage('')
    await saveToDb('qris_image', null)
    toast.success('Gambar QRIS dihapus')
  }

  async function addBankAccount(e: React.FormEvent) {
    e.preventDefault()
    if (!newBank.bankName || !newBank.accountNumber || !newBank.accountName) {
      toast.error('Lengkapi semua field rekening')
      return
    }
    const updated = [...bankAccounts, { ...newBank, id: `bank_${Date.now()}` }]
    setBankAccounts(updated)
    await saveToDb('bank_accounts', updated)
    setNewBank({ bankName: '', accountNumber: '', accountName: '' })
    setShowAddBank(false)
    toast.success('Rekening berhasil ditambahkan')
  }

  async function deleteBankAccount(id: string) {
    const updated = bankAccounts.filter((b) => b.id !== id)
    setBankAccounts(updated)
    await saveToDb('bank_accounts', updated)
    toast.success('Rekening dihapus')
  }

  if (!loaded) return null

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-display text-3xl text-cream">Settings</h1>
        <p className="font-sans text-xs text-cream/40 mt-1">Konfigurasi toko CRUISER</p>
      </div>

      {/* Informasi Toko */}
      <div className="glass p-6 space-y-5">
        <h2 className="font-sans text-xs tracking-widest uppercase text-gold/70">Informasi Toko</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: 'Nama Toko', key: 'storeName', type: 'text' },
            { label: 'Email', key: 'storeEmail', type: 'email' },
            { label: 'WhatsApp (dengan 62)', key: 'whatsapp', type: 'tel', placeholder: '628123456789' },
            { label: 'Instagram URL', key: 'instagram', type: 'url' },
            { label: 'Shopee URL', key: 'shopee', type: 'url' },
            { label: 'Gratis Ongkir Min. (Rp)', key: 'freeShippingThreshold', type: 'number' },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key}>
              <label className="font-sans text-[10px] tracking-widest uppercase text-cream/40 block mb-1.5">{label}</label>
              <input
                type={type}
                value={(general as Record<string, unknown>)[key] as string}
                onChange={(e) => setGeneral((p) => ({ ...p, [key]: type === 'number' ? Number(e.target.value) : e.target.value }))}
                placeholder={placeholder}
                className="input-luxury w-full text-sm"
              />
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
          <div>
            <p className="font-sans text-sm text-cream">Maintenance Mode</p>
            <p className="font-sans text-[10px] text-cream/30">Tampilkan halaman under maintenance ke pengunjung</p>
          </div>
          <button
            onClick={() => setGeneral((p) => ({ ...p, maintenanceMode: !p.maintenanceMode }))}
            className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${general.maintenanceMode ? 'bg-amber-400' : 'bg-white/10'}`}
          >
            <span className={`absolute top-1 w-4 h-4 rounded-full bg-obsidian transition-all duration-300 ${general.maintenanceMode ? 'left-7' : 'left-1'}`} />
          </button>
        </div>
        <button onClick={saveGeneral} className="btn-luxury flex items-center gap-2 px-5 py-2.5 text-xs">
          <Save size={13} /> Simpan Pengaturan Umum
        </button>
      </div>

      {/* QRIS */}
      <div className="glass p-6 space-y-4">
        <div className="flex items-center gap-2">
          <QrCode size={15} className="text-gold/70" />
          <h2 className="font-sans text-xs tracking-widest uppercase text-gold/70">Gambar QRIS</h2>
        </div>
        <p className="font-sans text-xs text-cream/30">
          Upload gambar QRIS kamu di sini. Gambar ini akan ditampilkan ke pelanggan saat memilih pembayaran QRIS.
        </p>

        {qrisImage ? (
          <div className="flex flex-col items-start gap-4">
            <div className="relative border border-white/10 p-2 bg-white/[0.02]">
              <img src={qrisImage} alt="QRIS" className="max-w-[220px] max-h-[220px] object-contain" />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => qrisInputRef.current?.click()}
                className="flex items-center gap-2 font-sans text-xs text-cream/50 hover:text-cream border border-white/10 hover:border-white/20 px-4 py-2 transition-all"
              >
                <Upload size={13} /> Ganti Gambar
              </button>
              <button
                onClick={removeQris}
                className="flex items-center gap-2 font-sans text-xs text-red-400/60 hover:text-red-400 border border-red-400/10 hover:border-red-400/30 px-4 py-2 transition-all"
              >
                <X size={13} /> Hapus
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => qrisInputRef.current?.click()}
            className="w-full border border-dashed border-white/15 hover:border-gold/30 py-10 flex flex-col items-center gap-3 transition-all group"
          >
            <QrCode size={32} className="text-cream/15 group-hover:text-gold/30 transition-colors" />
            <div className="text-center">
              <p className="font-sans text-sm text-cream/30 group-hover:text-cream/50 transition-colors">Klik untuk upload gambar QRIS</p>
              <p className="font-sans text-xs text-cream/15 mt-1">JPG, PNG, atau WebP · Maks. 3MB</p>
            </div>
          </button>
        )}
        <input ref={qrisInputRef} type="file" accept="image/*" onChange={handleQrisUpload} className="hidden" />
      </div>

      {/* Rekening Bank */}
      <div className="glass p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 size={15} className="text-gold/70" />
            <h2 className="font-sans text-xs tracking-widest uppercase text-gold/70">Rekening Bank</h2>
          </div>
          <button
            onClick={() => setShowAddBank((v) => !v)}
            className="flex items-center gap-1.5 font-sans text-[10px] tracking-widest uppercase text-gold/60 hover:text-gold border border-gold/20 hover:border-gold/40 px-3 py-1.5 transition-all"
          >
            <Plus size={12} /> Tambah Rekening
          </button>
        </div>

        {showAddBank && (
          <form onSubmit={addBankAccount} className="border border-white/10 p-4 space-y-3 bg-white/[0.02]">
            <p className="font-sans text-[10px] tracking-widest uppercase text-cream/40">Rekening Baru</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-sans text-[10px] tracking-widest uppercase text-cream/30 block mb-1">Nama Bank</label>
                <select
                  value={newBank.bankName}
                  onChange={(e) => setNewBank((p) => ({ ...p, bankName: e.target.value }))}
                  className="input-luxury w-full text-sm"
                >
                  <option value="" className="bg-obsidian-3">Pilih bank</option>
                  {['BCA', 'BNI', 'BRI', 'Mandiri', 'CIMB Niaga', 'Permata', 'BSI', 'Jenius (SMBC)', 'SeaBank', 'GoPay', 'OVO', 'DANA'].map((b) => (
                    <option key={b} value={b} className="bg-obsidian-3">{b}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-sans text-[10px] tracking-widest uppercase text-cream/30 block mb-1">Nomor Rekening</label>
                <input type="text" value={newBank.accountNumber} onChange={(e) => setNewBank((p) => ({ ...p, accountNumber: e.target.value }))} placeholder="1234567890" className="input-luxury w-full text-sm font-mono" />
              </div>
              <div>
                <label className="font-sans text-[10px] tracking-widest uppercase text-cream/30 block mb-1">Nama Pemilik</label>
                <input type="text" value={newBank.accountName} onChange={(e) => setNewBank((p) => ({ ...p, accountName: e.target.value }))} placeholder="Nama sesuai rekening" className="input-luxury w-full text-sm" />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button type="submit" className="btn-luxury px-4 py-2 text-xs flex items-center gap-1.5"><Save size={12} /> Simpan</button>
              <button type="button" onClick={() => setShowAddBank(false)} className="btn-luxury-outline px-4 py-2 text-xs">Batal</button>
            </div>
          </form>
        )}

        {bankAccounts.length === 0 && !showAddBank ? (
          <div className="text-center py-8">
            <Building2 size={28} className="text-cream/10 mx-auto mb-3" />
            <p className="font-sans text-sm text-cream/25">Belum ada rekening bank</p>
            <p className="font-sans text-xs text-cream/15 mt-1">Tambahkan rekening untuk menerima transfer</p>
          </div>
        ) : (
          <div className="space-y-2">
            {bankAccounts.map((b) => (
              <div key={b.id} className="flex items-center justify-between py-3 px-3 bg-white/[0.02] border border-white/[0.06] group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gold/10 border border-gold/15 flex items-center justify-center flex-shrink-0">
                    <span className="font-sans text-[9px] font-bold text-gold/70 text-center leading-tight">{b.bankName.slice(0, 4)}</span>
                  </div>
                  <div>
                    <p className="font-sans text-sm text-cream">{b.bankName}</p>
                    <p className="font-mono text-xs text-cream/50">{b.accountNumber}</p>
                    <p className="font-sans text-[10px] text-cream/30">{b.accountName}</p>
                  </div>
                </div>
                <button onClick={() => deleteBankAccount(b.id)} className="text-cream/15 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Metode Pembayaran */}
      <div className="glass p-6 space-y-4">
        <h2 className="font-sans text-xs tracking-widest uppercase text-gold/70">Metode Pembayaran Aktif</h2>
        <div className="space-y-3">
          {[
            { key: 'midtransActive', label: 'Midtrans (QRIS, VA, Kartu)', desc: 'Payment gateway — butuh API key' },
            { key: 'qrisActive', label: 'QRIS Static', desc: 'Tampilkan gambar QRIS yang diupload di atas' },
            { key: 'bankTransferActive', label: 'Transfer Bank', desc: 'Tampilkan rekening bank yang ditambahkan di atas' },
            { key: 'codActive', label: 'COD (Bayar di Tempat)', desc: 'Cash on delivery' },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between py-3 border-b border-white/[0.04] last:border-0">
              <div>
                <p className="font-sans text-sm text-cream">{label}</p>
                <p className="font-sans text-[10px] text-cream/30">{desc}</p>
              </div>
              <button
                onClick={() => setPayment((p) => ({ ...p, [key]: !p[key as keyof typeof p] }))}
                className={`relative w-10 h-5 rounded-full transition-colors duration-300 ${payment[key as keyof typeof payment] ? 'bg-gold' : 'bg-white/10'}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-obsidian transition-all duration-300 ${payment[key as keyof typeof payment] ? 'left-5' : 'left-0.5'}`} />
              </button>
            </div>
          ))}
        </div>
        <button onClick={savePayment} className="btn-luxury flex items-center gap-2 px-5 py-2.5 text-xs">
          <Save size={13} /> Simpan Metode Pembayaran
        </button>
      </div>

      {/* API Keys */}
      <div className="glass p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-sans text-xs tracking-widest uppercase text-gold/70">API Keys</h2>
          <button
            onClick={() => setShowKey((v) => !v)}
            className="flex items-center gap-1.5 font-sans text-[10px] text-cream/40 hover:text-cream transition-colors"
          >
            {showKey ? <EyeOff size={12} /> : <Eye size={12} />}
            {showKey ? 'Sembunyikan' : 'Tampilkan'}
          </button>
        </div>
        <p className="font-sans text-xs text-cream/30">
          API keys dikelola melalui environment variables di Cloudflare Dashboard atau file{' '}
          <code className="text-gold/60">.dev.vars</code>.
        </p>
        <div className="space-y-2">
          {[
            { label: 'Midtrans Server Key', env: 'MIDTRANS_SERVER_KEY' },
            { label: 'Biteship API Key', env: 'BITESHIP_API_KEY' },
            { label: 'Resend API Key', env: 'RESEND_API_KEY' },
          ].map(({ label, env }) => (
            <div key={env} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
              <span className="font-sans text-xs text-cream/60">{label}</span>
              <code className="font-mono text-[10px] text-cream/30">
                {showKey ? `process.env.${env}` : '••••••••••••••••'}
              </code>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
