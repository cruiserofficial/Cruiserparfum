import type { Metadata } from 'next'
import { BarChart3, TrendingUp, ShoppingCart, DollarSign, Package } from 'lucide-react'

export const metadata: Metadata = { title: 'Analytics — Admin' }

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-cream">Analytics</h1>
        <p className="font-sans text-xs text-cream/40 mt-1">Performa penjualan toko CRUISER</p>
      </div>

      {/* KPI Cards — all zero */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Revenue Bulan Ini', value: 'Rp 0', icon: DollarSign, color: 'text-gold', bg: 'bg-gold/10' },
          { label: 'Orders Bulan Ini', value: '0', icon: ShoppingCart, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
          { label: 'Total Revenue', value: 'Rp 0', icon: TrendingUp, color: 'text-blue-400', bg: 'bg-blue-400/10' },
          { label: 'Total Orders', value: '0', icon: Package, color: 'text-purple-400', bg: 'bg-purple-400/10' },
        ].map((kpi) => {
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

      {/* Empty chart area */}
      <div className="glass p-6">
        <h2 className="font-sans text-xs tracking-widest uppercase text-gold/70 mb-6">Revenue Bulanan</h2>
        <div className="flex flex-col items-center justify-center h-48 text-center">
          <BarChart3 size={40} className="text-cream/10 mb-4" />
          <p className="font-sans text-sm text-cream/25">Belum ada data penjualan</p>
          <p className="font-sans text-xs text-cream/15 mt-1">
            Grafik akan muncul otomatis saat ada pesanan yang masuk
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Product breakdown */}
        <div className="glass p-6">
          <h2 className="font-sans text-xs tracking-widest uppercase text-gold/70 mb-5">Produk Terlaris</h2>
          <div className="space-y-4">
            {['Eternity', 'Noctis', 'Liberea'].map((name) => (
              <div key={name}>
                <div className="flex justify-between mb-1.5">
                  <span className="font-sans text-xs text-cream/60">{name}</span>
                  <span className="font-sans text-xs text-cream/30">0 terjual</span>
                </div>
                <div className="h-1.5 bg-white/[0.04] overflow-hidden">
                  <div className="h-full w-0 bg-gold/40" />
                </div>
              </div>
            ))}
          </div>
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
