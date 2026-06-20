import type { Metadata } from 'next'
import { TrendingUp, ShoppingCart, DollarSign, Package } from 'lucide-react'
import { getDb } from '@/lib/db/index'
import { orders, orderItems } from '@/lib/db/schema'
import { and, gte, isNotNull, sql } from 'drizzle-orm'
import { formatPrice } from '@/lib/utils'

export const metadata: Metadata = { title: 'Analytics — Admin' }
export const dynamic = 'force-dynamic'

async function getAnalytics() {
  try {
    const db = await getDb()
    const monthStart = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1)).toISOString()

    const [totalRevenueRow] = await db
      .select({ total: sql<number>`coalesce(sum(${orders.total}), 0)` })
      .from(orders)
      .where(isNotNull(orders.paymentConfirmedAt))

    const [totalOrdersRow] = await db
      .select({ count: sql<number>`count(*)` })
      .from(orders)

    const [monthRevenueRow] = await db
      .select({ total: sql<number>`coalesce(sum(${orders.total}), 0)` })
      .from(orders)
      .where(and(isNotNull(orders.paymentConfirmedAt), gte(orders.createdAt, monthStart)))

    const [monthOrdersRow] = await db
      .select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(gte(orders.createdAt, monthStart))

    const productBreakdown = await db
      .select({
        name: orderItems.name,
        sold: sql<number>`coalesce(sum(${orderItems.quantity}), 0)`,
      })
      .from(orderItems)
      .innerJoin(orders, sql`${orderItems.orderId} = ${orders.id}`)
      .where(isNotNull(orders.paymentConfirmedAt))
      .groupBy(orderItems.name)

    return {
      totalRevenue: totalRevenueRow?.total ?? 0,
      totalOrders: totalOrdersRow?.count ?? 0,
      monthRevenue: monthRevenueRow?.total ?? 0,
      monthOrders: monthOrdersRow?.count ?? 0,
      productBreakdown,
    }
  } catch (e) {
    console.error('Analytics data error:', e)
    return { totalRevenue: 0, totalOrders: 0, monthRevenue: 0, monthOrders: 0, productBreakdown: [] }
  }
}

export default async function AnalyticsPage() {
  const data = await getAnalytics()
  const maxSold = Math.max(1, ...data.productBreakdown.map((p) => p.sold))

  const kpis = [
    { label: 'Revenue Bulan Ini', value: formatPrice(data.monthRevenue), icon: DollarSign, color: 'text-gold', bg: 'bg-gold/10' },
    { label: 'Orders Bulan Ini', value: String(data.monthOrders), icon: ShoppingCart, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { label: 'Total Revenue', value: formatPrice(data.totalRevenue), icon: TrendingUp, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'Total Orders', value: String(data.totalOrders), icon: Package, color: 'text-purple-400', bg: 'bg-purple-400/10' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-cream">Analytics</h1>
        <p className="font-sans text-xs text-cream/40 mt-1">Performa penjualan toko CRUISER</p>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon
          return (
            <div key={kpi.label} className="glass p-5">
              <div className={`w-9 h-9 ${kpi.bg} flex items-center justify-center mb-3`}>
                <Icon size={16} className={kpi.color} />
              </div>
              <p className="font-display text-xl text-cream">{kpi.value}</p>
              <p className="font-sans text-[10px] tracking-widest uppercase text-cream/40 mt-1">{kpi.label}</p>
            </div>
          )
        })}
      </div>

      <div className="glass p-6">
        <h2 className="font-sans text-xs tracking-widest uppercase text-gold/70 mb-2">Catatan Revenue</h2>
        <p className="font-sans text-xs text-cream/40">
          Revenue dihitung dari pesanan yang pembayarannya sudah dikonfirmasi admin (klik &quot;Proses&quot; di halaman Pesanan).
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Product breakdown */}
        <div className="glass p-6">
          <h2 className="font-sans text-xs tracking-widest uppercase text-gold/70 mb-5">Produk Terlaris</h2>
          {data.productBreakdown.length === 0 ? (
            <p className="font-sans text-sm text-cream/25 text-center py-6">Belum ada data penjualan</p>
          ) : (
            <div className="space-y-4">
              {data.productBreakdown.map((p) => (
                <div key={p.name}>
                  <div className="flex justify-between mb-1.5">
                    <span className="font-sans text-xs text-cream/60">{p.name}</span>
                    <span className="font-sans text-xs text-cream/30">{p.sold} terjual</span>
                  </div>
                  <div className="h-1.5 bg-white/[0.04] overflow-hidden">
                    <div className="h-full bg-gold/40" style={{ width: `${(p.sold / maxSold) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Traffic source */}
        <div className="glass p-6">
          <h2 className="font-sans text-xs tracking-widest uppercase text-gold/70 mb-5">Sumber Traffic</h2>
          <div className="flex flex-col items-center justify-center h-28 text-center">
            <p className="font-sans text-sm text-cream/20">Belum ada data traffic</p>
            <p className="font-sans text-xs text-cream/10 mt-1">
              Hubungkan Google Analytics untuk melacak pengunjung
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
