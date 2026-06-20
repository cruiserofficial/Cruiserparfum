import type { Metadata } from 'next'
import { Users } from 'lucide-react'
import { getDb } from '@/lib/db/index'
import { users, orders } from '@/lib/db/schema'
import { formatDate } from '@/lib/utils'
import { count, sum } from 'drizzle-orm'

export const metadata: Metadata = { title: 'Customers — Admin' }

async function getCustomerStats() {
  try {
    const db = await getDb()
    const customerList = await db.select().from(users)
    const orderStats = await db.select({ totalRevenue: sum(orders.total), totalOrders: count(orders.id) }).from(orders)
    const totalRevenue = Number(orderStats[0]?.totalRevenue ?? 0)
    const totalOrders = Number(orderStats[0]?.totalOrders ?? 0)
    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0
    return { customerList, totalRevenue, totalOrders, avgOrderValue }
  } catch {
    return { customerList: [], totalRevenue: 0, totalOrders: 0, avgOrderValue: 0 }
  }
}

export default async function CustomersPage() {
  const { customerList, totalRevenue, avgOrderValue } = await getCustomerStats()

  const stats = [
    { label: 'Total Customers', value: customerList.length },
    { label: 'Active', value: customerList.length },
    { label: 'Total Revenue', value: totalRevenue > 0 ? `Rp${totalRevenue.toLocaleString('id-ID')}` : 'Rp0' },
    { label: 'Avg. Order Value', value: avgOrderValue > 0 ? `Rp${avgOrderValue.toLocaleString('id-ID')}` : 'Rp0' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-cream">Customers</h1>
        <p className="font-sans text-xs text-cream/40 mt-1">Data pelanggan yang terdaftar</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value }) => (
          <div key={label} className="glass p-4">
            <p className="font-sans text-[10px] tracking-widest uppercase text-cream/40 mb-1">{label}</p>
            <p className="font-display text-xl text-cream">{value}</p>
          </div>
        ))}
      </div>

      <div className="glass p-6">
        {customerList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Users size={40} className="text-cream/10 mb-4" />
            <p className="font-sans text-sm text-cream/30">Belum ada pelanggan terdaftar</p>
            <p className="font-sans text-xs text-cream/20 mt-2 max-w-xs">
              Data pelanggan akan muncul di sini saat ada yang mendaftar atau melakukan pembelian
            </p>
          </div>
        ) : (
          <div className="overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {['Nama', 'Email', 'Role', 'Bergabung'].map((h) => (
                    <th key={h} className="text-left py-3 px-4 font-sans text-[9px] tracking-widest uppercase text-cream/30">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {customerList.map((customer) => (
                  <tr key={customer.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 font-sans text-sm text-cream">{customer.name}</td>
                    <td className="py-3 px-4 font-sans text-xs text-cream/60">{customer.email}</td>
                    <td className="py-3 px-4">
                      <span className={`font-sans text-[9px] tracking-widest uppercase px-2 py-0.5 border ${
                        customer.role === 'admin'
                          ? 'text-gold border-gold/30 bg-gold/5'
                          : 'text-cream/40 border-white/10'
                      }`}>
                        {customer.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-sans text-xs text-cream/40">{formatDate(customer.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

