'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Package, ShoppingCart, Users, Image as ImageIcon,
  Tag, Star, BarChart3, Settings, LogOut, Boxes,
} from 'lucide-react'
import { signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/admin', icon: LayoutDashboard, label: 'Overview' },
  { href: '/admin/products', icon: Package, label: 'Products' },
  { href: '/admin/inventory', icon: Boxes, label: 'Inventory' },
  { href: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
  { href: '/admin/customers', icon: Users, label: 'Customers' },
  { href: '/admin/banners', icon: ImageIcon, label: 'Banners' },
  { href: '/admin/coupons', icon: Tag, label: 'Coupons' },
  { href: '/admin/reviews', icon: Star, label: 'Reviews' },
  { href: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
  { href: '/admin/settings', icon: Settings, label: 'Settings' },
] as const

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-60 min-h-screen bg-obsidian-2 border-r border-white/[0.06] flex flex-col p-4 sticky top-0">
      {/* Logo */}
      <div className="px-3 py-4 mb-6 border-b border-white/[0.06]">
        <Link href="/" className="font-display text-xl tracking-[0.3em] text-gold">
          CRUISER
        </Link>
        <p className="font-sans text-[9px] tracking-[0.3em] uppercase text-cream/30 mt-0.5">
          Admin Panel
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== '/admin' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 font-sans text-xs tracking-widest uppercase transition-all duration-200',
                active
                  ? 'bg-gold/10 text-gold border-l-2 border-gold -ml-[1px] pl-[13px]'
                  : 'text-cream/40 hover:text-cream hover:bg-white/[0.04]',
              )}
            >
              <Icon size={15} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Sign out */}
      <button
        onClick={() => signOut({ callbackUrl: '/' })}
        className="flex items-center gap-3 px-3 py-2.5 font-sans text-xs tracking-widest uppercase text-cream/30 hover:text-red-400 transition-colors mt-4 border-t border-white/[0.06] pt-4"
      >
        <LogOut size={15} />
        Sign Out
      </button>
    </aside>
  )
}
