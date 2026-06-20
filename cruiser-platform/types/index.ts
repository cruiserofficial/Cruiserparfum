export type UserRole = 'customer' | 'admin' | 'superadmin'

export interface User {
  id: string
  email: string
  name: string | null
  image: string | null
  role: UserRole
  phone: string | null
  emailVerified: boolean
  createdAt: string
  updatedAt: string
}

export interface Address {
  id: string
  userId: string
  label: string
  recipient: string
  phone: string
  address: string
  city: string
  province: string
  postalCode: string
  country: string
  isDefault: boolean
  createdAt: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  imageUrl: string | null
  isActive: boolean
  sortOrder: number
}

export interface ScentNote {
  name: string
  icon: string
  type: 'top' | 'heart' | 'base'
}

export interface Product {
  id: string
  name: string
  slug: string
  tagline: string | null
  description: string
  story: string | null
  categoryId: string | null
  price: number
  comparePrice: number | null
  sku: string | null
  stock: number
  volumeMl: number
  concentration: string
  dna: string[]
  scentNotes: ScentNote[]
  colorAccent: string | null
  isFeatured: boolean
  isBestseller: boolean
  isNew: boolean
  isActive: boolean
  sortOrder: number
  metaTitle: string | null
  metaDesc: string | null
  images?: ProductImage[]
  reviews?: Review[]
  avgRating?: number
  reviewCount?: number
  createdAt: string
  updatedAt: string
}

export interface ProductImage {
  id: string
  productId: string
  url: string
  alt: string | null
  sortOrder: number
  isPrimary: boolean
}

export interface CartItem {
  id: string
  productId: string
  name: string
  slug: string
  price: number
  imageUrl: string | null
  quantity: number
  stock: number
}

export interface Cart {
  items: CartItem[]
  subtotal: number
  itemCount: number
}

export type OrderStatus =
  | 'pending'
  | 'awaiting_payment'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'

export type PaymentStatus = 'unpaid' | 'paid' | 'failed' | 'refunded'

export type PaymentMethod =
  | 'qris'
  | 'bank_transfer'
  | 'midtrans'
  | 'stripe'
  | 'cod'

export interface Order {
  id: string
  orderNumber: string
  userId: string | null
  guestEmail: string | null
  status: OrderStatus
  paymentMethod: PaymentMethod | null
  paymentStatus: PaymentStatus
  paymentRef: string | null
  couponId: string | null
  subtotal: number
  discount: number
  shippingCost: number
  tax: number
  total: number
  shippingMethod: string | null
  recipient: string
  phone: string
  address: string
  city: string
  province: string
  postalCode: string
  country: string
  notes: string | null
  trackingNumber: string | null
  shippedAt: string | null
  deliveredAt: string | null
  items?: OrderItem[]
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  name: string
  imageUrl: string | null
  price: number
  quantity: number
  subtotal: number
}

export interface Review {
  id: string
  productId: string
  userId: string | null
  orderId: string | null
  name: string
  rating: number
  title: string | null
  body: string
  isVerified: boolean
  isApproved: boolean
  createdAt: string
}

export interface Coupon {
  id: string
  code: string
  type: 'percentage' | 'fixed' | 'free_shipping'
  value: number
  minOrder: number
  maxDiscount: number | null
  usageLimit: number | null
  usageCount: number
  userLimit: number | null
  isActive: boolean
  startsAt: string | null
  expiresAt: string | null
}

export interface Banner {
  id: string
  title: string
  subtitle: string | null
  imageUrl: string
  link: string | null
  ctaText: string | null
  position: 'hero' | 'promotional' | 'sidebar'
  isActive: boolean
  sortOrder: number
  startsAt: string | null
  endsAt: string | null
}

export interface NewsletterSubscriber {
  id: string
  email: string
  name: string | null
  isActive: boolean
  source: string
  createdAt: string
}

// Payment abstraction types
export type PaymentProvider = 'midtrans' | 'stripe' | 'xendit' | 'manual'

export interface PaymentIntent {
  provider: PaymentProvider
  orderId: string
  amount: number
  currency: string
  customerEmail: string
  customerName: string
  metadata?: Record<string, string>
}

export interface PaymentResult {
  success: boolean
  transactionId?: string
  paymentUrl?: string
  snapToken?: string
  clientSecret?: string
  qrisUrl?: string
  vaNumbers?: VirtualAccount[]
  error?: string
}

export interface VirtualAccount {
  bank: string
  vaNumber: string
  expiresAt: string
}

// API Response types
export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Checkout types
export interface CheckoutForm {
  email: string
  recipient: string
  phone: string
  address: string
  city: string
  province: string
  postalCode: string
  country: string
  notes?: string
  shippingMethod: string
  paymentMethod: PaymentMethod
  couponCode?: string
}

export interface ShippingOption {
  id: string
  name: string
  description: string
  cost: number
  estimatedDays: string
}
