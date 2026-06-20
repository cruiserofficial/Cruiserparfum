import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db/index'
import { reviews } from '@/lib/db/schema'
import { and, desc, eq } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  const productId = req.nextUrl.searchParams.get('productId')
  if (!productId) return NextResponse.json({ reviews: [] })

  try {
    const db = await getDb()
    const rows = await db.select().from(reviews)
      .where(and(eq(reviews.productId, productId), eq(reviews.isVisible, true)))
      .orderBy(desc(reviews.createdAt))

    return NextResponse.json({ reviews: rows })
  } catch (e) {
    console.error('GET /api/reviews error:', e)
    return NextResponse.json({ reviews: [] })
  }
}
