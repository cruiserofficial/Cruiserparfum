import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ProductPageContent } from '@/components/product/ProductPageContent'
import { ProductReviews } from '@/components/product/ProductReviews'
import { RelatedProducts } from '@/components/product/RelatedProducts'
import { SITE } from '@/lib/constants'
import type { Product, ScentNote, ProductImage } from '@/types'
import { getDb } from '@/lib/db/index'
import { products } from '@/lib/db/schema'
import { eq, asc, ne } from 'drizzle-orm'

export const revalidate = 30

interface Props {
  params: Promise<{ slug: string }>
}

async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const db = await getDb()
    const rows = await db.select().from(products).where(eq(products.slug, slug)).limit(1)
    if (!rows[0]) return null
    const row = rows[0]
    return {
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
    }
  } catch (e) {
    console.error('getProductBySlug error:', e)
    return null
  }
}

async function getRelatedProducts(currentSlug: string): Promise<Product[]> {
  try {
    const db = await getDb()
    const rows = await db
      .select()
      .from(products)
      .where(ne(products.slug, currentSlug))
      .orderBy(asc(products.sortOrder))
      .limit(3)
    return rows.map((row: typeof products.$inferSelect) => ({
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
  } catch {
    return []
  }
}

export async function generateStaticParams() {
  // Return known slugs so the build doesn't fail without a DB
  return ['eternity', 'noctis', 'liberea'].map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return {}

  const title = product.metaTitle ?? `CRUISER ${product.name.toUpperCase()} — ${product.tagline}`
  const description =
    product.metaDesc ??
    `${product.name} by CRUISER — ${product.dna?.join(', ')} Extrait De Parfum. ${product.description}`

  const imageUrl = product.images?.[0]?.url ?? '/og-image.jpg'

  return {
    title,
    description,
    alternates: { canonical: `${SITE.url}/products/${slug}` },
    openGraph: {
      title,
      description,
      url: `${SITE.url}/products/${slug}`,
      type: 'website',
      images: [{ url: imageUrl, width: 800, height: 800, alt: title }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [imageUrl] },
  }
}

function ProductSchema({ product }: { product: Product }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `CRUISER ${product.name.toUpperCase()}`,
    description: product.description,
    brand: { '@type': 'Brand', name: 'CRUISER' },
    image: product.images?.map((img) => `${SITE.url}${img.url}`) ?? [],
    sku: product.sku,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'IDR',
      availability:
        product.stock > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      url: `${SITE.url}/products/${product.slug}`,
      seller: { '@type': 'Organization', name: 'CRUISER' },
    },
    aggregateRating:
      product.avgRating && product.reviewCount
        ? {
            '@type': 'AggregateRating',
            ratingValue: product.avgRating,
            reviewCount: product.reviewCount,
          }
        : undefined,
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) notFound()

  const related = await getRelatedProducts(slug)

  return (
    <>
      <ProductSchema product={product} />
      <div className="min-h-screen pt-24">
        <div className="container max-w-7xl mx-auto px-6 py-12">
          <ProductPageContent baseProduct={product} />
          <ProductReviews productId={product.id} />
          <RelatedProducts products={related} currentSlug={slug} />
        </div>
      </div>
    </>
  )
}
