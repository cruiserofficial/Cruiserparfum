import type { Metadata } from 'next'
import { ShoppingCart, Users, Package, DollarSign, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Dashboard Overview' }

const STATS = [
  { label: 'Total Revenue', value: 'Rp 0', icon: DollarSign, color: 'text-gold', bg: 'bg-gold/10' },
  { label: 'Total Orders', value: '0', icon: ShoppingCart, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  { label: 'Customers', value: '0', icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  { label: 'Products', value: '3', icon: Package, color: 'text-purple-400', bg: 'bg-purple-400/10' },
]

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-cream">Dashboard</h1>
        <p className="font-sans text-xs text-cream/40 mt-1">Selamat datang di panel admin CRUISER</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {STATS.map((stat) => {
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
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <ShoppingCart size={32} className="text-cream/10 mb-3" />
            <p className="font-sans text-sm text-cream/25">Belum ada pesanan</p>
            <p className="font-sans text-xs text-cream/15 mt-1">Pesanan akan muncul di sini saat ada transaksi</p>
          </div>
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
