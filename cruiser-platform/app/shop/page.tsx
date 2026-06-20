import type { Metadata } from 'next'
import { Suspense } from 'react'
import { ShopClient } from './ShopClient'
import { SITE } from '@/lib/constants'
import type { Product, ScentNote, ProductImage } from '@/types'
import { getDb } from '@/lib/db/index'
import { products } from '@/lib/db/schema'
import { eq, asc } from 'drizzle-orm'

export const revalidate = 30

export const metadata: Metadata = {
  title: 'Shop — All Fragrances',
  description: `Explore the complete CRUISER fragrance collection. ${SITE.description}`,
  alternates: { canonical: `${SITE.url}/shop` },
}

async function getShopProducts(): Promise<Product[]> {
  try {
    const db = await getDb()
    const rows = await db
      .select()
      .from(products)
      .where(eq(products.isActive, true))
      .orderBy(asc(products.sortOrder))
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      tagline: row.tagline ?? null,
      description: row.description ?? '',
      story: row.story ?? null,
      categoryId: null,
      price: row.price,
      comparePrice: row.comparePrice ?? null,
      sku: row.sku,
      stock: row.stock,
      volumeMl: row.volumeMl,
      concentration: row.concentration,
      dna: JSON.parse(row.dna) as string[],
      scentNotes: JSON.parse(row.scentNotes) as ScentNote[],
      colorAccent: row.colorAccent,
      isFeatured: row.isFeatured,
      isBestseller: row.isBestseller,
      isNew: row.isNew,
      isActive: row.isActive,
      sortOrder: row.sortOrder,
      metaTitle: null,
      metaDesc: null,
      images: JSON.parse(row.imagesJson) as ProductImage[],
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }))
  } catch (e) {
    console.error('Shop page: failed to load products from DB:', e)
    return []
  }
}

export default async function ShopPage() {
  const shopProducts = await getShopProducts()

  return (
    <div className="min-h-screen pt-24">
      <div className="container max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="label-gold mx-auto w-fit mb-6">Collection</p>
          <h1 className="font-display text-[clamp(2.5rem,6vw,4rem)] text-cream mb-4">
            Find Your Signature Scent
          </h1>
          <p className="font-serif text-cream/50 text-lg max-w-xl mx-auto">
            Three signature fragrances, one extraordinary brand. Each crafted to tell your story.
          </p>
        </div>

        <Suspense fallback={<ShopSkeleton />}>
          <ShopClient products={shopProducts} />
        </Suspense>
      </div>
    </div>
  )
}

function ShopSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-[3/4] bg-obsidian-3 mb-4" />
          <div className="h-3 bg-obsidian-3 w-2/3 mb-2" />
          <div className="h-5 bg-obsidian-3 w-1/2 mb-2" />
          <div className="h-4 bg-obsidian-3 w-1/3" />
        </div>
      ))}
    </div>
  )
}

