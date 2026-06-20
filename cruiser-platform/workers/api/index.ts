/**
 * Cloudflare Worker — API handler for Cruiser Parfum
 * Handles D1 queries, R2 uploads, and payment webhooks
 * at the edge for maximum performance.
 */

import type { D1Database, R2Bucket, ExecutionContext } from '@cloudflare/workers-types'

export interface Env {
  DB: D1Database
  R2: R2Bucket
  ENVIRONMENT: string
  MIDTRANS_SERVER_KEY: string
  XENDIT_SECRET_KEY: string
  XENDIT_WEBHOOK_TOKEN: string
  AUTH_SECRET: string
}

interface RouteHandler {
  method: string
  pattern: RegExp
  handler: (req: Request, env: Env, ctx: ExecutionContext, match: RegExpMatchArray) => Promise<Response>
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  })
}

function error(message: string, status = 400): Response {
  return json({ error: message }, status)
}

// ── Route handlers ────────────────────────────────────────────────

const routes: RouteHandler[] = [
  // Products
  {
    method: 'GET',
    pattern: /^\/api\/worker\/products$/,
    handler: async (req, env) => {
      const url = new URL(req.url)
      const limit = parseInt(url.searchParams.get('limit') ?? '12', 10)
      const offset = parseInt(url.searchParams.get('offset') ?? '0', 10)
      const featured = url.searchParams.get('featured') === 'true'

      let sql = 'SELECT p.*, (SELECT pi.url FROM product_images pi WHERE pi.product_id = p.id AND pi.is_primary = 1 LIMIT 1) as primary_image FROM products p WHERE p.is_active = 1'
      const params: unknown[] = []

      if (featured) { sql += ' AND p.is_featured = 1'; }

      sql += ' ORDER BY p.sort_order ASC LIMIT ? OFFSET ?'
      params.push(limit, offset)

      const { results } = await env.DB.prepare(sql).bind(...params).all()
      const { results: countResult } = await env.DB.prepare('SELECT COUNT(*) as total FROM products WHERE is_active = 1').all()
      const total = (countResult[0] as { total: number })?.total ?? 0

      return json({ data: results, total, page: Math.floor(offset / limit) + 1, limit })
    },
  },

  // Single product
  {
    method: 'GET',
    pattern: /^\/api\/worker\/products\/([^/]+)$/,
    handler: async (req, env, _, match) => {
      const slug = match[1]
      const product = await env.DB.prepare(
        'SELECT * FROM products WHERE slug = ? AND is_active = 1',
      ).bind(slug).first()

      if (!product) return error('Product not found', 404)

      const { results: images } = await env.DB.prepare(
        'SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order ASC',
      ).bind((product as { id: string }).id).all()

      return json({ data: { ...product, images } })
    },
  },

  // R2 upload
  {
    method: 'POST',
    pattern: /^\/api\/worker\/upload$/,
    handler: async (req, env) => {
      const formData = await req.formData()
      const file = formData.get('file') as File | null
      if (!file) return error('No file provided')

      const key = `products/${Date.now()}-${file.name.replace(/[^a-z0-9.-]/gi, '-')}`
      await env.R2.put(key, await file.arrayBuffer(), {
        httpMetadata: { contentType: file.type },
      })

      return json({ key, url: `/${key}` })
    },
  },

  // Newsletter subscribe
  {
    method: 'POST',
    pattern: /^\/api\/worker\/newsletter$/,
    handler: async (req, env) => {
      const { email, name } = await req.json() as { email: string; name?: string }
      if (!email || !email.includes('@')) return error('Invalid email')

      await env.DB.prepare(
        'INSERT OR IGNORE INTO newsletter_subscribers (id, email, name) VALUES (?, ?, ?)',
      ).bind(crypto.randomUUID(), email, name ?? null).run()

      return json({ success: true })
    },
  },

  // Health check
  {
    method: 'GET',
    pattern: /^\/api\/worker\/health$/,
    handler: async () => json({ status: 'ok', timestamp: new Date().toISOString() }),
  },
]

export default {
  async fetch(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(req.url)
    const path = url.pathname

    // CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      })
    }

    for (const route of routes) {
      const match = path.match(route.pattern)
      if (match && req.method === route.method) {
        try {
          return await route.handler(req, env, ctx, match)
        } catch (err) {
          console.error('Worker error:', err)
          return error('Internal server error', 500)
        }
      }
    }

    return error('Not found', 404)
  },
}
