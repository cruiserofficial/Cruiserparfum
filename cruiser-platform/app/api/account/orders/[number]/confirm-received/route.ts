import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getDb } from '@/lib/db/index'
import { orders } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

interface RouteParams {
  params: Promise<{ number: string }>
}

export async function POST(_req: Request, { params }: RouteParams) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { number: orderNumber } = await params
  const db = await getDb()

  const existing = await db.select().from(orders).where(eq(orders.number, orderNumber)).limit(1)
  if (!existing[0]) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }
  if (existing[0].userId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const now = new Date().toISOString()
  await db.update(orders).set({
    customerConfirmedAt: now,
    status: 'delivered',
    updatedAt: now,
  }).where(eq(orders.number, orderNumber))

  return NextResponse.json({ ok: true })
}
