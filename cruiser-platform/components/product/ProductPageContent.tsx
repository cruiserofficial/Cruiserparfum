import { ProductGallery } from './ProductGallery'
import { ProductInfo } from './ProductInfo'
import { ScentNotes } from './ScentNotes'
import type { Product } from '@/types'

interface Props {
  baseProduct: Product
}

export function ProductPageContent({ baseProduct }: Props) {
  return (
    <>
      {/* Product main */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20 mb-24">
        <ProductGallery images={baseProduct.images ?? []} product={baseProduct} />
        <ProductInfo product={baseProduct} />
      </div>

      {/* Scent notes */}
      <ScentNotes notes={baseProduct.scentNotes} accent={baseProduct.colorAccent} />

      {/* Story */}
      {baseProduct.story && (
        <div className="py-16 max-w-2xl mx-auto text-center">
          <p className="label-gold mx-auto w-fit mb-6">The Story</p>
          <h2 className="font-display text-3xl text-cream mb-6">
            Behind {baseProduct.name}
          </h2>
          <p className="font-serif text-cream/60 text-lg leading-relaxed">
            {baseProduct.story}
          </p>
        </div>
      )}
    </>
  )
}
