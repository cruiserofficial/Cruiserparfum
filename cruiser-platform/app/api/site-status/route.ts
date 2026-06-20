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

interface BankAccount {
  id: string
  bankName: string
  accountNumber: string
  accountName: string
}

export async function GET() {
  try {
    const db = await getDb()
    const rows = await db
      .select()
      .from(adminSettings)
      .where(inArray(adminSettings.key, ['store_info', 'maintenance_mode', 'bank_accounts']))

    let storeInfo: StoreInfo = {}
    let maintenance: MaintenanceConfig = { enabled: false }
    let bankAccounts: BankAccount[] = []

    for (const row of rows) {
      try {
        if (row.key === 'store_info') storeInfo = JSON.parse(row.value) as StoreInfo
        if (row.key === 'maintenance_mode') maintenance = JSON.parse(row.value) as MaintenanceConfig
        if (row.key === 'bank_accounts') bankAccounts = JSON.parse(row.value) as BankAccount[]
      } catch {
        // ignore malformed row
      }
    }

    return NextResponse.json({
      maintenanceMode: maintenance.enabled === true,
      shopee: storeInfo.shopee || null,
      bankAccounts,
    })
  } catch {
    // Fail open: never lock visitors out (or hide the shopee link) due to a DB hiccup
    return NextResponse.json({ maintenanceMode: false, shopee: null, bankAccounts: [] })
  }
}
