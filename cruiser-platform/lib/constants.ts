export const SITE = {
  name: 'CRUISER',
  tagline: 'Luxury in Every Note.',
  description:
    'CRUISER Extrait De Parfum — Three signature scents: Eternity, Noctis, Liberea. Premium luxury fragrances crafted with the finest ingredients.',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cruiserparfum.com',
  instagram: 'https://www.instagram.com/cruiser.official',
  shopee: 'https://id.shp.ee/1ftBwTk6',
  whatsapp: 'https://wa.me/6281234567890',
  email: 'cruiser.official1@gmail.com',
  established: '2026',
} as const

export const PRODUCTS = {
  eternity: {
    id: 'prod-eternity',
    slug: 'eternity',
    name: 'Eternity',
    tagline: 'Freshness That Lingers.',
    dna: ['Fresh', 'Sweet', 'Addictive'],
    color: '#8B9E6A',
  },
  noctis: {
    id: 'prod-noctis',
    slug: 'noctis',
    name: 'Noctis',
    tagline: 'Embrace the Night.',
    dna: ['Warm', 'Sensual', 'Deep'],
    color: '#7A1A45',
    isBestseller: true,
  },
  liberea: {
    id: 'prod-liberea',
    slug: 'liberea',
    name: 'Liberea',
    tagline: 'Softness in Every Note.',
    dna: ['Creamy', 'Fresh', 'Comforting'],
    color: '#1A5F8A',
  },
} as const

export const SHIPPING_OPTIONS = [
  {
    id: 'reguler',
    name: 'JNE Reguler',
    description: 'Estimasi 3-5 hari kerja',
    cost: 15000,
    estimatedDays: '3-5 hari',
  },
  {
    id: 'express',
    name: 'JNE YES (Express)',
    description: 'Estimasi 1-2 hari kerja',
    cost: 30000,
    estimatedDays: '1-2 hari',
  },
  {
    id: 'same-day',
    name: 'Same Day (Jabodetabek)',
    description: 'Tiba di hari yang sama',
    cost: 50000,
    estimatedDays: 'Hari ini',
  },
] as const

export const PAYMENT_METHODS = [
  { id: 'qris', name: 'QRIS', description: 'Semua e-wallet & mobile banking', icon: 'qris' },
  { id: 'bank_transfer', name: 'Transfer Bank', description: 'BCA, BNI, BRI, Mandiri', icon: 'bank' },
  { id: 'midtrans', name: 'Kartu Kredit/Debit', description: 'Visa, Mastercard, JCB', icon: 'card' },
  { id: 'cod', name: 'Bayar di Tempat (COD)', description: 'Tersedia untuk area tertentu', icon: 'cash' },
] as const

export const FREE_SHIPPING_THRESHOLD = 500_000

export const TAX_RATE = 0.11 // 11% PPN

export const PAGINATION = {
  defaultLimit: 12,
  adminLimit: 20,
} as const

export const GOLD = {
  DEFAULT: '#C9A84C',
  light: '#E8C96A',
} as const
