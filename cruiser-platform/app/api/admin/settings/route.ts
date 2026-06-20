import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getDb } from '@/lib/db/index'
import { adminSettings } from '@/lib/db/schema'

export async function GET() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const db = await getDb()
    const rows = await db.select().from(adminSettings)

    const settings: Record<string, unknown> = {}
    for (const row of rows) {
      try {
        settings[row.key] = JSON.parse(row.value)
      } catch {
        settings[row.key] = row.value
      }
    }

    return NextResponse.json({ settings })
  } catch (e) {
    console.error('GET /api/admin/settings error:', e)
    return NextResponse.json({ error: 'Failed to load settings' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json() as Record<string, unknown>
    const db = await getDb()
    const now = new Date().toISOString()

    for (const [key, value] of Object.entries(body)) {
      const serialized = typeof value === 'string' ? value : JSON.stringify(value)
      await db
        .insert(adminSettings)
        .values({ key, value: serialized, updatedAt: now })
        .onConflictDoUpdate({
          target: adminSettings.key,
          set: { value: serialized, updatedAt: now },
        })
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('PUT /api/admin/settings error:', e)
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 })
  }
}

