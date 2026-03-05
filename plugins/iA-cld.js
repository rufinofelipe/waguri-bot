import fetch from "node-fetch"

const handler = async (m, { conn, text }) => {
  try {
    if (!text.trim()) {
      return conn.reply(
        m.chat,
        `╭─「 🌸 *WAGURI BOT* 🌸 」\n` +
        `│\n` +
        `│ 🤖 Ingresa tu pregunta\n` +
        `│    para Claude~\n` +
        `│\n` +
        `╰────────────────────`,
        m
      )
    }

    const res = await fetch(`https://starapi-rosy.vercel.app/ai/chatgpt?text=${encodeURIComponent(text.trim())}`)
    const json = await res.json()

    if (!json?.status || !json?.result) {
      throw new Error("No se pudo obtener respuesta")
    }

    await conn.reply(
      m.chat,
      `╭─「 🤖 *CLAUDE AI* 」\n` +
      `│\n` +
      `│ ❓ *Pregunta:*\n` +
      `│ ${text.trim()}\n` +
      `│\n` +
      `│ 💬 *Respuesta:*\n` +
      `│ ${json.result}\n` +
      `│\n` +
      `╰────────────────────`,
      m
    )

  } catch (e) {
    conn.reply(
      m.chat,
      `╭─「 🌸 *WAGURI BOT* 🌸 」\n` +
      `│\n` +
      `│ ❌ Ocurrió un error~\n` +
      `│ ⚠️ *${e.message}*\n` +
      `│\n` +
      `╰────────────────────`,
      m
    )
  }
}

handler.command = handler.help = ["claude", "ia", "ai"]
handler.tags = ["ia"]
handler.group = true
handler.register = true

export default handler