'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, Menu, X, User, Heart, Search, LogOut, LayoutDashboard, UserCircle } from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'
import { useCartStore } from '@/features/cart/cartStore'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { href: '/shop', label: 'Collection' },
  { href: '/shop?category=new', label: 'New' },
  { href: '/#story', label: 'Our Story' },
  { href: '/#testimonials', label: 'Reviews' },
] as const

export function Navbar() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { toggleCart } = useCartStore()
  const count = useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0))
  const { data: session, status } = useSession()
  const dropdownRef = useRef<HTMLDivElement>(null)

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 40)
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Hide on admin routes (after all hooks)
  if (pathname.startsWith('/admin')) return null

  const isLoggedIn = status === 'authenticated' && !!session?.user
  const isAdmin = session?.user?.role === 'admin'
  const initials = session?.user?.name
    ? session.user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : session?.user?.email?.[0]?.toUpperCase() ?? '?'

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        className={cn(
          'fixed top-0 inset-x-0 z-50 transition-all duration-500',
          scrolled
            ? 'bg-obsidian/90 backdrop-blur-xl border-b border-white/[0.06] py-3'
            : 'bg-transparent py-5',
        )}
      >
        <div className="container mx-auto px-6 flex items-center justify-between max-w-7xl">
          {/* Logo */}
          <Link href="/" className="group">
            <span className="font-display text-2xl tracking-[0.3em] text-cream group-hover:text-gold transition-colors duration-300">
              CRUISER
            </span>
          </Link>

          {/* Desktop nav */}
          <ul className="hidden md:flex items-center gap-10">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    'font-sans text-xs tracking-[0.2em] uppercase transition-colors duration-300',
                    pathname === link.href
                      ? 'text-gold'
                      : 'text-cream/70 hover:text-cream',
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <Link
              href="/search"
              className="hidden md:flex text-cream/60 hover:text-cream transition-colors duration-300"
              aria-label="Search"
            >
              <Search size={18} />
            </Link>

            <Link
              href="/account/wishlist"
              className="hidden md:flex text-cream/60 hover:text-cream transition-colors duration-300"
              aria-label="Wishlist"
            >
              <Heart size={18} />
            </Link>

            {/* User section — desktop */}
            <div className="hidden md:flex items-center gap-2" ref={dropdownRef}>
              {status === 'loading' ? (
                <div className="w-7 h-7 rounded-full bg-white/10 animate-pulse" />
              ) : isLoggedIn ? (
                /* Logged in → avatar + dropdown */
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen((v) => !v)}
                    className="flex items-center gap-2 group"
                    aria-label="User menu"
                  >
                    {session.user.image ? (
                      <img
                        src={session.user.image}
                        alt={session.user.name ?? ''}
                        className="w-7 h-7 rounded-full object-cover border border-gold/30 group-hover:border-gold/70 transition-colors"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-gold/20 border border-gold/30 group-hover:border-gold/70 transition-colors flex items-center justify-center">
                        <span className="font-sans text-[10px] font-bold text-gold">{initials}</span>
                      </div>
                    )}
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-3 w-52 bg-[#111] border border-white/10 py-1 z-50"
                      >
                        {/* User info */}
                        <div className="px-3.5 py-3 border-b border-white/[0.06]">
                          <p className="font-sans text-xs text-cream truncate">{session.user.name ?? session.user.email}</p>
                          {session.user.name && (
                            <p className="font-sans text-[10px] text-cream/30 truncate mt-0.5">{session.user.email}</p>
                          )}
                          {isAdmin && (
                            <span className="inline-block mt-1.5 font-sans text-[9px] tracking-widest uppercase bg-gold/15 text-gold px-1.5 py-0.5">Admin</span>
                          )}
                        </div>

                        <Link
                          href="/account"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3.5 py-2.5 font-sans text-xs text-cream/60 hover:text-cream hover:bg-white/[0.04] transition-colors"
                        >
                          <UserCircle size={13} />
                          Akun Saya
                        </Link>

                        {isAdmin && (
                          <Link
                            href="/admin"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3.5 py-2.5 font-sans text-xs text-gold/70 hover:text-gold hover:bg-gold/[0.05] transition-colors"
                          >
                            <LayoutDashboard size={13} />
                            Admin Panel
                          </Link>
                        )}

                        <div className="border-t border-white/[0.06] mt-1 pt-1">
                          <button
                            onClick={() => { signOut({ callbackUrl: '/' }); setUserMenuOpen(false) }}
                            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 font-sans text-xs text-cream/40 hover:text-red-400 hover:bg-white/[0.03] transition-colors"
                          >
                            <LogOut size={13} />
                            Keluar
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                /* Logged out → Masuk + Daftar */
                <div className="flex items-center gap-3">
                  <Link
                    href="/login"
                    className="font-sans text-xs tracking-widest uppercase text-cream/60 hover:text-cream transition-colors"
                  >
                    Masuk
                  </Link>
                  <Link
                    href="/register"
                    className="font-sans text-xs tracking-widest uppercase bg-gold/10 border border-gold/30 text-gold hover:bg-gold/20 hover:border-gold/60 px-3 py-1.5 transition-all"
                  >
                    Daftar
                  </Link>
                </div>
              )}
            </div>

            <button
              onClick={toggleCart}
              className="relative text-cream/60 hover:text-cream transition-colors duration-300"
              aria-label={`Cart (${count} items)`}
            >
              <ShoppingBag size={20} />
              {count > 0 && (
                <motion.span
                  key={count}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 w-4 h-4 bg-gold text-obsidian text-[10px] font-bold font-sans rounded-full flex items-center justify-center"
                >
                  {count > 9 ? '9+' : count}
                </motion.span>
              )}
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden text-cream/60 hover:text-cream transition-colors duration-300 ml-2"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="fixed inset-0 z-40 bg-obsidian/95 backdrop-blur-2xl flex flex-col pt-24 px-8"
          >
            <nav className="flex flex-col gap-2">
              {NAV_LINKS.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Link
                    href={link.href}
                    className="block font-display text-3xl text-cream/80 hover:text-gold py-3 border-b border-white/[0.06] transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}

              {/* Mobile auth links */}
              {isLoggedIn ? (
                <>
                  <motion.div
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: NAV_LINKS.length * 0.08 }}
                  >
                    <Link
                      href="/account"
                      className="block font-display text-3xl text-cream/80 hover:text-gold py-3 border-b border-white/[0.06] transition-colors duration-300"
                    >
                      Akun Saya
                    </Link>
                  </motion.div>
                  {isAdmin && (
                    <motion.div
                      initial={{ opacity: 0, x: 40 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (NAV_LINKS.length + 1) * 0.08 }}
                    >
                      <Link
                        href="/admin"
                        className="block font-display text-3xl text-gold/80 hover:text-gold py-3 border-b border-white/[0.06] transition-colors duration-300"
                      >
                        Admin Panel
                      </Link>
                    </motion.div>
                  )}
                  <motion.div
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (NAV_LINKS.length + 2) * 0.08 }}
                  >
                    <button
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="block w-full text-left font-display text-3xl text-cream/40 hover:text-red-400 py-3 border-b border-white/[0.06] transition-colors duration-300"
                    >
                      Keluar
                    </button>
                  </motion.div>
                </>
              ) : (
                <>
                  <motion.div
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: NAV_LINKS.length * 0.08 }}
                  >
                    <Link
                      href="/login"
                      className="block font-display text-3xl text-cream/80 hover:text-gold py-3 border-b border-white/[0.06] transition-colors duration-300"
                    >
                      Masuk
                    </Link>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (NAV_LINKS.length + 1) * 0.08 }}
                  >
                    <Link
                      href="/register"
                      className="block font-display text-3xl text-gold hover:text-gold/70 py-3 border-b border-white/[0.06] transition-colors duration-300"
                    >
                      Daftar
                    </Link>
                  </motion.div>
                </>
              )}
            </nav>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-auto pb-12"
            >
              {isLoggedIn && (
                <p className="font-sans text-xs text-cream/30 mb-3">
                  Masuk sebagai <span className="text-cream/60">{session.user.name ?? session.user.email}</span>
                </p>
              )}
              <a
                href="https://www.instagram.com/cruiser.official"
                target="_blank"
                rel="noopener noreferrer"
                className="font-sans text-xs tracking-[0.3em] uppercase text-gold/70 hover:text-gold transition-colors duration-300"
              >
                @cruiser.official
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
