export function getTrackingUrl(resi: string, courier?: string): string {
  const code = (courier ?? '').toLowerCase()
  const r = encodeURIComponent(resi)
  if (code.includes('jne')) return `https://www.jne.co.id/id/tracking/trace/${r}`
  if (code.includes('jnt') || code.includes('j&t')) return `https://www.jet.co.id/track?awb=${r}`
  if (code.includes('sicepat')) return `https://www.sicepat.com/checkAwb/${r}`
  if (code.includes('anteraja')) return `https://anteraja.id/tracking?awb=${r}`
  if (code.includes('pos') || code.includes('indonesia')) return `https://www.posindonesia.co.id/id/tracking/${r}`
  if (code.includes('tiki')) return `https://www.tiki.id/id/tracking?awb=${r}`
  // fallback ke cekresi.com yang support semua kurir
  return `https://www.cekresi.com/?noresi=${r}`
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  const cleaned = phone.replace(/\D/g, '').replace(/^0/, '62')
  return `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`
}

export function buildTrackingWhatsApp(
  phone: string,
  recipientName: string,
  orderNumber: string,
  resi: string,
  courier: string,
): string {
  const trackingUrl = getTrackingUrl(resi, courier)
  const message = `Halo ${recipientName} 👋

Pesanan kamu *${orderNumber}* sudah kami kirim! 🎁

📦 Kurir: *${courier.toUpperCase()}*
🔢 No. Resi: *${resi}*

Lacak paket kamu di:
${trackingUrl}

Terima kasih sudah belanja di *CRUISER Parfum* ✨
Semoga suka dengan wanginya!`
  return buildWhatsAppUrl(phone, message)
}
