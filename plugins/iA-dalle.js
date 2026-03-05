import fetch from "node-fetch"

const handler = async (m, { conn, text }) => {
  try {
    if (!text.trim()) {
      return conn.reply(
        m.chat,
        `╭─「 🌸 *WAGURI BOT* 🌸 」\n` +
        `│\n` +
        `│ 🎨 Ingresa una descripción\n` +
        `│    de la imagen que deseas~\n` +
        `│\n` +
        `╰────────────────────`,
        m
      )
    }

    await conn.reply(
      m.chat,
      `╭─「 🌸 *WAGURI BOT* 🌸 」\n` +
      `│\n` +
      `│ 🎨 Generando tu imagen~\n` +
      `│    Por favor espera 💗\n` +
      `│\n` +
      `╰────────────────────`,
      m
    )

    const res = await fetch("https://fluximagegen.com/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: text.trim() })
    })

    if (!res.ok) throw new Error("No se pudo generar la imagen")

    const buffer = await res.arrayBuffer()

    await conn.sendMessage(
      m.chat,
      {
        image: Buffer.from(buffer),
        caption:
          `╭─「 🎨 *DALLE AI* 」\n` +
          `│\n` +
          `│ ✅ *¡Imagen generada!*\n` +
          `│ 📝 ${text.trim()}\n` +
          `│\n` +
          `╰────────────────────`
      },
      { quoted: m }
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

handler.command = handler.help = ["dalle", "imagine", "imgai"]
handler.tags = ["ia"]
handler.group = true
handler.register = true

export default handler