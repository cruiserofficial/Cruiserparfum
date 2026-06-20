import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db/index'
import { adminSettings } from '@/lib/db/schema'
import { inArray } from 'drizzle-orm'

interface StoreInfo {
  phone?: string
  address?: string
  instagram?: string
  shopee?: string
}

interface MaintenanceConfig {
  enabled: boolean
}

export async function GET() {
  try {
    const db = await getDb()
    const rows = await db
      .select()
      .from(adminSettings)
      .where(inArray(adminSettings.key, ['store_info', 'maintenance_mode']))

    let storeInfo: StoreInfo = {}
    let maintenance: MaintenanceConfig = { enabled: false }

    for (const row of rows) {
      try {
        if (row.key === 'store_info') storeInfo = JSON.parse(row.value) as StoreInfo
        if (row.key === 'maintenance_mode') maintenance = JSON.parse(row.value) as MaintenanceConfig
      } catch {
        // ignore malformed row
      }
    }

    return NextResponse.json({
      maintenanceMode: maintenance.enabled === true,
      shopee: storeInfo.shopee || null,
    })
  } catch {
    // Fail open: never lock visitors out (or hide the shopee link) due to a DB hiccup
    return NextResponse.json({ maintenanceMode: false, shopee: null })
  }
}
