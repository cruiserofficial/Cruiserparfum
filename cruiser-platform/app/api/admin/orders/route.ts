import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getDb } from '@/lib/db/index'
import { orders, orderItems } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

export async function GET() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const db = await getDb()
    const allOrders = await db.select().from(orders).orderBy(desc(orders.createdAt))

    // Fetch items for each order
    const ordersWithItems = await Promise.all(
      allOrders.map(async (order) => {
        const items = await db
          .select()
          .from(orderItems)
          .where(eq(orderItems.orderId, order.id))
        return { ...order, items }
      })
    )

    return NextResponse.json({ orders: ordersWithItems })
  } catch (e) {
    console.error('GET /api/admin/orders error:', e)
    return NextResponse.json({ error: 'Failed to load orders' }, { status: 500 })
  }
}

