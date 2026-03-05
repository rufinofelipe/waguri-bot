import fetch from "node-fetch"

const handler = async (m, { conn, text }) => {
  try {
    if (!text.trim()) return conn.reply(m.chat, "Ingresa tu pregunta.", m)

    const res = await fetch(`https://starapi-rosy.vercel.app/ai/chatgpt?text=${encodeURIComponent(text.trim())}`)
    const json = await res.json()

    if (!json?.status || !json?.result) throw new Error("No se pudo obtener respuesta")

    await conn.reply(m.chat, json.result, m)

  } catch (e) {
    conn.reply(m.chat, `❌ ${e.message}`, m)
  }
}

handler.command = handler.help = ["claude", "ia", "ai"]
handler.tags = ["ia"]
handler.group = true
handler.register = true

export default handler