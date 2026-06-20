import { NextRequest, NextResponse } from 'next/server'
import { getShippingRates, groupRatesByType, PRODUCT_WEIGHT_GRAMS, ORIGIN_AREA_ID } from '@/lib/biteship'
import type { ShippingRate } from '@/lib/biteship'

// Fallback rates saat Biteship tidak tersedia (saldo habis / error)
function getFallbackRates(itemCount: number): ShippingRate[] {
  const baseWeight = PRODUCT_WEIGHT_GRAMS * itemCount
  const kg = Math.ceil(baseWeight / 1000)

  return [
    {
      company: 'JNE', courier_name: 'JNE', courier_code: 'jne',
      courier_service_name: 'REG', courier_service_code: 'REG',
      type: 'regular', description: 'Layanan reguler JNE',
      duration: '2-3 hari kerja', shipment_duration_range: '2-3', shipment_duration_unit: 'DAYS',
      price: 18000 * kg, min_weight: 1,
    },
    {
      company: 'JNE', courier_name: 'JNE', courier_code: 'jne',
      courier_service_name: 'YES', courier_service_code: 'YES',
      type: 'express', description: 'Yakin Esok Sampai',
      duration: '1 hari kerja', shipment_duration_range: '1', shipment_duration_unit: 'DAYS',
      price: 38000 * kg, min_weight: 1,
    },
    {
      company: 'J&T Express', courier_name: 'J&T Express', courier_code: 'jnt',
      courier_service_name: 'EZ', courier_service_code: 'EZ',
      type: 'regular', description: 'Layanan reguler J&T',
      duration: '2-3 hari kerja', shipment_duration_range: '2-3', shipment_duration_unit: 'DAYS',
      price: 16000 * kg, min_weight: 1,
    },
    {
      company: 'SiCepat', courier_name: 'SiCepat', courier_code: 'sicepat',
      courier_service_name: 'BEST', courier_service_code: 'BEST',
      type: 'regular', description: 'Layanan reguler SiCepat',
      duration: '2-3 hari kerja', shipment_duration_range: '2-3', shipment_duration_unit: 'DAYS',
      price: 15000 * kg, min_weight: 1,
    },
    {
      company: 'SiCepat', courier_name: 'SiCepat', courier_code: 'sicepat',
      courier_service_name: 'SIUNTUNG', courier_service_code: 'SIUNTUNG',
      type: 'same day', description: 'Same Day SiCepat',
      duration: 'Hari ini', shipment_duration_range: '1', shipment_duration_unit: 'HOURS',
      price: 55000 * kg, min_weight: 1,
    },
    {
      company: 'AnterAja', courier_name: 'AnterAja', courier_code: 'anteraja',
      courier_service_name: 'REG', courier_service_code: 'REG',
      type: 'regular', description: 'Layanan reguler AnterAja',
      duration: '2-4 hari kerja', shipment_duration_range: '2-4', shipment_duration_unit: 'DAYS',
      price: 14000 * kg, min_weight: 1,
    },
  ]
}

export async function POST(req: NextRequest) {
  const { destinationAreaId, itemCount = 1, totalValue = 299000 } = await req.json()

  if (!destinationAreaId) {
    return NextResponse.json({ error: 'destinationAreaId diperlukan' }, { status: 400 })
  }

  // Coba Biteship dulu — kalau gagal pakai fallback
  if (ORIGIN_AREA_ID) {
    try {
      const totalWeight = PRODUCT_WEIGHT_GRAMS * itemCount
      const rates = await getShippingRates({ destinationAreaId, totalWeightGrams: totalWeight, totalValue, itemCount })
      const grouped = groupRatesByType(rates)
      return NextResponse.json({ rates, grouped, totalWeight, source: 'biteship' })
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.warn('Biteship unavailable, using fallback rates:', msg)
      // Jatuh ke fallback di bawah
    }
  }

  // Fallback: tarif estimasi statis
  const fallback = getFallbackRates(itemCount)
  const grouped = groupRatesByType(fallback)
  return NextResponse.json({ rates: fallback, grouped, totalWeight: PRODUCT_WEIGHT_GRAMS * itemCount, source: 'fallback' })
}
