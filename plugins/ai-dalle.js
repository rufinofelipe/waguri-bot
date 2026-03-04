import fetch from "node-fetch"
import { getBuffer } from "../lib/message.js"

async function handler(m, { conn, text, usedPrefix, command }) {

  if (!text) return m.reply(`✨ *Uso:* ${usedPrefix}${command} <descripción de la imagen>\n\n📌 *Ejemplo:* ${usedPrefix}${command} un gato astronauta en el espacio`)

  try {
    await m.reply("⏳ Generando tu imagen, espera un momento...")

    const res = await fetch("https://fluximagegen.com/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        prompt: text,
        style: "photorealism"
      })
    })

    if (!res.ok) {
      throw new Error(`HTTP error: ${res.status} ${res.statusText}`)
    }

    const json = await res.json()

    if (!json.success || !json.imageUrl) {
      const reason = json.message || json.error || "Respuesta inválida de la API"
      return m.reply(`❌ No se pudo generar la imagen: ${reason}`)
    }

    const buffer = await getBuffer(json.imageUrl)

    if (!buffer || buffer.length === 0) {
      return m.reply("❌ No se pudo descargar la imagen generada.")
    }

    const caption = [
      `🎨 *IMAGEN GENERADA*`,
      ``,
      `📝 *Prompt:* ${text}`,
      `🖌️ *Estilo:* Photorealism`,
      ``,
      `> Powered by Flux Image Gen`
    ].join("\n")

    await conn.sendMessage(m.chat, {
      image: buffer,
      caption
    }, { quoted: m })

  } catch (err) {
    console.error("[dalle]", err)

    if (err.message?.includes("fetch")) {
      return m.reply("❌ No se pudo conectar con la API. Intenta más tarde.")
    }
    if (err.message?.includes("HTTP error")) {
      return m.reply(`❌ Error del servidor: ${err.message}`)
    }

    m.reply("❌ Ocurrió un error inesperado al generar la imagen.")
  }
}

handler.help = ["dalle <descripción>"];
handler.tags = ["ai"];
handler.command = ["dalle", "crearimagen", "genimg"];
handler.limit = true;
handler.register = true;

export default handler;