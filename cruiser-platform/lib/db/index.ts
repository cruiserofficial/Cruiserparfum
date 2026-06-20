import { drizzle as drizzleD1 } from 'drizzle-orm/d1'
import type { DrizzleD1Database } from 'drizzle-orm/d1'
import * as schema from './schema'

export type AppDB = DrizzleD1Database<typeof schema>

// Cache the libsql/Turso db instance across invocations of a warm instance
let _libsqlDb: AppDB | null = null

export async function getDb(): Promise<AppDB> {
  // Cloudflare Pages — use D1 binding when available
  try {
    const { getCloudflareContext } = await import('@opennextjs/cloudflare')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ctx = await (getCloudflareContext as any)({ async: true })
    const d1 = ctx?.env?.DB
    if (d1) {
      return drizzleD1(d1, { schema }) as AppDB
    }
  } catch {
    // Not running in Cloudflare context — fall through
  }

  // Vercel / any other host — use Turso (LibSQL) via DATABASE_URL,
  // or a local SQLite file for pure local dev with no DB configured.
  if (!_libsqlDb) {
    const { createClient } = await import('@libsql/client')
    const { drizzle: drizzleLibSQL } = await import('drizzle-orm/libsql')
    const client = createClient({
      url: process.env.DATABASE_URL ?? 'file:local.db',
      authToken: process.env.DATABASE_AUTH_TOKEN,
    })
    _libsqlDb = drizzleLibSQL(client, { schema }) as unknown as AppDB
  }
  return _libsqlDb
}
