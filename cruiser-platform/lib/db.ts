/**
 * Cloudflare D1 database client.
 * In Next.js (Pages/App Router deployed to Cloudflare), the DB binding is
 * injected via the `getRequestContext()` helper from @cloudflare/next-on-pages.
 * For local dev we fall back to a D1 REST API shim or libsql.
 */
import type { D1Database, D1Result } from '@cloudflare/workers-types'

export type Database = D1Database

let _db: D1Database | null = null

export function getDb(): D1Database {
  if (_db) return _db

  // When running inside Cloudflare Pages / Workers
  if (typeof (globalThis as Record<string, unknown>).DB !== 'undefined') {
    _db = (globalThis as Record<string, unknown>).DB as D1Database
    return _db
  }

  throw new Error(
    'D1 database binding not available. Ensure you are running inside Cloudflare Workers or use the wrangler dev server.',
  )
}

// ── Generic query helpers ──────────────────────────────────────────

export async function queryOne<T>(
  db: D1Database,
  sql: string,
  params: unknown[] = [],
): Promise<T | null> {
  const result = await db.prepare(sql).bind(...params).first<T>()
  return result ?? null
}

export async function queryAll<T>(
  db: D1Database,
  sql: string,
  params: unknown[] = [],
): Promise<T[]> {
  const { results } = await db.prepare(sql).bind(...params).all<T>()
  return results
}

export async function execute(
  db: D1Database,
  sql: string,
  params: unknown[] = [],
): Promise<D1Result> {
  return db.prepare(sql).bind(...params).run()
}

// ── Product queries ────────────────────────────────────────────────

export interface ProductRow {
  id: string
  name: string
  slug: string
  tagline: string | null
  description: string
  story: string | null
  category_id: string | null
  price: number
  compare_price: number | null
  sku: string | null
  stock: number
  volume_ml: number
  concentration: string
  dna: string | null
  scent_notes: string | null
  color_accent: string | null
  is_featured: number
  is_bestseller: number
  is_new: number
  is_active: number
  sort_order: number
  meta_title: string | null
  meta_desc: string | null
  created_at: string
  updated_at: string
}

export interface ProductImageRow {
  id: string
  product_id: string
  url: string
  alt: string | null
  sort_order: number
  is_primary: number
}

export async function getProducts(
  db: D1Database,
  opts: {
    limit?: number
    offset?: number
    featured?: boolean
    bestseller?: boolean
    isNew?: boolean
    categorySlug?: string
    search?: string
    sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'popular'
  } = {},
) {
  const conditions: string[] = ['p.is_active = 1']
  const params: unknown[] = []

  if (opts.featured) {
    conditions.push('p.is_featured = 1')
  }
  if (opts.bestseller) {
    conditions.push('p.is_bestseller = 1')
  }
  if (opts.isNew) {
    conditions.push('p.is_new = 1')
  }
  if (opts.search) {
    conditions.push('(p.name LIKE ? OR p.description LIKE ?)')
    params.push(`%${opts.search}%`, `%${opts.search}%`)
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

  const orderMap: Record<string, string> = {
    price_asc: 'p.price ASC',
    price_desc: 'p.price DESC',
    newest: 'p.created_at DESC',
    popular: 'p.is_bestseller DESC, p.sort_order ASC',
  }
  const order = orderMap[opts.sortBy ?? ''] ?? 'p.sort_order ASC'

  const limit = opts.limit ?? 12
  const offset = opts.offset ?? 0

  const sql = `
    SELECT p.*,
      (SELECT pi.url FROM product_images pi WHERE pi.product_id = p.id AND pi.is_primary = 1 LIMIT 1) as primary_image,
      (SELECT AVG(r.rating) FROM reviews r WHERE r.product_id = p.id AND r.is_approved = 1) as avg_rating,
      (SELECT COUNT(*) FROM reviews r WHERE r.product_id = p.id AND r.is_approved = 1) as review_count
    FROM products p
    ${where}
    ORDER BY ${order}
    LIMIT ? OFFSET ?
  `
  params.push(limit, offset)

  return queryAll<ProductRow & { primary_image: string | null; avg_rating: number | null; review_count: number }>(
    db, sql, params,
  )
}

export async function getProductBySlug(db: D1Database, slug: string) {
  const product = await queryOne<ProductRow>(
    db,
    'SELECT * FROM products WHERE slug = ? AND is_active = 1',
    [slug],
  )
  if (!product) return null

  const images = await queryAll<ProductImageRow>(
    db,
    'SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order ASC',
    [product.id],
  )

  return { ...product, images }
}

// ── Order queries ──────────────────────────────────────────────────

export async function getOrdersByUser(db: D1Database, userId: string) {
  return queryAll(
    db,
    `SELECT o.*,
      (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) as item_count
     FROM orders o WHERE o.user_id = ? ORDER BY o.created_at DESC`,
    [userId],
  )
}
