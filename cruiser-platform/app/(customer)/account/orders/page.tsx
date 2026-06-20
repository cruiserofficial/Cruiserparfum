'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Package, ExternalLink } from 'lucide-react'
import { getTrackingUrl } from '@/lib/tracking'
import { formatPrice, formatDate } from '@/lib/utils'
import { useCustomerOrderStore } from '@/features/orders/orderStore'

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  pending: { label: 'Menunggu', cls: 'text-cream/40 border-white/10' },
  processing: { label: 'Diproses', cls: 'text-blue-400 border-blue-400/30 bg-blue-400/5' },
  shipped: { label: 'Dikirim', cls: 'text-purple-400 border-purple-400/30 bg-purple-400/5' },
  delivered: { label: 'Diterima', cls: 'text-gold border-gold/30 bg-gold/5' },
  cancelled: { label: 'Dibatalkan', cls: 'text-red-400 border-red-400/30 bg-red-400/5' },
}

interface OrderItem {
  name: string
  quantity: number
  price: number
  imageUrl?: string | null
}

interface OrderData {
  id: string
  number: string
  status: string
  total: number
  subtotal: number
  shippingCost: number
  createdAt?: string
  date?: string
  city: string
  province: string
  shippingMethod: string
  courier?: string | null
  trackingNumber?: string | null
  items: OrderItem[]
}

export default function OrdersPage() {
  const localOrders = useCustomerOrderStore((s) => s.orders)
  const [dbOrders, setDbOrders] = useState<OrderData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Try to fetch orders from DB for logged-in users
    async function fetchDbOrders() {
      try {
        const res = await fetch('/api/account/orders')
        if (res.ok) {
          const { orders } = await res.json()
          setDbOrders(orders ?? [])
        }
      } catch {
        // Not logged in or API not available — fall back to localStorage only
      } finally {
        setLoading(false)
      }
    }
    fetchDbOrders()
  }, [])

  // Merge DB orders with localStorage orders, deduplicating by order number
  const allOrders = [...dbOrders]
  for (const lo of localOrders) {
    if (!allOrders.find((o) => o.number === lo.number)) {
      allOrders.push({
        id: lo.id,
        number: lo.number,
        status: lo.status,
        total: lo.total,
        subtotal: lo.subtotal,
        shippingCost: lo.shippingCost,
        date: lo.date,
        city: lo.city,
        province: lo.province,
        shippingMethod: lo.shippingMethod ?? '',
        courier: lo.courier,
        trackingNumber: lo.trackingNumber,
        items: lo.items,
      })
    }
  }

  // Sort by date descending
  allOrders.sort((a, b) => {
    const aDate = a.createdAt ?? a.date ?? ''
    const bDate = b.createdAt ?? b.date ?? ''
    return bDate.localeCompare(aDate)
  })

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container max-w-3xl mx-auto px-6">
        <Link href="/account" className="flex items-center gap-2 font-sans text-xs text-cream/40 hover:text-cream transition-colors mb-8">
          <ArrowLeft size={13} /> Kembali ke akun
        </Link>

        <h1 className="font-display text-3xl text-cream mb-8">Pesanan Saya</h1>

        {allOrders.length === 0 ? (
          <div className="glass text-center py-16">
            <Package size={40} className="text-cream/10 mx-auto mb-4" />
            <p className="font-display text-xl text-cream/30 mb-2">Belum ada pesanan</p>
            <p className="font-sans text-xs text-cream/20 mb-6">Pesanan yang kamu buat akan muncul di sini</p>
            <Link href="/shop" className="btn-luxury inline-flex">Belanja Sekarang</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {allOrders.map((order) => {
              const s = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending
              const orderDate = order.createdAt ?? order.date ?? ''
              return (
                <div key={order.id} className="glass p-5">
                  <div className="flex items-center justify-between flex-wrap gap-4 mb-4 pb-4 border-b border-white/[0.06]">
                    <div>
                      <p className="font-sans text-sm text-cream">{order.number}</p>
                      <p className="font-sans text-xs text-cream/40">{formatDate(orderDate)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`font-sans text-[9px] tracking-widest uppercase px-2.5 py-1 border ${s.cls}`}>
                        {s.label}
                      </span>
                      <span className="font-display text-lg text-cream">{formatPrice(order.total)}</span>
                    </div>
                  </div>

                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between items-center mb-3">
                      <div>
                        <p className="font-sans text-sm text-cream">{item.name} × {item.quantity}</p>
                        <p className="font-sans text-xs text-cream/40">50ml Extrait De Parfum</p>
                      </div>
                      <p className="font-sans text-sm text-cream/70">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}

                  <div className="mt-3 pt-3 border-t border-white/[0.06] space-y-1">
                    <p className="font-sans text-[10px] text-cream/30">
                      Pengiriman ke: <span className="text-cream/50">{order.city}, {order.province}</span>
                    </p>
                    {order.shippingMethod && (
                      <p className="font-sans text-[10px] text-cream/30">
                        Kurir: <span className="text-cream/50">{order.shippingMethod}</span>
                      </p>
                    )}
                  </div>

                  {order.trackingNumber ? (
                    <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center justify-between">
                      <div>
                        <p className="font-sans text-xs text-cream/40">
                          Kurir: <span className="text-cream/60">{order.courier ?? order.shippingMethod}</span>
                        </p>
                        <p className="font-sans text-xs text-cream/40 mt-0.5">
                          Resi: <span className="font-mono text-cream/70">{order.trackingNumber}</span>
                        </p>
                      </div>
                      <a
                        href={getTrackingUrl(order.trackingNumber, order.courier ?? undefined)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 font-sans text-xs text-gold/70 hover:text-gold transition-colors border border-gold/20 hover:border-gold/40 px-3 py-1.5"
                      >
                        Lacak Paket
                        <ExternalLink size={11} />
                      </a>
                    </div>
                  ) : (
                    <div className="mt-3 pt-3 border-t border-white/[0.06]">
                      <p className="font-sans text-[10px] text-cream/25 italic">
                        Nomor resi belum tersedia — akan kami update segera setelah paket dikirim
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
