export async function sendWhatsAppMessage(phone: string, apiKey: string, message: string): Promise<void> {
  const cleaned = phone.replace(/\D+/g, '')
  const encoded = encodeURIComponent(message)
  const url = `https://api.callmebot.com/whatsapp.php?phone=${cleaned}&text=${encoded}&apikey=${apiKey}`
  const response = await fetch(url)
  if (!response.ok) throw new Error(`WhatsApp send failed (${response.status})`)
}
