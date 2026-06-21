'use client'

import { useState, useEffect, useCallback } from 'react'
import { Package, MessageCircle, Truck, X, CheckCircle2, ExternalLink, Plus, ChevronDown } from 'lucide-react'
import { getTrackingUrl, buildTrackingWhatsApp } from '@/lib/tracking'
import { formatPrice, formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

interface OrderItem {
  id: string
  productId: string
  name: string
  quantity: number
  price: number
  imageUrl?: string | null
}

interface Order {
  id: string
  number: string
  email: string
  recipient: string
  phone: string
  address: string
  city: string
  province: string
  postalCode: string
  notes?: string | null
  shippingMethod: string
  courier?: string | null
  shippingCost: number
  subtotal: number
  total: number
  paymentMethod: string
  status: OrderStatus
  trackingNumber?: string | null
  isGuest: boolean
  userId?: string | null
  paymentProofUrl?: string | null
  paymentConfirmedAt?: string | null
  customerConfirmedAt?: string | null
  courierCode?: string | null
  serviceCode?: string | null
  biteshipOrderId?: string | null
  biteshipError?: string | null
  createdAt: string
  updatedAt: string
  items: OrderItem[]
}

const STATUS_OPTIONS: { value: OrderStatus; label: string; cls: string }[] = [
  { value: 'pending', label: 'Pending', cls: 'text-cream/40 border-white/10' },
  { value: 'processing', label: 'Diproses', cls: 'text-blue-400 border-blue-400/30 bg-blue-400/5' },
  { value: 'shipped', label: 'Dikirim', cls: 'text-purple-400 border-purple-400/30 bg-purple-400/5' },
  { value: 'delivered', label: 'Diterima', cls: 'text-gold border-gold/30 bg-gold/5' },
  { value: 'cancelled', label: 'Dibatalkan', cls: 'text-red-400 border-red-400/30 bg-red-400/5' },
]

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [resiInput, setResiInput] = useState('')
  const [courierInput, setCourierInput] = useState('')
  const [showAddOrder, setShowAddOrder] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [newOrder, setNewOrder] = useState({
    recipient: '', phone: '', email: '', address: '', city: '', province: '', postalCode: '',
    productName: '', quantity: 1, total: 299000, shippingMethod: 'JNE REG', notes: '', isGuest: true,
  })

  const loadOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/orders')
      if (!res.ok) throw new Error('Failed to load')
      const { orders: data } = await res.json()
      setOrders(data)
    } catch {
      toast.error('Gagal memuat pesanan')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  useEffect(() => {
    if (selectedOrder) {
      setResiInput(selectedOrder.trackingNumber ?? '')
      setCourierInput(selectedOrder.courier ?? selectedOrder.shippingMethod ?? '')
    }
  }, [selectedOrder])

  async function handleUpdateStatus(orderNumber: string, status: OrderStatus) {
    try {
      const res = await fetch(`/api/admin/orders/${orderNumber}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error('Failed')
      setOrders((prev) =>
        prev.map((o) => o.number === orderNumber ? { ...o, status } : o)
      )
      toast.success(`Status diubah ke ${STATUS_OPTIONS.find((s) => s.value === status)?.label}`)
    } catch {
      toast.error('Gagal mengubah status')
    }
  }

  async function handleSaveResi() {
    if (!selectedOrder) return
    if (!resiInput.trim()) { toast.error('Masukkan nomor resi'); return }
    if (!courierInput.trim()) { toast.error('Masukkan nama kurir'); return }
    try {
      const res = await fetch(`/api/admin/orders/${selectedOrder.number}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trackingNumber: resiInput.trim(),
          courier: courierInput.trim(),
          status: 'shipped',
        }),
      })
      if (!res.ok) throw new Error('Failed')
      setOrders((prev) =>
        prev.map((o) =>
          o.number === selectedOrder.number
            ? { ...o, trackingNumber: resiInput.trim(), courier: courierInput.trim(), status: 'shipped' }
            : o
        )
      )
      toast.success(`Resi ${resiInput} disimpan untuk ${selectedOrder.number}`)
      setSelectedOrder(null)
    } catch {
      toast.error('Gagal menyimpan resi')
    }
  }

  async function handleConfirmPayment(order: Order) {
    try {
      const res = await fetch(`/api/admin/orders/${order.number}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmPayment: true }),
      })
      if (!res.ok) throw new Error('Failed')
      const { order: updatedOrder } = await res.json()
      setOrders((prev) =>
        prev.map((o) =>
          o.number === order.number ? { ...o, ...updatedOrder } : o
        )
      )
      if (updatedOrder?.biteshipOrderId) {
        toast.success(`Pembayaran ${order.number} dikonfirmasi & pengiriman Biteship dibuat otomatis`)
      } else if (updatedOrder?.biteshipError) {
        toast.success(`Pembayaran ${order.number} dikonfirmasi — masuk Total Revenue`)
        toast.error(`Biteship gagal: ${updatedOrder.biteshipError}`)
      } else {
        toast.success(`Pembayaran ${order.number} dikonfirmasi — masuk Total Revenue`)
      }
    } catch {
      toast.error('Gagal konfirmasi pembayaran')
    }
  }

  async function handleMarkDelivered(order: Order) {
    try {
      const res = await fetch(`/api/admin/orders/${order.number}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'delivered' }),
      })
      if (!res.ok) throw new Error('Failed')
      setOrders((prev) => prev.map((o) => o.number === order.number ? { ...o, status: 'delivered' } : o))
      toast.success(`${order.number} ditandai selesai`)
    } catch {
      toast.error('Gagal menandai selesai')
    }
  }

  function handleSendWA(order: Order) {
    if (!order.trackingNumber) { toast.error('Input resi dulu sebelum kirim WA'); return }
    const url = buildTrackingWhatsApp(order.phone, order.recipient, order.number, order.trackingNumber, order.courier ?? order.shippingMethod ?? '')
    window.open(url, '_blank')
  }

  async function handleAddOrder(e: React.FormEvent) {
    e.preventDefault()
    const date = new Date().toISOString().split('T')[0]
    const number = `CRS-${date.slice(2).replace(/-/g, '')}${Math.floor(Math.random() * 9000) + 1000}`
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newOrder.email || 'manual@cruiser.id',
          recipient: newOrder.recipient,
          phone: newOrder.phone,
          address: newOrder.address,
          city: newOrder.city,
          province: newOrder.province,
          postalCode: newOrder.postalCode,
          notes: newOrder.notes,
          shippingMethod: newOrder.shippingMethod,
          paymentMethod: 'bank_transfer',
          items: [{ productId: newOrder.productName.toLowerCase(), name: newOrder.productName, quantity: newOrder.quantity, price: Math.round(newOrder.total / newOrder.quantity) }],
          subtotal: newOrder.total,
          shippingCost: 0,
          total: newOrder.total,
        }),
      })
      if (!res.ok) throw new Error('Failed')
      toast.success(`Order ${number} ditambahkan`)
      setShowAddOrder(false)
      setNewOrder({ recipient: '', phone: '', email: '', address: '', city: '', province: '', postalCode: '', productName: '', quantity: 1, total: 299000, shippingMethod: 'JNE REG', notes: '', isGuest: true })
      await loadOrders()
    } catch {
      toast.error('Gagal menambah order')
    }
  }

  const filtered = filterStatus === 'all' ? orders : orders.filter((o) => o.status === filterStatus)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl text-cream">Orders</h1>
          <p className="font-sans text-xs text-cream/40 mt-1">{orders.length} total pesanan</p>
        </div>
        <button
          onClick={() => setShowAddOrder(true)}
          className="btn-luxury flex items-center gap-2 px-4 py-2.5 text-xs"
        >
          <Plus size={13} /> Tambah Order Manual
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {[{ value: 'all', label: 'Semua' }, ...STATUS_OPTIONS].map((s) => (
          <button
            key={s.value}
            onClick={() => setFilterStatus(s.value)}
            className={`font-sans text-[10px] tracking-widest uppercase px-3 py-1.5 border transition-all ${
              filterStatus === s.value
                ? 'border-gold/50 bg-gold/10 text-gold'
                : 'border-white/10 text-cream/40 hover:border-white/20'
            }`}
          >
            {s.label}
            {s.value !== 'all' && (
              <span className="ml-1.5 text-cream/20">
                {orders.filter((o) => o.status === s.value).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Orders list */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="glass text-center py-12">
            <Package size={32} className="text-cream/10 mx-auto mb-3" />
            <p className="font-sans text-sm text-cream/30">Tidak ada pesanan</p>
          </div>
        )}

        {filtered.map((order) => {
          const s = STATUS_OPTIONS.find((x) => x.value === order.status) ?? STATUS_OPTIONS[0]
          return (
            <div key={order.id} className="glass p-4 hover:border-white/10 transition-colors relative hover:z-10">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-1">
                    <span className="font-sans text-sm text-cream">{order.number}</span>
                    <span className={`font-sans text-[9px] tracking-widest uppercase px-2 py-0.5 border ${s.cls}`}>
                      {s.label}
                    </span>
                    {order.isGuest && (
                      <span className="font-sans text-[9px] tracking-widest uppercase text-cream/20 border border-white/[0.06] px-2 py-0.5">
                        Guest
                      </span>
                    )}
                  </div>
                  <p className="font-sans text-xs text-cream/60">{order.recipient} · {order.phone}</p>
                  <p className="font-sans text-[10px] text-cream/30">{order.city}, {order.province} · {formatDate(order.createdAt)}</p>
                  <p className="font-sans text-[10px] text-cream/30 mt-0.5">
                    {order.items.map((i) => `${i.name} ×${i.quantity}`).join(', ')} · {formatPrice(order.total)}
                  </p>
                  {order.trackingNumber && (
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="font-sans text-[10px] text-cream/30">Resi:</span>
                      <a
                        href={getTrackingUrl(order.trackingNumber, order.courier ?? undefined)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-[10px] text-gold/60 hover:text-gold flex items-center gap-1"
                      >
                        {order.trackingNumber} <ExternalLink size={9} />
                      </a>
                      <span className="font-sans text-[10px] text-cream/20">({order.courier})</span>
                    </div>
                  )}
                  {order.paymentMethod === 'bank_transfer' && order.paymentProofUrl && (
                    <a
                      href={order.paymentProofUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 mt-1.5 font-sans text-[10px] text-blue-400/80 hover:text-blue-400"
                    >
                      <ExternalLink size={9} /> Lihat bukti transfer
                    </a>
                  )}
                  {order.paymentMethod === 'bank_transfer' && !order.paymentProofUrl && !order.paymentConfirmedAt && (
                    <p className="font-sans text-[10px] text-amber-400/70 mt-1.5">Menunggu bukti transfer dari pelanggan</p>
                  )}
                  {order.customerConfirmedAt && (
                    <p className="font-sans text-[10px] text-emerald-400/70 mt-1.5">✓ Pelanggan sudah konfirmasi pesanan diterima</p>
                  )}
                  {order.biteshipOrderId && (
                    <p className="font-sans text-[10px] text-emerald-400/70 mt-1.5">✓ Pengiriman Biteship dibuat otomatis</p>
                  )}
                  {order.biteshipError && !order.biteshipOrderId && (
                    <p className="font-sans text-[10px] text-amber-400/70 mt-1.5">⚠ Biteship gagal: {order.biteshipError}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {!order.paymentConfirmedAt && (
                    <button
                      onClick={() => handleConfirmPayment(order)}
                      className="flex items-center gap-1.5 font-sans text-[10px] tracking-widest uppercase text-emerald-400/80 hover:text-emerald-400 border border-emerald-400/30 hover:border-emerald-400/60 px-3 py-2 transition-all"
                    >
                      <CheckCircle2 size={12} />
                      Proses
                    </button>
                  )}

                  {order.status === 'shipped' && (
                    <button
                      onClick={() => handleMarkDelivered(order)}
                      className="flex items-center gap-1.5 font-sans text-[10px] tracking-widest uppercase text-gold/80 hover:text-gold border border-gold/30 hover:border-gold/60 px-3 py-2 transition-all"
                    >
                      <CheckCircle2 size={12} />
                      Selesai
                    </button>
                  )}

                  {/* Status dropdown */}
                  <div className="relative group">
                    <button className="flex items-center gap-1.5 font-sans text-[10px] text-cream/40 hover:text-cream border border-white/10 hover:border-white/20 px-3 py-2 transition-all">
                      Status <ChevronDown size={11} />
                    </button>
                    <div className="absolute right-0 top-full mt-1 w-40 bg-[#111] border border-white/10 z-20 hidden group-hover:block">
                      {STATUS_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => handleUpdateStatus(order.number, opt.value)}
                          className={`w-full text-left px-3 py-2 font-sans text-[10px] tracking-widest uppercase hover:bg-white/5 transition-colors ${opt.cls} border-0 bg-transparent`}
                        >
                          {order.status === opt.value && <span className="mr-1">✓</span>}
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="flex items-center gap-1.5 font-sans text-[10px] tracking-widest uppercase text-gold/60 hover:text-gold border border-gold/20 hover:border-gold/50 px-3 py-2 transition-all"
                  >
                    <Truck size={12} />
                    {order.trackingNumber ? 'Edit Resi' : 'Input Resi'}
                  </button>

                  <button
                    onClick={() => handleSendWA(order)}
                    className={`flex items-center gap-1.5 font-sans text-[10px] tracking-widest uppercase px-3 py-2 border transition-all ${
                      order.trackingNumber
                        ? 'text-emerald-400 border-emerald-400/30 hover:border-emerald-400/60 bg-emerald-400/5'
                        : 'text-cream/20 border-white/[0.06] cursor-not-allowed'
                    }`}
                  >
                    <MessageCircle size={12} />
                    Kirim WA
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal: Input Resi */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelectedOrder(null)}>
          <div className="absolute inset-0 bg-obsidian/80 backdrop-blur-md" />
          <div
            className="relative w-full max-w-md bg-[#111] border border-white/10 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl text-cream">Input Resi Pengiriman</h2>
              <button onClick={() => setSelectedOrder(null)} className="text-cream/30 hover:text-cream">
                <X size={18} />
              </button>
            </div>

            <div className="bg-white/[0.03] border border-white/[0.06] p-3 mb-5 space-y-1">
              <p className="font-sans text-xs text-cream">{selectedOrder.number}</p>
              <p className="font-sans text-[10px] text-cream/40">{selectedOrder.recipient} · {selectedOrder.phone}</p>
              <p className="font-sans text-[10px] text-cream/40">{selectedOrder.address}, {selectedOrder.city}</p>
              <p className="font-sans text-[10px] text-cream/40">
                {selectedOrder.items.map((i) => `${i.name} ×${i.quantity}`).join(', ')} · {formatPrice(selectedOrder.total)}
              </p>
              <p className="font-sans text-[10px] text-cream/30">Metode: {selectedOrder.shippingMethod}</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="font-sans text-[11px] tracking-widest uppercase text-cream/40 block mb-1.5">Nama Kurir *</label>
                <select
                  value={courierInput}
                  onChange={(e) => setCourierInput(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/10 focus:border-gold/50 outline-none px-3 py-2.5 font-sans text-sm text-cream"
                >
                  <option value="" className="bg-obsidian-3">-- Pilih Kurir --</option>
                  {['JNE REG', 'JNE YES', 'J&T EZ', 'SiCepat BEST', 'SiCepat Same Day', 'AnterAja REG', 'Pos Indonesia', 'TIKI REG'].map((k) => (
                    <option key={k} value={k} className="bg-obsidian-3">{k}</option>
                  ))}
                </select>
                {courierInput === '' && (
                  <input
                    type="text"
                    value={courierInput}
                    onChange={(e) => setCourierInput(e.target.value)}
                    placeholder="Atau ketik nama kurir..."
                    className="mt-2 w-full bg-white/[0.04] border border-white/10 focus:border-gold/50 outline-none px-3 py-2.5 font-sans text-sm text-cream placeholder:text-cream/20"
                  />
                )}
              </div>
              <div>
                <label className="font-sans text-[11px] tracking-widest uppercase text-cream/40 block mb-1.5">Nomor Resi *</label>
                <input
                  type="text"
                  value={resiInput}
                  onChange={(e) => setResiInput(e.target.value.toUpperCase())}
                  placeholder="Contoh: JNE123456789"
                  className="w-full bg-white/[0.04] border border-white/10 focus:border-gold/50 outline-none px-3 py-2.5 font-mono text-sm text-cream placeholder:text-cream/20"
                />
              </div>

              {resiInput && courierInput && (
                <div className="bg-gold/5 border border-gold/10 p-3">
                  <p className="font-sans text-[10px] text-cream/40 mb-1">Preview link lacak:</p>
                  <a
                    href={getTrackingUrl(resiInput, courierInput)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-sans text-xs text-gold/70 hover:text-gold flex items-center gap-1 break-all"
                  >
                    {getTrackingUrl(resiInput, courierInput)}
                    <ExternalLink size={10} className="flex-shrink-0" />
                  </a>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setSelectedOrder(null)}
                className="flex-1 py-2.5 border border-white/10 text-cream/40 hover:text-cream font-sans text-xs transition-all"
              >
                Batal
              </button>
              <button
                onClick={handleSaveResi}
                className="flex-1 btn-luxury py-2.5 flex items-center justify-center gap-2 font-sans text-xs"
              >
                <CheckCircle2 size={13} />
                Simpan & Update Status
              </button>
            </div>

            {resiInput && courierInput && (
              <div className="mt-4 border-t border-white/[0.06] pt-4">
                <p className="font-sans text-[10px] text-cream/30 mb-2">Preview pesan WhatsApp:</p>
                <div className="bg-white/[0.02] p-3 border border-white/[0.06]">
                  <p className="font-sans text-[11px] text-cream/50 whitespace-pre-line leading-relaxed">
                    {`Halo ${selectedOrder.recipient} 👋\n\nPesanan kamu *${selectedOrder.number}* sudah kami kirim! 🎁\n\n📦 Kurir: *${courierInput.toUpperCase()}*\n🔢 No. Resi: *${resiInput}*\n\nLacak paket kamu di:\n${getTrackingUrl(resiInput, courierInput)}`}
                  </p>
                </div>
                <button
                  onClick={() => {
                    handleSaveResi().then(() => {
                      const url = buildTrackingWhatsApp(selectedOrder.phone, selectedOrder.recipient, selectedOrder.number, resiInput, courierInput)
                      window.open(url, '_blank')
                    })
                  }}
                  className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 font-sans text-xs tracking-widest uppercase transition-all"
                >
                  <MessageCircle size={13} />
                  Simpan & Kirim WA Sekarang
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Tambah Order Manual */}
      {showAddOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setShowAddOrder(false)}>
          <div className="absolute inset-0 bg-obsidian/80 backdrop-blur-md" />
          <form
            className="relative w-full max-w-lg bg-[#111] border border-white/10 p-6 my-8"
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleAddOrder}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl text-cream">Tambah Order Manual</h2>
              <button type="button" onClick={() => setShowAddOrder(false)} className="text-cream/30 hover:text-cream">
                <X size={18} />
              </button>
            </div>
            <p className="font-sans text-xs text-cream/30 mb-5">
              Untuk order yang masuk via WA, DM Instagram, atau cara lain selain website.
            </p>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Nama Penerima *', key: 'recipient', type: 'text', col: 2 },
                { label: 'No. WhatsApp *', key: 'phone', type: 'tel', col: 1 },
                { label: 'Email', key: 'email', type: 'email', col: 1 },
                { label: 'Produk *', key: 'productName', type: 'text', placeholder: 'Eternity / Noctis / Liberea', col: 1 },
                { label: 'Qty', key: 'quantity', type: 'number', col: 1 },
                { label: 'Total (Rp) *', key: 'total', type: 'number', col: 1 },
                { label: 'Metode Kirim', key: 'shippingMethod', type: 'text', col: 1 },
                { label: 'Alamat *', key: 'address', type: 'text', col: 2 },
                { label: 'Kota *', key: 'city', type: 'text', col: 1 },
                { label: 'Provinsi', key: 'province', type: 'text', col: 1 },
                { label: 'Kode Pos', key: 'postalCode', type: 'text', col: 1 },
                { label: 'Catatan', key: 'notes', type: 'text', col: 1 },
              ].map(({ label, key, type, col, placeholder }) => (
                <div key={key} className={col === 2 ? 'col-span-2' : 'col-span-1'}>
                  <label className="font-sans text-[10px] tracking-widest uppercase text-cream/40 block mb-1">{label}</label>
                  <input
                    type={type}
                    placeholder={placeholder}
                    value={(newOrder as Record<string, unknown>)[key] as string}
                    onChange={(e) => setNewOrder((p) => ({ ...p, [key]: type === 'number' ? Number(e.target.value) : e.target.value }))}
                    className="w-full bg-white/[0.04] border border-white/10 focus:border-gold/50 outline-none px-3 py-2 font-sans text-xs text-cream placeholder:text-cream/15"
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-5">
              <button type="button" onClick={() => setShowAddOrder(false)} className="flex-1 py-2.5 border border-white/10 text-cream/40 font-sans text-xs">
                Batal
              </button>
              <button type="submit" className="flex-1 btn-luxury py-2.5 font-sans text-xs">
                Tambah Order
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
