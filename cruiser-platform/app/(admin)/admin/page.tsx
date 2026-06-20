import type { Metadata } from 'next'
import { ShoppingCart, Users, Package, DollarSign, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import { getDb } from '@/lib/db/index'
import { orders, orderItems, users, products } from '@/lib/db/schema'
import { desc, eq, isNotNull, sql } from 'drizzle-orm'
import { formatPrice, formatDate } from '@/lib/utils'

export const metadata: Metadata = { title: 'Dashboard Overview' }
export const dynamic = 'force-dynamic'

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  pending: { label: 'Pending', cls: 'text-cream/40 border-white/10' },
  processing: { label: 'Diproses', cls: 'text-blue-400 border-blue-400/30 bg-blue-400/5' },
  shipped: { label: 'Dikirim', cls: 'text-purple-400 border-purple-400/30 bg-purple-400/5' },
  delivered: { label: 'Diterima', cls: 'text-gold border-gold/30 bg-gold/5' },
  cancelled: { label: 'Dibatalkan', cls: 'text-red-400 border-red-400/30 bg-red-400/5' },
}

async function getDashboardData() {
  try {
    const db = await getDb()

    const [revenueRow] = await db
      .select({ total: sql<number>`coalesce(sum(${orders.total}), 0)` })
      .from(orders)
      .where(isNotNull(orders.paymentConfirmedAt))

    const [orderCountRow] = await db
      .select({ count: sql<number>`count(*)` })
      .from(orders)

    const [customerCountRow] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.role, 'customer'))

    const [productCountRow] = await db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(eq(products.isActive, true))

    const recentOrders = await db
      .select()
      .from(orders)
      .orderBy(desc(orders.createdAt))
      .limit(5)

    const recentWithItems = await Promise.all(
      recentOrders.map(async (order) => {
        const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id))
        return { ...order, items }
      })
    )

    return {
      revenue: revenueRow?.total ?? 0,
      orderCount: orderCountRow?.count ?? 0,
      customerCount: customerCountRow?.count ?? 0,
      productCount: productCountRow?.count ?? 0,
      recentOrders: recentWithItems,
    }
  } catch (e) {
    console.error('Dashboard data error:', e)
    return { revenue: 0, orderCount: 0, customerCount: 0, productCount: 0, recentOrders: [] }
  }
}

export default async function AdminDashboard() {
  const data = await getDashboardData()

  const stats = [
    { label: 'Total Revenue', value: formatPrice(data.revenue), icon: DollarSign, color: 'text-gold', bg: 'bg-gold/10' },
    { label: 'Total Orders', value: String(data.orderCount), icon: ShoppingCart, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { label: 'Customers', value: String(data.customerCount), icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'Products', value: String(data.productCount), icon: Package, color: 'text-purple-400', bg: 'bg-purple-400/10' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-cream">Dashboard</h1>
        <p className="font-sans text-xs text-cream/40 mt-1">Selamat datang di panel admin CRUISER</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="glass p-5">
              <div className="w-10 h-10 mb-4 flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <Icon size={18} className={stat.color} />
              </div>
              <p className="font-display text-2xl text-cream">{stat.value}</p>
              <p className="font-sans text-[10px] tracking-widest uppercase text-cream/40 mt-1">{stat.label}</p>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent orders */}
        <div className="xl:col-span-2 glass p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-sans text-xs tracking-widest uppercase text-gold/70">Pesanan Terbaru</h2>
            <Link href="/admin/orders" className="font-sans text-xs text-cream/40 hover:text-cream flex items-center gap-1 transition-colors">
              Lihat semua <ArrowUpRight size={11} />
            </Link>
          </div>
          {data.recentOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ShoppingCart size={32} className="text-cream/10 mb-3" />
              <p className="font-sans text-sm text-cream/25">Belum ada pesanan</p>
              <p className="font-sans text-xs text-cream/15 mt-1">Pesanan akan muncul di sini saat ada transaksi</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.recentOrders.map((order) => {
                const s = STATUS_LABELS[order.status] ?? STATUS_LABELS.pending
                return (
                  <Link
                    key={order.id}
                    href="/admin/orders"
                    className="flex items-center justify-between gap-3 py-2.5 px-3 hover:bg-white/[0.04] transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-sans text-xs text-cream">{order.number}</span>
                        <span className={`font-sans text-[8px] tracking-widest uppercase px-1.5 py-0.5 border ${s.cls}`}>{s.label}</span>
                      </div>
                      <p className="font-sans text-[10px] text-cream/40 mt-0.5">
                        {order.recipient} · {order.items.map((i) => i.name).join(', ')}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-sans text-xs text-cream">{formatPrice(order.total)}</p>
                      <p className="font-sans text-[10px] text-cream/30">{formatDate(order.createdAt)}</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* Quick links */}
        <div className="glass p-6">
          <h2 className="font-sans text-xs tracking-widest uppercase text-gold/70 mb-5">Menu Cepat</h2>
          <div className="space-y-2">
            {[
              { href: '/admin/orders', label: 'Kelola Pesanan' },
              { href: '/admin/products', label: 'Kelola Produk' },
              { href: '/admin/coupons', label: 'Buat Kupon' },
              { href: '/admin/settings', label: 'Pengaturan Toko' },
              { href: '/', label: 'Lihat Website →' },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center justify-between py-2.5 px-3 hover:bg-white/[0.04] transition-colors group"
              >
                <span className="font-sans text-xs text-cream/60 group-hover:text-cream transition-colors">{label}</span>
                <ArrowUpRight size={12} className="text-cream/20 group-hover:text-gold/60 transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
