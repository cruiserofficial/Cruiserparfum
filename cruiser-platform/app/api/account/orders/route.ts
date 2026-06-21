import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getDb } from '@/lib/db/index'
import { orders, orderItems } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { cancelExpiredOrders } from '@/lib/order-expiry'

export async function GET() {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const db = await getDb()
    await cancelExpiredOrders(db).catch(() => {})
    // Fetch orders by user email (works for both guest and registered users)
    const userOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.email, session.user.email))
      .orderBy(desc(orders.createdAt))

    const ordersWithItems = await Promise.all(
      userOrders.map(async (order) => {
        const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id))
        return { ...order, items }
      })
    )

    return NextResponse.json({ orders: ordersWithItems })
  } catch (e) {
    console.error('GET /api/account/orders error:', e)
    return NextResponse.json({ error: 'Failed to load orders' }, { status: 500 })
  }
}

