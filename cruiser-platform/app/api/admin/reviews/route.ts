import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getDb } from '@/lib/db/index'
import { reviews } from '@/lib/db/schema'
import { desc } from 'drizzle-orm'

export async function GET() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const db = await getDb()
    const rows = await db.select().from(reviews).orderBy(desc(reviews.createdAt))
    return NextResponse.json({ reviews: rows })
  } catch (e) {
    console.error('GET /api/admin/reviews error:', e)
    return NextResponse.json({ error: 'Failed to load reviews' }, { status: 500 })
  }
}
