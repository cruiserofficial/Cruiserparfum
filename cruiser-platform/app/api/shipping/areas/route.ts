import { NextRequest, NextResponse } from 'next/server'
import { searchAreas } from '@/lib/biteship'

export async function GET(req: NextRequest) {
  const keyword = req.nextUrl.searchParams.get('q')
  if (!keyword || keyword.length < 3) {
    return NextResponse.json({ areas: [] })
  }

  try {
    const areas = await searchAreas(keyword)
    return NextResponse.json({ areas: areas.slice(0, 10) })
  } catch (err) {
    console.error('Biteship area search error:', err)
    return NextResponse.json({ error: 'Gagal mencari area' }, { status: 500 })
  }
}
