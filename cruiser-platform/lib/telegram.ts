export async function sendTelegramMessage(text: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatIds = (process.env.TELEGRAM_CHAT_ID ?? '').split(',').map((id) => id.trim()).filter(Boolean)
  if (!token || chatIds.length === 0) return

  await Promise.all(chatIds.map(async (chatId) => {
    try {
      const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: 'HTML',
        }),
      })
      const body = await res.json().catch(() => null)
      if (!res.ok || body?.ok === false) {
        console.error(`Telegram API rejected message for chat ${chatId}:`, body)
      }
    } catch (e) {
      console.error(`Telegram notification failed for chat ${chatId}:`, e)
    }
  }))
}

export function buildNewOrderMessage(params: {
  orderNumber: string
  recipient: string
  total: number
  paymentMethod: string
  itemsSummary: string
}): string {
  const { orderNumber, recipient, total, paymentMethod, itemsSummary } = params
  const formattedTotal = `Rp${total.toLocaleString('id-ID')}`
  const methodLabels: Record<string, string> = {
    qris: 'QRIS', bank_transfer: 'Transfer Bank', midtrans: 'Kartu Kredit/Debit', cod: 'COD',
  }
  const adminUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://cruiserparfum.com'}/admin/orders`

  const checkInstructions: Record<string, string> = {
    qris: 'Cek apakah dana sudah masuk ke akun QRIS/e-wallet kamu',
    bank_transfer: 'Cek mutasi rekening bank kamu untuk konfirmasi transfer masuk',
    cod: 'Tidak perlu cek pembayaran — proses pesanan dan tagih saat barang diterima',
    midtrans: 'Cek status pembayaran kartu di dashboard Midtrans',
  }
  const checkInstruction = checkInstructions[paymentMethod] ?? 'Cek konfirmasi pembayaran sesuai metode yang dipilih'

  return `🛒 <b>Pesanan Baru Masuk!</b>

📦 Order: <b>${orderNumber}</b>
👤 Penerima: ${recipient}
🛍️ Item: ${itemsSummary}
💰 Total: <b>${formattedTotal}</b>
💳 Pembayaran: ${methodLabels[paymentMethod] ?? paymentMethod}

⚠️ ${checkInstruction}, lalu <b>login ke panel admin</b> untuk update status &amp; resi:
${adminUrl}`
}

export function buildPaymentConfirmedMessage(params: {
  orderNumber: string
  total: number
}): string {
  const { orderNumber, total } = params
  const formattedTotal = `Rp${total.toLocaleString('id-ID')}`
  const adminUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://cruiserparfum.com'}/admin/orders`

  return `✅ <b>Pembayaran Terkonfirmasi!</b>

📦 Order: <b>${orderNumber}</b>
💰 Total: <b>${formattedTotal}</b>
💳 Dibayar via Midtrans

Silakan <b>login ke panel admin</b> untuk proses & update resi pengiriman:
${adminUrl}`
}
