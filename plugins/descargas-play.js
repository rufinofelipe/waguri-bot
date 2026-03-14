import fs from "fs"
import path from "path"
import fetch from "node-fetch"
import yts from "yt-search"
import { exec } from "child_process"

const API_KEY = "causa-b0ec2c842e895e70"
const youtubeRegexID = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]{11})/
const cooldowns = new Map()
const COOLDOWN_MS = 90_000 // 1 minuto y 30 segundos

// Fetch con timeout
const fetchWithTimeout = (url, ms = 20000) => {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), ms)
  return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(timeout))
}

const handler = async (m, { conn, text, command }) => {
  const tmpFiles = []

  try {
    // ✅ Cooldown check
    const now = Date.now()
    const lastUsed = cooldowns.get(m.sender) || 0
    const remaining = COOLDOWN_MS - (now - lastUsed)

    if (remaining > 0) {
      const secs = Math.ceil(remaining / 1000)
      const mins = Math.floor(secs / 60)
      const secsLeft = secs % 60
      const timeStr = mins > 0 ? `${mins}m ${secsLeft}s` : `${secsLeft}s`

      return conn.reply(
        m.chat,
        `╭─「 🌸 *WAGURI BOT* 🌸 」\n` +
        `│\n` +
        `│ ⏳ Espera *${timeStr}* antes de\n` +
        `│    usar este comando de nuevo~\n` +
        `│\n` +
        `╰────────────────────`,
        m
      )
    }

    cooldowns.set(m.sender, now)

    if (!text.trim()) {
      return conn.reply(
        m.chat,
        `╭─「 🌸 *WAGURI BOT* 🌸 」\n` +
        `│\n` +
        `│ 🎵 Ingresa el nombre o enlace\n` +
        `│    del video que deseas ~\n` +
        `│\n` +
        `╰────────────────────`,
        m
      )
    }

    const videoIdMatch = text.match(youtubeRegexID)
    let ytSearch = null

    if (videoIdMatch) {
      const result = await yts({ videoId: videoIdMatch[1] })
      ytSearch = result
    } else {
      const result = await yts(text)
      ytSearch = result.videos?.[0]
    }

    if (!ytSearch?.title) return conn.reply(
      m.chat,
      `╭─「 🌸 *WAGURI BOT* 🌸 」\n` +
      `│\n` +
      `│ 🦋 No encontré resultados~\n` +
      `│    Intenta con otro nombre\n` +
      `│    o enlace ✨\n` +
      `│\n` +
      `╰────────────────────`,
      m
    )

    const { title, thumbnail, timestamp, views, ago, url } = ytSearch
    const vistas = formatViews(views)
    const thumb = (await conn.getFile(thumbnail))?.data
    const type = ["play", "yta", "ytmp3", "playaudio"].includes(command) ? "audio" : "video"

    await conn.reply(
      m.chat,
      `╭─「 🌸 *WAGURI BOT* 🌸 」\n` +
      `│\n` +
      `│ 🎬 *${title}*\n` +
      `│\n` +
      `│ 👁️ Vistas   » *${vistas}*\n` +
      `│ ⏳ Duración » *${timestamp}*\n` +
      `│ 📅 Subido   » *${ago}*\n` +
      `│\n` +
      `│ 📥 Procesando tu archivo~\n` +
      `│    Por favor espera 💗\n` +
      `│\n` +
      `╰────────────────────`,
      m,
      {
        contextInfo: {
          externalAdReply: {
            title: botname,
            body: dev,
            mediaType: 1,
            mediaUrl: url,
            sourceUrl: url,
            thumbnail: thumb,
            renderLargerThumbnail: true
          }
        }
      }
    )

    const api = `https://rest.apicausas.xyz/api/v1/descargas/youtube?url=${encodeURIComponent(url)}&type=${type}&apikey=${API_KEY}`

    const res = await fetchWithTimeout(api, 25000)
    if (!res.ok) throw new Error(`API respondió con status ${res.status}`)

    const json = await res.json()
    if (!json?.status || !json?.data?.download?.url) {
      throw new Error(json?.message || "La API no devolvió un enlace de descarga")
    }

    const tmpDir = "./tmp"
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir)

    const base = Date.now()
    const mp4Path = path.join(tmpDir, `${base}.mp4`)
    const mp3Path = path.join(tmpDir, `${base}.mp3`)
    tmpFiles.push(mp4Path, mp3Path)

    const buffer = await fetchWithTimeout(json.data.download.url, 60000).then(r => r.arrayBuffer())
    fs.writeFileSync(mp4Path, Buffer.from(buffer))

    if (type === "audio") {
      await new Promise((resolve, reject) => {
        exec(`ffmpeg -y -i "${mp4Path}" -vn -ab 128k "${mp3Path}"`, (err, stdout, stderr) => {
          if (err) reject(new Error(`ffmpeg falló: ${stderr}`))
          else resolve()
        })
      })

      await conn.sendMessage(
        m.chat,
        {
          audio: fs.readFileSync(mp3Path),
          fileName: `${title}.mp3`,
          mimetype: "audio/mpeg",
          ptt: false
        },
        { quoted: m }
      )
    } else {
      await conn.sendMessage(
        m.chat,
        {
          document: fs.readFileSync(mp4Path),
          fileName: `${title}.mp4`,
          mimetype: "video/mp4"
        },
        { quoted: m }
      )
    }

    await conn.reply(
      m.chat,
      `╭─「 🌸 *WAGURI BOT* 🌸 」\n` +
      `│\n` +
      `│ ✅ *¡Listo!* Tu archivo llegó ~\n` +
      `│ 🌸 Disfrútalo mucho 💗\n` +
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
  } finally {
    for (const f of tmpFiles) {
      if (fs.existsSync(f)) fs.unlinkSync(f)
    }
  }
}

handler.command = handler.help = ["play", "yta", "ytmp3", "playaudio", "play2", "ytv", "ytmp4"]
handler.tags = ["descargas"]
handler.group = true
handler.register = true

export default handler

function formatViews(views) {
  if (!views) return "No disponible"
  if (views >= 1e9) return `${(views / 1e9).toFixed(1)}B`
  if (views >= 1e6) return `${(views / 1e6).toFixed(1)}M`
  if (views >= 1e3) return `${(views / 1e3).toFixed(1)}k`
  return views.toString()
}