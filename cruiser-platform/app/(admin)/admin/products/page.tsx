import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, Edit2, Eye } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { getDb } from '@/lib/db/index'
import { products } from '@/lib/db/schema'
import { asc } from 'drizzle-orm'

export const metadata: Metadata = { title: 'Product Management' }

async function getAdminProducts() {
  try {
    const db = await getDb()
    return await db.select().from(products).orderBy(asc(products.sortOrder))
  } catch {
    return []
  }
}

export default async function AdminProductsPage() {
  const productList = await getAdminProducts()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl text-cream">Products</h1>
          <p className="font-sans text-xs text-cream/40 mt-1">{productList.length} products</p>
        </div>
        <Link href="/admin/products/new" className="btn-luxury flex items-center gap-2">
          <Plus size={15} />
          Add Product
        </Link>
      </div>

      {/* Table */}
      <div className="glass overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {['Product', 'SKU', 'Price', 'Stock', 'Status', 'Actions'].map((h) => (
                <th key={h} className="text-left py-3 px-4 font-sans text-[9px] tracking-widest uppercase text-cream/30">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {productList.map((product) => {
              const images = (() => { try { return JSON.parse(product.imagesJson) } catch { return [] } })()
              const primaryImage = images[0]?.url ?? `/images/${product.slug}-bottles.png`
              return (
                <tr key={product.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-14 bg-obsidian-3 flex-shrink-0">
                        <Image
                          src={primaryImage}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>
                      <div>
                        <p className="font-sans text-sm text-cream">{product.name}</p>
                        {product.isBestseller && (
                          <span className="font-sans text-[9px] tracking-widest uppercase text-gold bg-gold/10 px-2 py-0.5">
                            Bestseller
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 font-sans text-xs text-cream/50">{product.sku}</td>
                  <td className="py-4 px-4 font-sans text-sm text-cream">{formatPrice(product.price)}</td>
                  <td className="py-4 px-4">
                    <span className={`font-sans text-xs ${product.stock < 20 ? 'text-amber-400' : 'text-cream/60'}`}>
                      {product.stock} units
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`font-sans text-[9px] tracking-widest uppercase px-2.5 py-1 border ${product.isActive ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' : 'text-cream/30 border-white/10'}`}>
                      {product.isActive ? 'active' : 'inactive'}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/products/${product.slug}`}
                        target="_blank"
                        className="w-8 h-8 flex items-center justify-center text-cream/30 hover:text-cream transition-colors border border-white/10 hover:border-white/20"
                      >
                        <Eye size={13} />
                      </Link>
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="w-8 h-8 flex items-center justify-center text-cream/30 hover:text-gold transition-colors border border-white/10 hover:border-gold/30"
                      >
                        <Edit2 size={13} />
                      </Link>
                    </div>
                  </td>
                </tr>
              )
            })}
            {productList.length === 0 && (
              <tr>
                <td colSpan={6} className="py-12 text-center font-sans text-sm text-cream/30">
                  Belum ada produk
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

