import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  passwordHash: text('password_hash'), // null for Google OAuth users
  role: text('role', { enum: ['customer', 'admin'] }).notNull().default('customer'),
  phone: text('phone'),
  address: text('address'),
  city: text('city'),
  province: text('province'),
  postalCode: text('postal_code'),
  profileComplete: integer('profile_complete', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull(),
})

export const products = sqliteTable('products', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  tagline: text('tagline'),
  description: text('description'),
  story: text('story'),
  price: integer('price').notNull(),
  comparePrice: integer('compare_price'),
  sku: text('sku').notNull(),
  stock: integer('stock').notNull().default(0),
  volumeMl: integer('volume_ml').notNull().default(50),
  concentration: text('concentration').notNull().default('Extrait De Parfum'),
  colorAccent: text('color_accent').notNull().default('#C9A84C'),
  dna: text('dna').notNull().default('[]'),           // JSON array
  scentNotes: text('scent_notes').notNull().default('[]'), // JSON array
  imagesJson: text('images_json').notNull().default('[]'), // JSON array of image objects
  isFeatured: integer('is_featured', { mode: 'boolean' }).notNull().default(false),
  isBestseller: integer('is_bestseller', { mode: 'boolean' }).notNull().default(false),
  isNew: integer('is_new', { mode: 'boolean' }).notNull().default(false),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(99),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
})

export const orders = sqliteTable('orders', {
  id: text('id').primaryKey(),
  number: text('number').notNull().unique(),
  email: text('email').notNull(),
  recipient: text('recipient').notNull(),
  phone: text('phone').notNull(),
  address: text('address').notNull(),
  city: text('city').notNull().default(''),
  province: text('province').notNull().default(''),
  postalCode: text('postal_code').notNull().default(''),
  notes: text('notes'),
  shippingMethod: text('shipping_method').notNull().default(''),
  courier: text('courier'),
  shippingCost: integer('shipping_cost').notNull().default(0),
  subtotal: integer('subtotal').notNull(),
  total: integer('total').notNull(),
  paymentMethod: text('payment_method').notNull(),
  status: text('status', { enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] }).notNull().default('pending'),
  trackingNumber: text('tracking_number'),
  isGuest: integer('is_guest', { mode: 'boolean' }).notNull().default(false),
  userId: text('user_id'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
})

export const orderItems = sqliteTable('order_items', {
  id: text('id').primaryKey(),
  orderId: text('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  productId: text('product_id').notNull(),
  name: text('name').notNull(),
  price: integer('price').notNull(),
  quantity: integer('quantity').notNull(),
  imageUrl: text('image_url'),
})

export const coupons = sqliteTable('coupons', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(),
  type: text('type', { enum: ['percentage', 'fixed', 'free_shipping'] }).notNull(),
  value: integer('value').notNull().default(0),
  minOrder: integer('min_order').notNull().default(0),
  maxUses: integer('max_uses'),
  usedCount: integer('used_count').notNull().default(0),
  expiresAt: text('expires_at'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull(),
})

export const adminSettings = sqliteTable('admin_settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  updatedAt: text('updated_at').notNull(),
})
