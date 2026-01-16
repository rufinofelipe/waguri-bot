import fs from "fs"
import path from "path"
import fetch from "node-fetch"
import yts from 'yt-search'

const API_KEY = 'stellar-dXXUtmL2'
const youtubeRegexID = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]{11})/

const handler = async (m, { conn, text, command }) => {
  try {
    if (!text.trim()) return conn.reply(m.chat, `🌸 Por favor, ingresa el nombre de la música a descargar.`, m)

    let videoIdToFind = text.match(youtubeRegexID)
    let ytSearch = await yts(videoIdToFind ? 'https://youtu.be/' + videoIdToFind[1] : text)

    if (videoIdToFind) {
      const videoId = videoIdToFind[1]
      ytSearch = ytSearch.all.find(item => item.videoId === videoId) || ytSearch.videos.find(item => item.videoId === videoId)
    }

    ytSearch = ytSearch.all?.[0] || ytSearch.videos?.[0] || ytSearch
    if (!ytSearch || ytSearch.length === 0) return m.reply('✧ No se encontraron resultados para tu búsqueda.')

    let { title, thumbnail, timestamp, views, ago, url, author } = ytSearch
    const vistas = formatViews(views)
    const canalLink = author?.url || 'Desconocido'

    const infoMessage = `
🌸 𝗬𝗼𝘂𝗧𝘂𝗯𝗲 𝗗𝗼𝘄𝗻𝗹𝗼𝗮𝗱 | 𝗪𝗮𝗴𝘂𝗿𝗶

━━━━━━━━━━━━━━━━━━━━━━━

⚡ 𝗧𝗶𝘁𝘂𝗹𝗼: *${title || 'Desconocido'}*
👁️ 𝗩𝗶𝘀𝘁𝗮𝘀: *${vistas}*
⏱️ 𝗗𝘂𝗿𝗮𝗰𝗶𝗼𝗻: *${timestamp}*
📅 𝗣𝘂𝗯𝗹𝗶𝗰𝗮𝗱𝗼: *${ago}*
🔗 𝗘𝗻𝗹𝗮𝗰𝗲: ${url}
📺 𝗖𝗮𝗻𝗮𝗹: ${canalLink}

━━━━━━━━━━━━━━━━━━━━━━━
🌸 𝗣𝗿𝗲𝗽𝗮𝗿𝗮𝗻𝗱𝗼 𝘁𝘂 𝗮𝗿𝗰𝗵𝗶𝘃𝗼...
`

    const thumb = (await conn.getFile(thumbnail))?.data
    const JT = {
      contextInfo: {
        externalAdReply: {
          title: botname,
          body: dev,
          mediaType: 1,
          previewType: 0,
          mediaUrl: url,
          sourceUrl: url,
          thumbnail: thumb,
          renderLargerThumbnail: true,
        },
      },
    }

    await conn.reply(m.chat, infoMessage, m, JT)

    if (['play', 'yta', 'ytmp3', 'playaudio'].includes(command)) {
      try {
        const audioAPI = `https://rest.alyabotpe.xyz/dl/ytmp3?url=${encodeURIComponent(url)}&key=${API_KEY}`
        const res = await fetch(audioAPI)
        const json = await res.json()

        if (json.status && json.data && json.data.dl) {
          await conn.sendMessage(m.chat, {
            audio: { url: json.data.dl },
            fileName: `${json.data.title || 'audio'}.mp3`,
            mimetype: 'audio/mpeg',
            ptt: false
          }, { quoted: m })
        } else {
          throw new Error('No se pudo obtener el audio')
        }
      } catch (e) {
        return conn.reply(m.chat, `🌸 ¡Fallo en la descarga de audio! ${e.message}`, m)
      }
    } else if (['play2', 'ytv', 'ytmp4'].includes(command)) {
      try {
        const videoAPI = `https://rest.alyabotpe.xyz/dl/ytmp4?url=${encodeURIComponent(url)}&quality=144&key=${API_KEY}`
        const res = await fetch(videoAPI)
        const json = await res.json()

        if (json.status && json.data && json.data.dl) {
          await conn.sendMessage(m.chat, {
            video: { url: json.data.dl },
            fileName: `${json.data.title || 'video'}.mp4`,
            mimetype: 'video/mp4'
          }, { quoted: m })
        } else {
          throw new Error('No se pudo obtener el video')
        }
      } catch (e) {
        return conn.reply(m.chat, `🌸 ¡Fallo en la descarga de video! ${e.message}`, m)
      }
    } else {
      return conn.reply(m.chat, '✧︎ Comando no reconocido.', m)
    }

  } catch (error) {
    return m.reply(`⚠︎ Ocurrió un error: ${error.message}`)
  }
}

handler.command = handler.help = ['play', 'yta', 'ytmp3', 'play2', 'ytv', 'ytmp4', 'playaudio']
handler.tags = ['descargas']
handler.group = true

export default handler

function formatViews(views) {
  if (!views) return "No disponible"
  if (views >= 1_000_000_000) return `${(views / 1_000_000_000).toFixed(1)}B (${views.toLocaleString()})`
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M (${views.toLocaleString()})`
  if (views >= 1_000) return `${(views / 1_000).toFixed(1)}k (${views.toLocaleString()})`
  return views.toString()
}