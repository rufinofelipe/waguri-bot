import fetch from "node-fetch"

const handler = async (m, { conn, text }) => {
  try {
    if (!text?.trim()) {
      return conn.reply(
        m.chat,
        `╭─「 🌸 *WAGURI BOT* 🌸 」\n` +
        `│\n` +
        `│ 🎨 Ingresa una descripción\n` +
        `│    de la imagen que deseas ~\n` +
        `│\n` +
        `│ 📝 *Ejemplo:*\n` +
        `│    .imagine un gato en el espacio\n` +
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

    const prompt = encodeURIComponent(text.trim())
    const url = `https://nex-magical.vercel.app/ai/flux?prompt=${prompt}`

    const res = await fetch(url)

    if (!res.ok) throw new Error(`Error al contactar la API: ${res.status}`)

    const contentType = res.headers.get("content-type")
    if (!contentType?.includes("image")) {
      throw new Error("La API no devolvió una imagen válida")
    }

    const buffer = Buffer.from(await res.arrayBuffer())

    await conn.sendMessage(
      m.chat,
      {
        image: buffer,
        caption:
          `╭─「 🌸 *WAGURI BOT* 🌸 」\n` +
          `│\n` +
          `│ ✅ *¡Imagen generada!*\n` +
          `│ 🖼️ *Prompt:* ${text.trim()}\n` +
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

handler.command = handler.help = ["imagine", "flux", "imagine2", "ia-imagen"]
handler.tags = ["ia"]
handler.group = true
handler.register = true

export default handler