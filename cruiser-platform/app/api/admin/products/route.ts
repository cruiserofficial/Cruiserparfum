import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import { getDb } from '@/lib/db/index'
import { products } from '@/lib/db/schema'
import { eq, asc } from 'drizzle-orm'
import { z } from 'zod'
import type { ProductImage, ScentNote } from '@/types'

const newProductSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  tagline: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  story: z.string().nullable().optional(),
  price: z.number().int().positive(),
  comparePrice: z.number().int().positive().nullable().optional(),
  sku: z.string().min(1),
  stock: z.number().int().min(0).default(0),
  volumeMl: z.number().int().positive().default(50),
  concentration: z.string().default('Extrait De Parfum'),
  colorAccent: z.string().default('#C9A84C'),
  dna: z.array(z.string()).default([]),
  scentNotes: z.array(z.object({
    name: z.string(),
    icon: z.string(),
    type: z.enum(['top', 'heart', 'base']),
  })).default([]),
  isFeatured: z.boolean().default(false),
  isBestseller: z.boolean().default(false),
  isNew: z.boolean().default(true),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(99),
})

function deserializeProduct(row: typeof products.$inferSelect) {
  return {
    ...row,
    dna: JSON.parse(row.dna) as string[],
    scentNotes: JSON.parse(row.scentNotes) as ScentNote[],
    images: JSON.parse(row.imagesJson) as ProductImage[],
  }
}

export async function GET() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const db = await getDb()
    const rows = await db.select().from(products).orderBy(asc(products.sortOrder))
    return NextResponse.json({ products: rows.map(deserializeProduct) })
  } catch (e) {
    console.error('GET /api/admin/products error:', e)
    return NextResponse.json({ error: 'Failed to load products' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const data = newProductSchema.parse(body)

    const db = await getDb()
    const now = new Date().toISOString()
    const id = `prod-${data.slug}`

    await db.insert(products).values({
      id,
      name: data.name,
      slug: data.slug,
      tagline: data.tagline ?? null,
      description: data.description ?? null,
      story: data.story ?? null,
      price: data.price,
      comparePrice: data.comparePrice ?? null,
      sku: data.sku,
      stock: data.stock,
      volumeMl: data.volumeMl,
      concentration: data.concentration,
      colorAccent: data.colorAccent,
      dna: JSON.stringify(data.dna),
      scentNotes: JSON.stringify(data.scentNotes),
      imagesJson: '[]',
      isFeatured: data.isFeatured,
      isBestseller: data.isBestseller,
      isNew: data.isNew,
      isActive: data.isActive,
      sortOrder: data.sortOrder,
      createdAt: now,
      updatedAt: now,
    })

    const inserted = await db.select().from(products).where(eq(products.id, id)).limit(1)

    revalidatePath('/admin/products')
    revalidatePath('/shop')
    revalidatePath('/')

    return NextResponse.json({ product: inserted[0] }, { status: 201 })
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: e.errors }, { status: 400 })
    }
    console.error('POST /api/admin/products error:', e)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}

