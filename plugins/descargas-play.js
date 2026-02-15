import fs from "fs"
import path from "path"
import fetch from "node-fetch"
import yts from "yt-search"
import { exec } from "child_process"

const API_KEY = "causa-b0ec2c842e895e70"
const youtubeRegexID = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]{11})/
const COST = 10

const handler = async (m, { conn, text, command }) => {
  try {
    if (!text.trim()) {
      return conn.reply(m.chat, "⚽ Ingresa el nombre o enlace del video.", m)
    }

    const user = global.db.data.users[m.sender]

    if ((user.coin || 0) < COST) {
      const faltante = COST - (user.coin || 0)
      return conn.reply(
        m.chat,
        `⚽ No tienes suficientes monedas.\n\n💎 Necesitas: *${COST}*\n💎 Tienes: *${user.coin || 0}*\n💎 Te faltan: *${faltante}*`,
        m
      )
    }

    let videoIdToFind = text.match(youtubeRegexID)
    let ytSearch = await yts(videoIdToFind ? "https://youtu.be/" + videoIdToFind[1] : text)

    if (videoIdToFind) {
      ytSearch =
        ytSearch.all.find(v => v.videoId === videoIdToFind[1]) ||
        ytSearch.videos.find(v => v.videoId === videoIdToFind[1])
    }

    ytSearch = ytSearch.all?.[0] || ytSearch.videos?.[0] || ytSearch
    if (!ytSearch) return conn.reply(m.chat, "✧ No se encontraron resultados.", m)

    const { title, thumbnail, timestamp, views, ago, url } = ytSearch
    const vistas = formatViews(views)
    const thumb = (await conn.getFile(thumbnail))?.data

    await conn.reply(
      m.chat,
      `
⚽ 𝗬𝗼𝘂𝗧𝘂𝗯𝗲 𝗗𝗼𝘄𝗻𝗹𝗼𝗮𝗱
> 🎬 *${title}*
> 👁️ *${vistas}*
> ⏱️ *${timestamp}*
> 📅 *${ago}*

⚽ Procesando archivo...
`,
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

    const type = ["play", "yta", "ytmp3", "playaudio"].includes(command) ? "audio" : "video"

    const api = `https://rest.apicausas.xyz/api/v1/descargas/youtube?url=${encodeURIComponent(
      url
    )}&type=video&apikey=${API_KEY}`

    const res = await fetch(api)
    const json = await res.json()

    if (!json?.status || !json?.data?.download?.url) {
      throw new Error("No se pudo descargar el archivo")
    }

    const tmpDir = "./tmp"
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir)

    const base = Date.now()
    const mp4Path = path.join(tmpDir, `${base}.mp4`)
    const mp3Path = path.join(tmpDir, `${base}.mp3`)

    const buffer = await fetch(json.data.download.url).then(r => r.arrayBuffer())
    fs.writeFileSync(mp4Path, Buffer.from(buffer))

    if (type === "audio") {
      await new Promise((resolve, reject) => {
        exec(`ffmpeg -y -i "${mp4Path}" -vn -ab 128k "${mp3Path}"`, err => {
          if (err) reject(err)
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

    if (fs.existsSync(mp4Path)) fs.unlinkSync(mp4Path)
    if (fs.existsSync(mp3Path)) fs.unlinkSync(mp3Path)

    user.coin = (user.coin || 0) - COST

    await conn.reply(
      m.chat,
      `⚽ Descarga completada.\n💎 Se descontaron *${COST}* monedas.\n💎 Cartera actual: *${user.coin}*`,
      m
    )
  } catch (e) {
    conn.reply(m.chat, `⚠︎ Error: ${e.message}`, m)
  }
}

handler.command = handler.help = [
  "play",
  "yta",
  "ytmp3",
  "playaudio",
  "play2",
  "ytv",
  "ytmp4"
]
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