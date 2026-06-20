import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db/index'
import { adminSettings } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

interface PopupConfig {
  enabled: boolean
  imageUrl: string
  title?: string
  subtitle?: string
  linkUrl?: string
  buttonText?: string
}

export async function GET() {
  try {
    const db = await getDb()
    const rows = await db.select().from(adminSettings).where(eq(adminSettings.key, 'popup_banner')).limit(1)
    if (!rows[0]) return NextResponse.json({ popup: null })

    const popup = JSON.parse(rows[0].value) as PopupConfig
    if (!popup.enabled || !popup.imageUrl) return NextResponse.json({ popup: null })

    return NextResponse.json({ popup })
  } catch {
    return NextResponse.json({ popup: null })
  }
}
