const BITESHIP_BASE = 'https://api.biteship.com'
const BITESHIP_KEY = process.env.BITESHIP_API_KEY ?? ''

// Asal pengiriman CRUISER — update BITESHIP_ORIGIN_AREA_ID di .env.local
export const ORIGIN_AREA_ID = process.env.BITESHIP_ORIGIN_AREA_ID ?? ''
export const ORIGIN_POSTAL_CODE = process.env.BITESHIP_ORIGIN_POSTAL_CODE ?? '15224'

// Berat produk CRUISER per unit (gram) — botol 50ml + kemasan
export const PRODUCT_WEIGHT_GRAMS = 350

export interface BiteshipArea {
  id: string
  name: string
  administrative_division_level_1_name: string // Provinsi
  administrative_division_level_2_name: string // Kota/Kabupaten
  administrative_division_level_3_name: string // Kecamatan
  postal_code: string
}

export interface ShippingRate {
  company: string
  courier_name: string
  courier_code: string
  courier_service_name: string
  courier_service_code: string
  type: string
  description: string
  duration: string
  shipment_duration_range: string
  shipment_duration_unit: string
  price: number
  min_weight: number
}

async function biteshipFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${BITESHIP_BASE}${path}`, {
    ...options,
    headers: {
      'Authorization': BITESHIP_KEY,
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Biteship ${res.status}: ${err}`)
  }
  return res.json()
}

export async function searchAreas(keyword: string): Promise<BiteshipArea[]> {
  const data = await biteshipFetch(
    `/v1/maps/areas?countries=ID&input=${encodeURIComponent(keyword)}&type=single`,
  )
  const areas = (data.areas ?? []) as BiteshipArea[]
  // Biteship returns postal_code as a number despite our string type — normalize
  // so every consumer (and any z.string() validation downstream) sees a string.
  return areas.map((area) => ({ ...area, postal_code: String(area.postal_code) }))
}

export interface RatesParams {
  destinationAreaId: string
  totalWeightGrams: number
  totalValue: number
  itemCount: number
  couriers?: string
}

export async function getShippingRates(params: RatesParams): Promise<ShippingRate[]> {
  const {
    destinationAreaId,
    totalWeightGrams,
    totalValue,
    itemCount,
    couriers = 'jne,jnt,sicepat,anteraja,gojek,grab,lalamove',
  } = params

  const data = await biteshipFetch('/v1/rates/couriers', {
    method: 'POST',
    body: JSON.stringify({
      origin_area_id: ORIGIN_AREA_ID,
      destination_area_id: destinationAreaId,
      couriers,
      items: [
        {
          name: 'CRUISER Extrait De Parfum',
          description: 'Parfum 50ml',
          value: Math.round(totalValue / itemCount),
          length: 10,
          width: 8,
          height: 14,
          weight: totalWeightGrams,
          quantity: itemCount,
        },
      ],
    }),
  })

  return (data.pricing ?? []) as ShippingRate[]
}

export interface CreateOrderParams {
  origin: {
    contactName: string
    contactPhone: string
    address: string
    areaId: string
    postalCode: string
  }
  destination: {
    contactName: string
    contactPhone: string
    address: string
    areaId: string
    postalCode: string
  }
  courierCode: string // e.g. "jne"
  serviceCode: string // e.g. "reg"
  orderNote?: string
  items: Array<{ name: string; value: number; quantity: number; weight: number }>
}

export interface CreateOrderResult {
  id: string
  status: string
  courier?: { waybill_id?: string; tracking_id?: string }
}

export async function createOrder(params: CreateOrderParams): Promise<CreateOrderResult> {
  const { origin, destination, courierCode, serviceCode, orderNote, items } = params

  const data = await biteshipFetch('/v1/orders', {
    method: 'POST',
    body: JSON.stringify({
      origin_contact_name: origin.contactName,
      origin_contact_phone: origin.contactPhone,
      origin_address: origin.address,
      origin_postal_code: Number(origin.postalCode) || undefined,
      origin_area_id: origin.areaId,
      destination_contact_name: destination.contactName,
      destination_contact_phone: destination.contactPhone,
      destination_address: destination.address,
      destination_postal_code: Number(destination.postalCode) || undefined,
      destination_area_id: destination.areaId,
      courier_company: courierCode,
      courier_type: serviceCode,
      delivery_type: 'now',
      order_note: orderNote ?? '',
      items: items.map((item) => ({
        name: item.name,
        description: item.name,
        value: item.value,
        quantity: item.quantity,
        weight: item.weight,
      })),
    }),
  })

  return data as CreateOrderResult
}

export function groupRatesByType(rates: ShippingRate[]) {
  const groups: Record<string, ShippingRate[]> = {
    'Instan': [],
    'Same Day': [],
    'Express': [],
    'Reguler': [],
    'Lainnya': [],
  }

  for (const rate of rates) {
    const t = rate.type?.toLowerCase() ?? ''
    const name = rate.courier_service_name?.toLowerCase() ?? ''

    if (t === 'instant' || name.includes('instant') || name.includes('instan')) {
      groups['Instan'].push(rate)
    } else if (t === 'same day' || name.includes('same day') || name.includes('sameday')) {
      groups['Same Day'].push(rate)
    } else if (t === 'express' || name.includes('express') || name.includes('yes') || name.includes('oke')) {
      groups['Express'].push(rate)
    } else if (t === 'regular' || t === 'reguler') {
      groups['Reguler'].push(rate)
    } else {
      groups['Lainnya'].push(rate)
    }
  }

  // Hapus group yang kosong
  return Object.fromEntries(Object.entries(groups).filter(([, v]) => v.length > 0))
}
