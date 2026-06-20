import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db/index'
import { products } from '@/lib/db/schema'
import { eq, asc } from 'drizzle-orm'
import type { ProductImage, ScentNote } from '@/types'

function deserializeProduct(row: typeof products.$inferSelect) {
  return {
    ...row,
    categoryId: null,
    dna: JSON.parse(row.dna) as string[],
    scentNotes: JSON.parse(row.scentNotes) as ScentNote[],
    images: JSON.parse(row.imagesJson) as ProductImage[],
    metaTitle: null,
    metaDesc: null,
    avgRating: undefined,
    reviewCount: undefined,
  }
}

export async function GET() {
  try {
    const db = await getDb()
    const rows = await db
      .select()
      .from(products)
      .where(eq(products.isActive, true))
      .orderBy(asc(products.sortOrder))
    return NextResponse.json({ products: rows.map(deserializeProduct) })
  } catch (e) {
    console.error('GET /api/products error:', e)
    return NextResponse.json({ error: 'Failed to load products' }, { status: 500 })
  }
}

