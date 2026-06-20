import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface OrderItem {
  productId: string
  name: string
  quantity: number
  price: number
  imageUrl?: string
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

export interface Order {
  id: string
  number: string
  items: OrderItem[]
  subtotal: number
  shippingCost: number
  total: number
  status: OrderStatus
  trackingNumber?: string
  courier?: string
  shippingMethod?: string
  date: string
  recipient: string
  phone: string
  email: string
  address: string
  city: string
  province: string
  postalCode: string
  notes?: string
  isGuest: boolean
}

interface CustomerOrderStore {
  orders: Order[]
  addOrder: (order: Order) => void
  updateTracking: (orderNumber: string, trackingNumber: string, courier: string) => void
  updateStatus: (orderNumber: string, status: OrderStatus) => void
  clearOrders: () => void
}

export const useCustomerOrderStore = create<CustomerOrderStore>()(
  persist(
    (set) => ({
      orders: [],
      addOrder: (order) =>
        set((state) => ({ orders: [order, ...state.orders] })),
      updateTracking: (orderNumber, trackingNumber, courier) =>
        set((state) => ({
          orders: state.orders.map((o) =>
            o.number === orderNumber ? { ...o, trackingNumber, courier, status: 'shipped' } : o,
          ),
        })),
      updateStatus: (orderNumber, status) =>
        set((state) => ({
          orders: state.orders.map((o) =>
            o.number === orderNumber ? { ...o, status } : o,
          ),
        })),
      clearOrders: () => set({ orders: [] }),
    }),
    { name: 'cruiser_customer_orders' },
  ),
)

// Admin store — persists on admin's device
interface AdminOrderStore {
  orders: Order[]
  seeded: boolean
  addOrder: (order: Order) => void
  updateResi: (orderNumber: string, trackingNumber: string, courier: string) => void
  updateStatus: (orderNumber: string, status: OrderStatus) => void
  deleteOrder: (orderNumber: string) => void
  seedDemoOrders: (orders: Order[]) => void
}

export const useAdminOrderStore = create<AdminOrderStore>()(
  persist(
    (set) => ({
      orders: [],
      seeded: false,
      addOrder: (order) =>
        set((state) => ({ orders: [order, ...state.orders] })),
      updateResi: (orderNumber, trackingNumber, courier) =>
        set((state) => ({
          orders: state.orders.map((o) =>
            o.number === orderNumber
              ? { ...o, trackingNumber, courier, status: 'shipped' as OrderStatus }
              : o,
          ),
        })),
      updateStatus: (orderNumber, status) =>
        set((state) => ({
          orders: state.orders.map((o) =>
            o.number === orderNumber ? { ...o, status } : o,
          ),
        })),
      deleteOrder: (orderNumber) =>
        set((state) => ({
          orders: state.orders.filter((o) => o.number !== orderNumber),
        })),
      seedDemoOrders: (orders) =>
        set({ orders, seeded: true }),
    }),
    { name: 'cruiser_admin_orders' },
  ),
)
