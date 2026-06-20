import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import { getDb } from '@/lib/db/index'
import { products } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

const productUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  tagline: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  story: z.string().nullable().optional(),
  price: z.number().int().positive().optional(),
  comparePrice: z.number().int().positive().nullable().optional(),
  sku: z.string().min(1).optional(),
  stock: z.number().int().min(0).optional(),
  volumeMl: z.number().int().positive().optional(),
  concentration: z.string().optional(),
  colorAccent: z.string().optional(),
  dna: z.array(z.string()).optional(),
  scentNotes: z.array(z.object({
    name: z.string(),
    icon: z.string(),
    type: z.enum(['top', 'heart', 'base']),
  })).optional(),
  isFeatured: z.boolean().optional(),
  isBestseller: z.boolean().optional(),
  isNew: z.boolean().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
})

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  try {
    const body = await req.json()
    const data = productUpdateSchema.parse(body)

    const db = await getDb()
    const now = new Date().toISOString()

    const updateData: Partial<typeof products.$inferInsert> = {
      updatedAt: now,
    }

    if (data.name !== undefined) updateData.name = data.name
    if (data.slug !== undefined) updateData.slug = data.slug
    if (data.tagline !== undefined) updateData.tagline = data.tagline ?? undefined
    if (data.description !== undefined) updateData.description = data.description ?? undefined
    if (data.story !== undefined) updateData.story = data.story ?? undefined
    if (data.price !== undefined) updateData.price = data.price
    if (data.comparePrice !== undefined) updateData.comparePrice = data.comparePrice ?? undefined
    if (data.sku !== undefined) updateData.sku = data.sku
    if (data.stock !== undefined) updateData.stock = data.stock
    if (data.volumeMl !== undefined) updateData.volumeMl = data.volumeMl
    if (data.concentration !== undefined) updateData.concentration = data.concentration
    if (data.colorAccent !== undefined) updateData.colorAccent = data.colorAccent
    if (data.dna !== undefined) updateData.dna = JSON.stringify(data.dna)
    if (data.scentNotes !== undefined) updateData.scentNotes = JSON.stringify(data.scentNotes)
    if (data.isFeatured !== undefined) updateData.isFeatured = data.isFeatured
    if (data.isBestseller !== undefined) updateData.isBestseller = data.isBestseller
    if (data.isNew !== undefined) updateData.isNew = data.isNew
    if (data.isActive !== undefined) updateData.isActive = data.isActive
    if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder

    await db.update(products).set(updateData).where(eq(products.id, id))

    const updated = await db.select().from(products).where(eq(products.id, id)).limit(1)
    if (!updated[0]) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Bust cache for public pages so the price/data change shows up immediately
    revalidatePath('/admin/products')
    revalidatePath(`/products/${updated[0].slug}`)
    revalidatePath('/shop')
    revalidatePath('/')

    return NextResponse.json({ product: updated[0] })
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: e.errors }, { status: 400 })
    }
    console.error('PUT /api/admin/products/[id] error:', e)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}
