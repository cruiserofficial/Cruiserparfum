import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface WishlistStore {
  productIds: string[]
  toggle: (productId: string) => void
  has: (productId: string) => boolean
  clear: () => void
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      productIds: [],

      toggle: (productId) =>
        set((state) => ({
          productIds: state.productIds.includes(productId)
            ? state.productIds.filter((id) => id !== productId)
            : [...state.productIds, productId],
        })),

      has: (productId) => get().productIds.includes(productId),

      clear: () => set({ productIds: [] }),
    }),
    {
      name: 'cruiser-wishlist',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
