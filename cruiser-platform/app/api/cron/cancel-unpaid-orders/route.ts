import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db/index'
import { cancelExpiredOrders } from '@/lib/order-expiry'

// Jaring pengaman: pesanan yang belum dibayar otomatis dibatalkan setiap
// kali ada yang membuka daftar pesanan (admin/akun). Cron ini menjaga
// pesanan yang ditinggalkan (tidak pernah dilihat lagi) tetap dibatalkan.
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (secret) {
    const auth = req.headers.get('authorization')
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const db = await getDb()
  await cancelExpiredOrders(db)
  return NextResponse.json({ ok: true })
}
