import type { Metadata } from 'next'
import { HeroSection } from '@/components/home/HeroSection'
import { ProductsShowcase } from '@/components/home/ProductsShowcase'
import { BrandStory } from '@/components/home/BrandStory'
import { Testimonials } from '@/components/home/Testimonials'
import { FAQ } from '@/components/home/FAQ'
import { SITE } from '@/lib/constants'
import type { Product, ScentNote, ProductImage } from '@/types'
import { getDb } from '@/lib/db/index'
import { products } from '@/lib/db/schema'
import { eq, asc } from 'drizzle-orm'

export const revalidate = 30

export const metadata: Metadata = {
  title: `${SITE.name} — ${SITE.tagline}`,
  description: SITE.description,
  alternates: { canonical: SITE.url },
}

function OrganizationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE.name,
    url: SITE.url,
    logo: `${SITE.url}/images/logo.png`,
    description: SITE.description,
    sameAs: [SITE.instagram, SITE.shopee],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: SITE.email,
    },
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

function WebsiteSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE.name,
    url: SITE.url,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE.url}/shop?search={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

async function getHomeProducts(): Promise<Product[]> {
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
    console.error('Home page: failed to load products from DB:', e)
    return []
  }
}

export default async function HomePage() {
  const dbProducts = await getHomeProducts()

  return (
    <>
      <OrganizationSchema />
      <WebsiteSchema />
      <HeroSection />
      <ProductsShowcase products={dbProducts} />
      <BrandStory />
      <Testimonials />
      <FAQ />
    </>
  )
}

