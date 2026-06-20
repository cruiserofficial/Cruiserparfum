'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  CreditCard, Smartphone, Building2, DollarSign,
  ChevronRight, Lock, ArrowLeft, MapPin, Loader2, Package, Zap, Clock,
  User, Mail, Phone, Home, Briefcase, MoreHorizontal, Search, X, CheckCircle2,
} from 'lucide-react'
import { useCartStore } from '@/features/cart/cartStore'
import { useCustomerOrderStore } from '@/features/orders/orderStore'
import { formatPrice } from '@/lib/utils'
import { PAYMENT_METHODS, FREE_SHIPPING_THRESHOLD } from '@/lib/constants'
import type { BiteshipArea, ShippingRate } from '@/lib/biteship'
import toast from 'react-hot-toast'

const schema = z.object({
  email: z.string().email('Email tidak valid'),
  recipient: z.string().min(2, 'Nama harus minimal 2 karakter'),
  phone: z.string().min(9, 'Nomor HP tidak valid'),
  address: z.string().min(10, 'Alamat terlalu pendek'),
  notes: z.string().optional(),
  paymentMethod: z.enum(['qris', 'bank_transfer', 'midtrans', 'cod', 'stripe']),
})
type FormData = z.infer<typeof schema>

const STEPS = ['Data Penerima', 'Pengiriman', 'Pembayaran'] as const
type Step = 1 | 2 | 3

const ADDRESS_LABELS = [
  { id: 'rumah', label: 'Rumah', icon: Home },
  { id: 'kantor', label: 'Kantor', icon: Briefcase },
  { id: 'lainnya', label: 'Lainnya', icon: MoreHorizontal },
] as const

const PAYMENT_ICONS: Record<string, React.ReactNode> = {
  qris: <Smartphone size={18} />,
  bank_transfer: <Building2 size={18} />,
  midtrans: <CreditCard size={18} />,
  cod: <DollarSign size={18} />,
}

const SHIPPING_TYPE_ICONS: Record<string, React.ReactNode> = {
  'Instan': <Zap size={14} className="text-amber-400" />,
  'Same Day': <Clock size={14} className="text-emerald-400" />,
  'Express': <Package size={14} className="text-blue-400" />,
  'Reguler': <Package size={14} className="text-cream/40" />,
  'Lainnya': <Package size={14} className="text-cream/40" />,
}

interface GroupedRates { [type: string]: ShippingRate[] }

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block font-sans text-xs text-cream/50 mb-1.5">
      {children}
      {required && <span className="text-gold ml-0.5">*</span>}
    </label>
  )
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="font-sans text-[11px] text-red-400 mt-1">{message}</p>
}

function SectionCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="border border-white/[0.08] bg-white/[0.02]">
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-white/[0.06] bg-white/[0.02]">
        <span className="text-gold/60">{icon}</span>
        <span className="font-sans text-xs tracking-[0.2em] uppercase text-cream/50">{title}</span>
      </div>
      <div className="p-5 space-y-4">
        {children}
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const { items, clearCart } = useCartStore()
  const { addOrder } = useCustomerOrderStore()
  const [step, setStep] = useState<Step>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [addressLabel, setAddressLabel] = useState<string>('rumah')

  // Area search
  const [areaQuery, setAreaQuery] = useState('')
  const [areaResults, setAreaResults] = useState<BiteshipArea[]>([])
  const [selectedArea, setSelectedArea] = useState<BiteshipArea | null>(null)
  const [searchingArea, setSearchingArea] = useState(false)
  const [areaOpen, setAreaOpen] = useState(false)
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Shipping
  const [shippingRates, setShippingRates] = useState<GroupedRates>({})
  const [selectedRate, setSelectedRate] = useState<ShippingRate | null>(null)
  const [loadingRates, setLoadingRates] = useState(false)
  const [rateSource, setRateSource] = useState<'biteship' | 'fallback' | null>(null)
  const [selectedPayment, setSelectedPayment] = useState<string>(PAYMENT_METHODS[0].id)

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0)
  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD
  const shippingCost = isFreeShipping ? 0 : (selectedRate?.price ?? 0)
  const total = subtotal + shippingCost

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { paymentMethod: 'qris' },
  })

  // Prefill from the customer's saved profile so returning customers don't
  // have to retype their address every time they check out.
  useEffect(() => {
    if (!session?.user) return
    if (session.user.email) form.setValue('email', session.user.email)
    if (session.user.name) form.setValue('recipient', session.user.name)

    fetch('/api/account/profile')
      .then((res) => res.json())
      .then((data: { profile: {
        name?: string | null; phone?: string | null; address?: string | null
        district?: string | null; city?: string | null; province?: string | null
        postalCode?: string | null; areaId?: string | null
      } | null }) => {
        const profile = data.profile
        if (!profile) return
        if (profile.name) form.setValue('recipient', profile.name)
        if (profile.phone) form.setValue('phone', profile.phone)
        if (profile.address) form.setValue('address', profile.address)
        if (profile.areaId && profile.city && profile.province && profile.postalCode) {
          setSelectedArea({
            id: profile.areaId,
            name: `${profile.district ?? ''}, ${profile.city}, ${profile.province}. ${profile.postalCode}`,
            administrative_division_level_1_name: profile.province,
            administrative_division_level_2_name: profile.city,
            administrative_division_level_3_name: profile.district ?? '',
            postal_code: profile.postalCode,
          })
        }
      })
      .catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user])

  const handleAreaSearch = useCallback((q: string) => {
    setAreaQuery(q)
    setSelectedArea(null)
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    if (q.length < 3) { setAreaResults([]); return }
    searchTimeout.current = setTimeout(async () => {
      setSearchingArea(true)
      try {
        const res = await fetch(`/api/shipping/areas?q=${encodeURIComponent(q)}`)
        const data = await res.json() as { areas: BiteshipArea[] }
        setAreaResults(data.areas ?? [])
      } catch {
        setAreaResults([])
      } finally {
        setSearchingArea(false)
      }
    }, 400)
  }, [])

  function selectArea(area: BiteshipArea) {
    setSelectedArea(area)
    setAreaQuery('')
    setAreaResults([])
    setAreaOpen(false)
  }

  function clearArea() {
    setSelectedArea(null)
    setAreaQuery('')
    setAreaResults([])
    setAreaOpen(true)
  }

  async function fetchShippingRates() {
    if (!selectedArea) { toast.error('Pilih kecamatan tujuan dulu'); return false }
    setLoadingRates(true)
    setShippingRates({})
    setSelectedRate(null)
    setRateSource(null)
    try {
      const totalItems = items.reduce((s, i) => s + i.quantity, 0)
      const res = await fetch('/api/shipping/rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destinationAreaId: selectedArea.id, itemCount: totalItems, totalValue: subtotal }),
      })
      const data = await res.json() as { grouped: GroupedRates; source?: 'biteship' | 'fallback' }
      if (!res.ok) throw new Error('Gagal ambil tarif')
      setShippingRates(data.grouped ?? {})
      setRateSource(data.source ?? 'biteship')
      return true
    } catch {
      toast.error('Gagal mengambil tarif pengiriman. Coba lagi.')
      return false
    } finally {
      setLoadingRates(false)
    }
  }

  async function goToShipping() {
    const valid = await form.trigger(['email', 'recipient', 'phone', 'address'])
    if (!valid) return
    if (!selectedArea) { toast.error('Pilih kecamatan / kota tujuan dulu'); return }
    const ok = await fetchShippingRates()
    if (ok) setStep(2)
  }

  async function handleSubmit(data: FormData) {
    if (items.length === 0) { toast.error('Keranjang kosong'); router.push('/cart'); return }
    if (!selectedRate && !isFreeShipping) { toast.error('Pilih metode pengiriman dulu'); return }
    setIsSubmitting(true)

    const city = selectedArea?.administrative_division_level_2_name ?? ''
    const province = selectedArea?.administrative_division_level_1_name ?? ''
    const postalCode = selectedArea?.postal_code ?? ''
    const shippingMethod = selectedRate
      ? `${selectedRate.courier_name} ${selectedRate.courier_service_name}`.trim()
      : isFreeShipping ? 'Gratis Ongkir' : ''

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          addressLabel,
          area: selectedArea,
          city,
          province,
          postalCode,
          shippingMethod,
          shippingCourier: selectedRate?.courier_name,
          shippingService: selectedRate?.courier_service_name,
          shippingCode: selectedRate?.courier_code,
          items: items.map((i) => ({ productId: i.productId, name: i.name, price: i.price, quantity: i.quantity, imageUrl: i.imageUrl })),
          subtotal, shippingCost, total, paymentMethod: selectedPayment,
        }),
      })
      if (!response.ok) {
        const errBody = await response.json().catch(() => null) as
          | { error?: string; details?: { message: string; path: (string | number)[] }[] }
          | null
        const detail = errBody?.details?.[0]
        const FIELD_LABELS: Record<string, string> = {
          email: 'Email', recipient: 'Nama', phone: 'Nomor HP', address: 'Alamat',
          items: 'Keranjang', subtotal: 'Subtotal', total: 'Total', paymentMethod: 'Metode pembayaran',
        }
        const fieldKey = String(detail?.path?.[0] ?? '')
        const msg = detail
          ? `${FIELD_LABELS[fieldKey] ?? fieldKey} tidak valid — ${detail.message}`
          : (errBody?.error ?? 'Gagal membuat pesanan')
        throw new Error(msg)
      }
      const result = await response.json() as { orderNumber: string; paymentUrl?: string }

      // Save order to customer store (persisted in localStorage)
      addOrder({
        id: `order_${Date.now()}`,
        number: result.orderNumber,
        items: items.map((i) => ({ productId: i.productId, name: i.name, quantity: i.quantity, price: i.price, imageUrl: i.imageUrl ?? undefined })),
        subtotal,
        shippingCost,
        total,
        status: 'pending',
        date: new Date().toISOString(),
        recipient: data.recipient,
        phone: data.phone,
        email: data.email,
        address: data.address,
        city,
        province,
        postalCode,
        notes: data.notes,
        shippingMethod,
        courier: selectedRate?.courier_name,
        isGuest: false,
      })

      clearCart()
      if (result.paymentUrl) {
        window.location.href = result.paymentUrl
      } else {
        router.push(`/checkout/success?order=${result.orderNumber}&method=${selectedPayment}`)
      }
    } catch (err) {
      toast.error(err instanceof Error && err.message ? err.message : 'Gagal membuat pesanan. Coba lagi.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-3xl text-cream mb-4">Keranjang kosong</h1>
          <Link href="/shop" className="btn-luxury">Belanja Sekarang</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="container max-w-6xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="text-center py-6 border-b border-white/[0.06] mb-8">
          <Link href="/" className="font-display text-2xl tracking-[0.3em] text-gold">CRUISER</Link>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center mb-8">
          {STEPS.map((label, i) => {
            const s = (i + 1) as Step
            const done = s < step
            const active = s === step
            return (
              <div key={label} className="flex items-center">
                <button
                  type="button"
                  onClick={() => done && setStep(s)}
                  className={`flex items-center gap-2 ${done ? 'cursor-pointer' : 'cursor-default'}`}
                >
                  <span className={`w-6 h-6 flex items-center justify-center text-[11px] font-sans font-medium transition-all ${
                    done ? 'bg-gold text-obsidian' : active ? 'border border-gold text-gold' : 'border border-white/10 text-cream/20'
                  }`}>
                    {done ? '✓' : i + 1}
                  </span>
                  <span className={`font-sans text-[11px] tracking-widest uppercase hidden sm:block transition-colors ${
                    active ? 'text-cream' : done ? 'text-cream/50' : 'text-cream/20'
                  }`}>
                    {label}
                  </span>
                </button>
                {i < STEPS.length - 1 && (
                  <div className={`w-8 sm:w-16 h-px mx-2 sm:mx-3 transition-colors ${s < step ? 'bg-gold/40' : 'bg-white/10'}`} />
                )}
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr,340px] gap-8">
          {/* Left: Form */}
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <AnimatePresence mode="wait">

              {/* ── STEP 1: Data Penerima ── */}
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="space-y-4">

                  {/* Kontak */}
                  <SectionCard icon={<User size={14} />} title="Info Penerima">
                    <div>
                      <FieldLabel required>Nama Lengkap</FieldLabel>
                      <input
                        {...form.register('recipient')}
                        placeholder="Masukkan nama lengkap penerima"
                        className="w-full bg-white/[0.04] border border-white/10 focus:border-gold/50 outline-none px-4 py-3 font-sans text-sm text-cream placeholder:text-cream/25 transition-colors"
                      />
                      <FieldError message={form.formState.errors.recipient?.message} />
                    </div>
                    <div>
                      <FieldLabel required>Nomor HP</FieldLabel>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-sans text-sm text-cream/40 select-none">+62</span>
                        <input
                          {...form.register('phone')}
                          placeholder="8xxxxxxxxx"
                          type="tel"
                          className="w-full bg-white/[0.04] border border-white/10 focus:border-gold/50 outline-none pl-12 pr-4 py-3 font-sans text-sm text-cream placeholder:text-cream/25 transition-colors"
                        />
                      </div>
                      <FieldError message={form.formState.errors.phone?.message} />
                    </div>
                    <div>
                      <FieldLabel required>Email</FieldLabel>
                      <div className="relative">
                        <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-cream/25 pointer-events-none" />
                        <input
                          {...form.register('email')}
                          placeholder="contoh@email.com"
                          type="email"
                          className="w-full bg-white/[0.04] border border-white/10 focus:border-gold/50 outline-none pl-10 pr-4 py-3 font-sans text-sm text-cream placeholder:text-cream/25 transition-colors"
                        />
                      </div>
                      <FieldError message={form.formState.errors.email?.message} />
                    </div>
                  </SectionCard>

                  {/* Alamat */}
                  <SectionCard icon={<MapPin size={14} />} title="Alamat Pengiriman">

                    {/* Area picker */}
                    <div>
                      <FieldLabel required>Kota / Kecamatan</FieldLabel>

                      {selectedArea ? (
                        /* Sudah dipilih */
                        <div className="border border-gold/30 bg-gold/5 p-3 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <CheckCircle2 size={16} className="text-gold flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="font-sans text-sm text-cream truncate">
                                {selectedArea.administrative_division_level_3_name}, {selectedArea.administrative_division_level_2_name}
                              </p>
                              <p className="font-sans text-xs text-cream/40 truncate">
                                {selectedArea.administrative_division_level_1_name} · Kode Pos {selectedArea.postal_code}
                              </p>
                            </div>
                          </div>
                          <button type="button" onClick={clearArea} className="text-cream/30 hover:text-cream transition-colors flex-shrink-0">
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        /* Belum dipilih — search */
                        <div className="relative">
                          <div className="relative">
                            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cream/25 pointer-events-none" />
                            <input
                              type="text"
                              value={areaQuery}
                              onChange={(e) => { setAreaOpen(true); handleAreaSearch(e.target.value) }}
                              onFocus={() => setAreaOpen(true)}
                              placeholder="Ketik nama kecamatan atau kode pos..."
                              className="w-full bg-white/[0.04] border border-white/10 focus:border-gold/50 outline-none pl-9 pr-9 py-3 font-sans text-sm text-cream placeholder:text-cream/25 transition-colors"
                            />
                            {searchingArea
                              ? <Loader2 size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-cream/25 animate-spin" />
                              : areaQuery && <button type="button" onClick={() => { setAreaQuery(''); setAreaResults([]) }} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-cream/25 hover:text-cream transition-colors"><X size={13} /></button>
                            }
                          </div>

                          {/* Dropdown */}
                          {areaOpen && areaResults.length > 0 && (
                            <div className="absolute top-full left-0 right-0 z-50 border border-white/10 border-t-0 bg-[#111111] max-h-52 overflow-y-auto shadow-xl">
                              {areaResults.map((area) => (
                                <button
                                  key={area.id}
                                  type="button"
                                  onClick={() => selectArea(area)}
                                  className="w-full text-left px-4 py-3 hover:bg-white/[0.05] transition-colors border-b border-white/[0.04] last:border-0 flex items-start gap-3"
                                >
                                  <MapPin size={13} className="text-cream/20 mt-0.5 flex-shrink-0" />
                                  <div>
                                    <p className="font-sans text-sm text-cream leading-tight">
                                      {area.administrative_division_level_3_name}
                                    </p>
                                    <p className="font-sans text-xs text-cream/35 mt-0.5">
                                      {area.administrative_division_level_2_name} · {area.administrative_division_level_1_name} · {area.postal_code}
                                    </p>
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}

                          {areaOpen && areaQuery.length >= 3 && !searchingArea && areaResults.length === 0 && (
                            <div className="absolute top-full left-0 right-0 z-50 border border-white/10 border-t-0 bg-[#111111] px-4 py-4 text-center">
                              <p className="font-sans text-xs text-cream/30">Tidak ditemukan. Coba kata kunci lain.</p>
                            </div>
                          )}
                        </div>
                      )}

                      {!selectedArea && (
                        <p className="font-sans text-[11px] text-cream/25 mt-1.5">
                          Contoh: "Pondok Aren", "Bekasi", "15224"
                        </p>
                      )}
                    </div>

                    {/* Kode Pos auto */}
                    {selectedArea && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <FieldLabel>Kota / Kabupaten</FieldLabel>
                          <div className="bg-white/[0.02] border border-white/[0.06] px-4 py-3 font-sans text-sm text-cream/50">
                            {selectedArea.administrative_division_level_2_name}
                          </div>
                        </div>
                        <div>
                          <FieldLabel>Kode Pos</FieldLabel>
                          <div className="bg-white/[0.02] border border-white/[0.06] px-4 py-3 font-sans text-sm text-cream/50">
                            {selectedArea.postal_code}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Detail alamat */}
                    <div>
                      <FieldLabel required>Alamat Lengkap</FieldLabel>
                      <textarea
                        {...form.register('address')}
                        rows={3}
                        placeholder="Nama jalan, nomor rumah, RT/RW, nama gedung / blok / lantai"
                        className="w-full bg-white/[0.04] border border-white/10 focus:border-gold/50 outline-none px-4 py-3 font-sans text-sm text-cream placeholder:text-cream/25 transition-colors resize-none"
                      />
                      <FieldError message={form.formState.errors.address?.message} />
                    </div>

                    {/* Label alamat */}
                    <div>
                      <FieldLabel>Label Alamat</FieldLabel>
                      <div className="flex gap-2">
                        {ADDRESS_LABELS.map(({ id, label, icon: Icon }) => (
                          <button
                            key={id}
                            type="button"
                            onClick={() => setAddressLabel(id)}
                            className={`flex items-center gap-1.5 px-3 py-2 border font-sans text-xs transition-all ${
                              addressLabel === id
                                ? 'border-gold/50 bg-gold/10 text-gold'
                                : 'border-white/10 text-cream/40 hover:border-white/20 hover:text-cream/60'
                            }`}
                          >
                            <Icon size={12} />
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </SectionCard>

                  {/* Catatan */}
                  <div>
                    <FieldLabel>Catatan untuk Penjual <span className="text-cream/25 font-normal">(opsional)</span></FieldLabel>
                    <textarea
                      {...form.register('notes')}
                      rows={2}
                      placeholder="Contoh: tolong dibungkus rapi, hadiah untuk orang tersayang"
                      className="w-full bg-white/[0.04] border border-white/10 focus:border-gold/50 outline-none px-4 py-3 font-sans text-sm text-cream placeholder:text-cream/25 transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={goToShipping}
                    disabled={loadingRates}
                    className="btn-luxury w-full py-4 flex items-center justify-center gap-2 disabled:opacity-60 text-sm tracking-widest"
                  >
                    {loadingRates
                      ? <><Loader2 size={15} className="animate-spin" /> Mengambil tarif ongkir...</>
                      : <><span>Pilih Pengiriman</span><ChevronRight size={15} /></>
                    }
                  </button>
                  <Link href="/cart" className="flex items-center justify-center gap-1.5 font-sans text-xs text-cream/30 hover:text-cream/60 transition-colors">
                    <ArrowLeft size={12} /> Kembali ke keranjang
                  </Link>
                </motion.div>
              )}

              {/* ── STEP 2: Pengiriman ── */}
              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="space-y-4">

                  <div>
                    <h2 className="font-display text-2xl text-cream">Pilih Pengiriman</h2>
                    {selectedArea && (
                      <p className="font-sans text-xs text-cream/35 mt-1 flex items-center gap-1.5">
                        <MapPin size={11} />
                        ke {selectedArea.administrative_division_level_3_name}, {selectedArea.administrative_division_level_2_name}
                      </p>
                    )}
                  </div>

                  {isFreeShipping && (
                    <div className="border border-emerald-400/20 bg-emerald-400/5 px-4 py-3 flex items-center gap-2">
                      <span className="text-base">🎉</span>
                      <p className="font-sans text-sm text-emerald-400">Gratis ongkir untuk pembelian ini!</p>
                    </div>
                  )}

                  {rateSource === 'fallback' && (
                    <div className="border border-amber-400/20 bg-amber-400/5 px-4 py-3 flex items-start gap-2.5">
                      <span className="text-amber-400 mt-0.5">⚠</span>
                      <p className="font-sans text-xs text-amber-400/80 leading-relaxed">
                        Menampilkan estimasi ongkir. Ongkir final dikonfirmasi setelah pesanan dibuat.
                      </p>
                    </div>
                  )}

                  {Object.keys(shippingRates).length === 0 ? (
                    <div className="text-center py-12 border border-white/[0.06]">
                      <Loader2 size={22} className="text-cream/20 animate-spin mx-auto mb-3" />
                      <p className="font-sans text-xs text-cream/25">Mencari kurir terbaik...</p>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {Object.entries(shippingRates).map(([type, rates]) => (
                        <div key={type}>
                          <div className="flex items-center gap-2 mb-2 px-1">
                            {SHIPPING_TYPE_ICONS[type]}
                            <span className="font-sans text-[10px] tracking-[0.25em] uppercase text-cream/35">{type}</span>
                          </div>
                          <div className="space-y-2">
                            {rates.map((rate) => {
                              const key = `${rate.courier_code}-${rate.courier_service_code}`
                              const isSelected = selectedRate && `${selectedRate.courier_code}-${selectedRate.courier_service_code}` === key
                              const duration = rate.duration || `${rate.shipment_duration_range} ${rate.shipment_duration_unit === 'DAYS' ? 'hari' : 'jam'}`
                              return (
                                <button
                                  key={key}
                                  type="button"
                                  onClick={() => setSelectedRate(rate)}
                                  className={`w-full text-left px-4 py-3.5 border transition-all ${
                                    isSelected ? 'border-gold/40 bg-gold/5' : 'border-white/[0.08] bg-white/[0.02] hover:border-white/20'
                                  }`}
                                >
                                  <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                      <div className={`w-4 h-4 border-2 flex-shrink-0 flex items-center justify-center transition-colors ${isSelected ? 'border-gold' : 'border-white/20'}`}>
                                        {isSelected && <div className="w-2 h-2 bg-gold" />}
                                      </div>
                                      <div>
                                        <p className="font-sans text-sm text-cream font-medium">
                                          {rate.courier_name}
                                          <span className="font-normal text-cream/60 ml-1">— {rate.courier_service_name}</span>
                                        </p>
                                        <p className="font-sans text-xs text-cream/35 mt-0.5">Estimasi tiba {duration}</p>
                                      </div>
                                    </div>
                                    <p className="font-sans text-sm font-medium flex-shrink-0">
                                      {isFreeShipping
                                        ? <span className="text-emerald-400">Gratis</span>
                                        : <span className="text-cream">{formatPrice(rate.price)}</span>
                                      }
                                    </p>
                                  </div>
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => { if (!selectedRate && !isFreeShipping) { toast.error('Pilih kurir dulu'); return } setStep(3) }}
                    className="btn-luxury w-full py-4 flex items-center justify-center gap-2 text-sm tracking-widest"
                  >
                    Lanjut ke Pembayaran <ChevronRight size={15} />
                  </button>
                  <button type="button" onClick={() => setStep(1)} className="flex items-center justify-center gap-1.5 w-full font-sans text-xs text-cream/30 hover:text-cream/60 transition-colors">
                    <ArrowLeft size={12} /> Ubah alamat
                  </button>
                </motion.div>
              )}

              {/* ── STEP 3: Pembayaran ── */}
              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="space-y-4">
                  <h2 className="font-display text-2xl text-cream">Metode Pembayaran</h2>

                  <div className="space-y-2">
                    {PAYMENT_METHODS.map((method) => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setSelectedPayment(method.id)}
                        className={`w-full text-left px-4 py-4 border transition-all ${
                          selectedPayment === method.id ? 'border-gold/40 bg-gold/5' : 'border-white/[0.08] bg-white/[0.02] hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-4 h-4 border-2 flex-shrink-0 flex items-center justify-center ${selectedPayment === method.id ? 'border-gold' : 'border-white/20'}`}>
                            {selectedPayment === method.id && <div className="w-2 h-2 bg-gold" />}
                          </div>
                          <span className={selectedPayment === method.id ? 'text-gold' : 'text-cream/40'}>{PAYMENT_ICONS[method.id]}</span>
                          <div>
                            <p className="font-sans text-sm text-cream">{method.name}</p>
                            <p className="font-sans text-xs text-cream/35">{method.description}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 px-4 py-3 bg-white/[0.02] border border-white/[0.06]">
                    <Lock size={13} className="text-gold/50 flex-shrink-0" />
                    <p className="font-sans text-xs text-cream/30">Transaksi dienkripsi SSL 256-bit. Data pribadi kamu aman.</p>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-luxury w-full py-4 flex items-center justify-center gap-2 disabled:opacity-60 text-sm tracking-widest"
                  >
                    {isSubmitting
                      ? <><Loader2 size={15} className="animate-spin" /> Memproses...</>
                      : <><Lock size={14} /> Buat Pesanan · {formatPrice(total)}</>
                    }
                  </button>
                  <button type="button" onClick={() => setStep(2)} className="flex items-center justify-center gap-1.5 w-full font-sans text-xs text-cream/30 hover:text-cream/60 transition-colors">
                    <ArrowLeft size={12} /> Kembali
                  </button>
                </motion.div>
              )}

            </AnimatePresence>
          </form>

          {/* Right: Ringkasan */}
          <div className="lg:sticky lg:top-24 h-fit space-y-3">
            <div className="border border-white/[0.08] bg-white/[0.02]">
              <div className="px-5 py-3.5 border-b border-white/[0.06]">
                <p className="font-sans text-xs tracking-widest uppercase text-cream/40">Ringkasan Pesanan</p>
              </div>
              <div className="p-5 space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative w-14 h-14 bg-obsidian-3 flex-shrink-0">
                      <Image src={item.imageUrl ?? '/images/placeholder-product.jpg'} alt={item.name} fill className="object-cover" sizes="56px" />
                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-obsidian border border-white/10 text-cream text-[9px] font-sans flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-sans text-xs text-cream truncate">{item.name}</p>
                      <p className="font-sans text-[10px] text-cream/30 mt-0.5">50ml · Extrait De Parfum</p>
                    </div>
                    <p className="font-sans text-sm text-cream flex-shrink-0">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>

              <div className="px-5 pb-5 space-y-2 border-t border-white/[0.06] pt-4">
                <div className="flex justify-between font-sans text-sm text-cream/50">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between font-sans text-sm text-cream/50">
                  <span>Ongkir{selectedRate ? ` (${selectedRate.courier_name})` : ''}</span>
                  <span>
                    {isFreeShipping
                      ? <span className="text-emerald-400">Gratis</span>
                      : selectedRate ? formatPrice(selectedRate.price) : <span className="text-cream/25">Belum dipilih</span>
                    }
                  </span>
                </div>
                <div className="flex justify-between font-display text-lg text-cream pt-3 border-t border-white/[0.06]">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
            </div>

            {/* Keamanan */}
            <div className="flex items-center justify-center gap-4 py-3 opacity-40">
              <Lock size={11} className="text-cream/60" />
              <p className="font-sans text-[10px] tracking-widest uppercase text-cream/60">Pembayaran Aman</p>
              <Lock size={11} className="text-cream/60" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
