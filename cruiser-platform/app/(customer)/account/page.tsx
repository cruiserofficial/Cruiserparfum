import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/auth'
import { Package, Heart, MapPin, Settings, ChevronRight } from 'lucide-react'
import { AccountOrderSummary } from '@/components/account/AccountOrderSummary'

export const metadata: Metadata = { title: 'My Account | CRUISER' }

const MENU_ITEMS = [
  { href: '/account/orders', icon: Package, label: 'My Orders', desc: 'Track and manage your orders' },
  { href: '/account/wishlist', icon: Heart, label: 'Wishlist', desc: 'Products you love' },
  { href: '/account/addresses', icon: MapPin, label: 'Addresses', desc: 'Manage shipping addresses' },
  { href: '/account/settings', icon: Settings, label: 'Settings', desc: 'Profile and security' },
]

export default async function AccountPage() {
  const session = await auth()
  if (!session?.user) redirect('/login?callbackUrl=/account')

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center gap-6 mb-12 pb-8 border-b border-white/[0.06]">
          <div className="w-16 h-16 bg-gold/10 border border-gold/20 flex items-center justify-center">
            <span className="font-display text-2xl text-gold">
              {session.user.name?.[0]?.toUpperCase() ?? session.user.email[0].toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-sans text-xs tracking-widest uppercase text-gold/60 mb-1">Welcome back</p>
            <h1 className="font-display text-2xl text-cream">
              {session.user.name ?? 'Cruiser Member'}
            </h1>
            <p className="font-sans text-sm text-cream/40">{session.user.email}</p>
          </div>
        </div>

        {/* Menu */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          {MENU_ITEMS.map(({ href, icon: Icon, label, desc }) => (
            <Link
              key={href}
              href={href}
              className="glass p-5 flex items-center gap-4 hover:border-gold/20 transition-all duration-300 group"
            >
              <div className="w-10 h-10 bg-gold/5 border border-gold/10 flex items-center justify-center group-hover:bg-gold/10 transition-colors">
                <Icon size={16} className="text-gold/60 group-hover:text-gold transition-colors" />
              </div>
              <div className="flex-1">
                <p className="font-sans text-sm text-cream group-hover:text-gold transition-colors">{label}</p>
                <p className="font-sans text-xs text-cream/40">{desc}</p>
              </div>
              <ChevronRight size={14} className="text-cream/20 group-hover:text-gold/60 transition-colors" />
            </Link>
          ))}
        </div>

        {/* Recent orders — client component reads from localStorage */}
        <AccountOrderSummary />
      </div>
    </div>
  )
}
