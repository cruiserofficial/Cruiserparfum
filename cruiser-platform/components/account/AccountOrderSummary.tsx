'use client'

import Link from 'next/link'
import { Package, ExternalLink } from 'lucide-react'
import { useCustomerOrderStore } from '@/features/orders/orderStore'
import { getTrackingUrl } from '@/lib/tracking'
import { formatDate, formatPrice } from '@/lib/utils'

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  pending: { label: 'Pending', cls: 'text-cream/40 border-white/10' },
  processing: { label: 'Diproses', cls: 'text-blue-400 border-blue-400/30 bg-blue-400/5' },
  shipped: { label: 'Dikirim', cls: 'text-purple-400 border-purple-400/30 bg-purple-400/5' },
  delivered: { label: 'Diterima', cls: 'text-gold border-gold/30 bg-gold/5' },
  cancelled: { label: 'Dibatalkan', cls: 'text-red-400 border-red-400/30 bg-red-400/5' },
}

export function AccountOrderSummary() {
  const orders = useCustomerOrderStore((s) => s.orders)
  const recent = orders.slice(0, 3)

  if (orders.length === 0) {
    return (
      <div className="glass p-10 text-center">
        <Package size={36} className="text-cream/10 mx-auto mb-4" />
        <p className="font-sans text-sm text-cream/30">Belum ada pesanan</p>
        <Link href="/shop" className="btn-luxury inline-flex mt-5 text-xs px-6 py-2.5">
          Belanja Sekarang
        </Link>
      </div>
    )
  }

  return (
    <div className="glass p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-sans text-xs tracking-widest uppercase text-gold/70">Pesanan Terakhir</h2>
        <Link href="/account/orders" className="font-sans text-xs text-cream/40 hover:text-cream transition-colors">
          Lihat semua →
        </Link>
      </div>

      <div className="space-y-4">
        {recent.map((order) => {
          const s = STATUS_LABEL[order.status] ?? STATUS_LABEL.pending
          const itemLabel = order.items.length === 1
            ? `${order.items[0].name} ×${order.items[0].quantity}`
            : `${order.items.length} produk`
          return (
            <div key={order.number} className="flex items-center justify-between py-3 border-b border-white/[0.04] last:border-0 gap-4">
              <div className="min-w-0">
                <p className="font-sans text-xs text-cream truncate">{order.number}</p>
                <p className="font-sans text-[10px] text-cream/40">{itemLabel} · {formatDate(order.date)}</p>
                {order.trackingNumber && (
                  <a
                    href={getTrackingUrl(order.trackingNumber, order.courier)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-sans text-[10px] text-gold/60 hover:text-gold mt-0.5 transition-colors"
                  >
                    Lacak · {order.trackingNumber}
                    <ExternalLink size={9} />
                  </a>
                )}
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className={`font-sans text-[9px] tracking-widest uppercase px-2 py-1 border ${s.cls}`}>
                  {s.label}
                </span>
                <span className="font-sans text-xs text-cream">{formatPrice(order.total)}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
