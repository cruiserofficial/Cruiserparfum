import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getDb } from '@/lib/db/index'
import { orders, orderItems, users } from '@/lib/db/schema'
import { eq, desc, ne } from 'drizzle-orm'

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

// One-time maintenance action: wipe all order history (and optionally
// non-admin customer accounts) so the site can go live without test data.
export async function DELETE(req: Request) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const alsoUsers = searchParams.get('alsoUsers') === 'true'

  try {
    const db = await getDb()
    await db.delete(orderItems)
    await db.delete(orders)

    let deletedUsers = 0
    if (alsoUsers) {
      const result = await db.delete(users).where(ne(users.role, 'admin')).returning()
      deletedUsers = result.length
    }

    return NextResponse.json({ ok: true, deletedUsers })
  } catch (e) {
    console.error('DELETE /api/admin/orders error:', e)
    return NextResponse.json({ error: 'Failed to clear data' }, { status: 500 })
  }
}

