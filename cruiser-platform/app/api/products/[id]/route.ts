import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db/index'
import { products } from '@/lib/db/schema'
import { eq, or } from 'drizzle-orm'
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
  }
}

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { id } = await params
  try {
    const db = await getDb()
    const rows = await db
      .select()
      .from(products)
      .where(or(eq(products.id, id), eq(products.slug, id)))
      .limit(1)

    if (!rows[0]) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    return NextResponse.json({ product: deserializeProduct(rows[0]) })
  } catch (e) {
    console.error('GET /api/products/[id] error:', e)
    return NextResponse.json({ error: 'Failed to load product' }, { status: 500 })
  }
}
