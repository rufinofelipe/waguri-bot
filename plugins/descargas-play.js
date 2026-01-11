import fetch from "node-fetch"
import yts from "yt-search"

const youtubeRegexID = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]{11})/

const API_BASE = "https://rest.alyabotpe.xyz/dl/ytmp3"
const API_KEY = "stellar-SSfb2OPw"

async function skyYT(url, format) {
  const response = await fetch(`${API_BASE}/api/download/yt.php?url=${encodeURIComponent(url)}&format=${format}`, {
    headers: { 
      Authorization: `Bearer ${API_KEY}`,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    timeout: 60000
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }

  const data = await response.json()

  if (!data || data.status !== "true" || !data.data) {
    throw new Error(data?.error || "Error en la API Sky")
  }

  return data.data
}

const handler = async (m, { conn, text, command }) => {
  try {
    if (!text.trim()) {
      return conn.reply(m.chat, `✧ 𝙃𝙚𝙮! Debes escribir *el nombre o link* del video/audio para descargar.`, m)
    }

    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key }})

    let videoIdToFind = text.match(youtubeRegexID) || null
    let ytplay2 = await yts(videoIdToFind ? "https://youtu.be/" + videoIdToFind[1] : text)

    if (videoIdToFind) {
      const videoId = videoIdToFind[1]
      ytplay2 = ytplay2.all.find(item => item.videoId === videoId) || ytplay2.videos.find(item => item.videoId === videoId)
    }

    ytplay2 = ytplay2.all?.[0] || ytplay2.videos?.[0] || ytplay2
    if (!ytplay2) {
      await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key }})
      return m.reply("⚠︎ No encontré resultados, intenta con otro nombre o link.")
    }

    let { title, thumbnail, timestamp, views, ago, url, author } = ytplay2
    const vistas = formatViews(views)
    const canal = author?.name || "Desconocido"

    const infoMessage = `
ㅤ۫ ㅤ  🌸 *¡WAGURI BOT DOWNLOAD!* 🌸

📦 *ARCHIVO DESCARGADO* 📦
━━━━━━━━━━━━━━━━━━━━━━━━━
🎵 *Título:* ${title}
🎤 *Artista/Canal:* ${author}
⏱️ *Duración:* ${duration}
📊 *Tamaño:* ${fileSize}
📁 *Formato:* ${format}
🔄 *Calidad:* ${quality}
━━━━━━━━━━━━━━━━━━━━━━━━━

👤 *Usuario:* ${userName}
🕐 *Hora:* ${currentTime}
📅 *Fecha:* ${currentDate}
🖥️ *Servidor:* ${serverName}

━━━━━━━━━━━━━━━━━━━━━━━━━
✨ *¡Archivo listo para disfrutar!*
🎧 *Reproduce y comparte con amigos*

━━━━━━━━━━━━━━━━━━━━━━━━━
🔗 *Enlace original:* 
${originalUrl}

🌸 *Gracias por usar waguri bot*
💫 *¡Tu descarga ha sido exitosa!*
    `.trim()

    const thumb = (await conn.getFile(thumbnail))?.data
    await conn.reply(m.chat, infoMessage, m, {
      contextInfo: {
        externalAdReply: {
          title: botname,
          body: dev,
          mediaType: 1,
          thumbnail: thumb,
          renderLargerThumbnail: true,
          mediaUrl: url,
          sourceUrl: url
        }
      }
    })

    let audioData = null
    try {
      const d = await skyYT(url, "audio")
      const mediaUrl = d.audio || d.video
      if (mediaUrl) {
        audioData = { link: mediaUrl, title: d.title || title }
      }
    } catch {}

    if (!audioData) {
      await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key }})
      return conn.reply(m.chat, "✦ No se pudo descargar el audio. Intenta más tarde.", m)
    }

    await conn.sendMessage(m.chat, {
      audio: { url: audioData.link },
      fileName: `${audioData.title || "music"}.mp3`,
      mimetype: "audio/mpeg",
      ptt: false
    }, { quoted: m })

    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key }})

  } catch (error) {
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key }})
    return m.reply(`⚠︎ Error inesperado:\n\n${error}`)
  }
}

handler.help = ["play"]
handler.tags = ["descargas"]
handler.command = ["play"]

export default handler

function formatViews(views) {
  if (!views) return "No disponible"
  if (views >= 1_000_000_000) return `${(views / 1_000_000_000).toFixed(1)}B`
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M`
  if (views >= 1_000) return `${(views / 1_000).toFixed(1)}k`
  return views.toString()
    }