import { orders } from '@/lib/db/schema'
import { and, eq, isNull, lt, ne } from 'drizzle-orm'
import type { AppDB } from '@/lib/db/index'

export const ORDER_EXPIRY_MS = 60 * 60 * 1000 // 1 jam

// Pesanan yang belum dibayar (pending, belum dikonfirmasi admin) dan sudah
// lewat 1 jam dari waktu dibuat otomatis dibatalkan. COD dikecualikan karena
// pembayarannya dilakukan saat barang tiba, bukan di muka.
export async function cancelExpiredOrders(db: AppDB) {
  const cutoff = new Date(Date.now() - ORDER_EXPIRY_MS).toISOString()
  const now = new Date().toISOString()

  await db
    .update(orders)
    .set({ status: 'cancelled', updatedAt: now })
    .where(
      and(
        eq(orders.status, 'pending'),
        isNull(orders.paymentConfirmedAt),
        ne(orders.paymentMethod, 'cod'),
        lt(orders.createdAt, cutoff),
      ),
    )
}
