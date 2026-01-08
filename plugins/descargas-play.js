const youtubeRegexID = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]{11})/

const primaryFolder = "./primary"
if (!fs.existsSync(primaryFolder)) fs.mkdirSync(primaryFolder)

function getFilePath(groupId) {
  return path.join(primaryFolder, `${groupId}.json`)
}

async function fetchWithFallback(urls) {
  for (const url of urls) {
    try {
      console.log(`Intentando API: ${url}`)
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json'
        },
        timeout: 30000
      })
      
      if (!res.ok) {
        console.log(`API falló con status: ${res.status}`)
        continue
      }
      
      const json = await res.json()
      console.log('Respuesta de API:', JSON.stringify(json).substring(0, 200))
      
      // Formato AlyaBot API
      if (json.status === true || json.status === 'success') {
        if (json.data) {
          const dlLink = json.data.dl || json.data.url || json.data.link
          const title = json.data.title || json.data.filename || 'desconocido'
          if (dlLink) return { url: dlLink, title: title }
        }
        // Algunas APIs pueden devolver el resultado directo
        if (json.result) {
          const dlLink = json.result.dl || json.result.url || json.result.link
          const title = json.result.title || json.result.filename || 'desconocido'
          if (dlLink) return { url: dlLink, title: title }
        }
      }
      
      // Formato directo
      if (json.dl || json.url || json.link) {
        return { 
          url: json.dl || json.url || json.link, 
          title: json.title || json.filename || 'desconocido' 
        }
      }
      
    } catch (e) {
      console.log(`Error en API ${url}:`, e.message)
    }
  }
  throw new Error('Todas las APIs de AlyaBot fallaron')
}

const handler = async (m, { conn, text, command, usedPrefix }) => {
  // Verificar si el usuario está registrado
  const user = global.db.data.users[m.sender];
  if (!user || !user.registered) {
    await conn.sendMessage(m.chat, { react: { text: "🔒", key: m.key } });
    return conn.reply(m.chat, 
      `🔒 *REGISTRO REQUERIDO* 🔒\n\n` +
      `Para usar el comando *${command}* necesitas estar registrado.\n\n` +
      `📋 *Regístrate con:*\n` +
      `${usedPrefix}reg nombre.edad\n\n` +
      `*Ejemplo:* ${usedPrefix}reg ${conn.getName(m.sender) || 'Usuario'}.18\n\n` +
      `¡Regístrate para descargar música y videos de YouTube! 🎵`,
      m
    );
  }

  const filePath = getFilePath(m.chat)
  if (fs.existsSync(filePath)) {
    let db = JSON.parse(fs.readFileSync(filePath))
    if (db.primary && conn.user.jid !== db.primary) return
  }

  try {
    if (!text.trim()) {
      await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
      return conn.reply(m.chat, 
        `🌸 *DESCARGAS DE YOUTUBE* 🌸\n\n` +
        `Por favor, ingresa el nombre de la música o el enlace de YouTube.\n\n` +
        `📝 *Ejemplos:*\n` +
        `${usedPrefix}play Bad Bunny\n` +
        `${usedPrefix}ytmp4 https://youtu.be/...\n` +
        `${usedPrefix}playaudio nombre de canción`,
        m
      )
    }

    let videoIdToFind = text.match(youtubeRegexID)
    let ytSearch = await yts(videoIdToFind ? 'https://youtu.be/' + videoIdToFind[1] : text)

    if (videoIdToFind) {
      const videoId = videoIdToFind[1]
      ytSearch = ytSearch.all.find(item => item.videoId === videoId) || ytSearch.videos.find(item => item.videoId === videoId)
    }

    ytSearch = ytSearch.all?.[0] || ytSearch.videos?.[0] || ytSearch
    if (!ytSearch || ytSearch.length === 0) {
      await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
      return m.reply('✧ No se encontraron resultados para tu búsqueda.')
    }

    let { title, thumbnail, timestamp, views, ago, url, author } = ytSearch
    const vistas = formatViews(views)
    const canalLink = author?.url || 'Desconocido'

    const infoMessage = `
🌸 𝗬𝗼𝘂𝗧𝘂𝗯𝗲 𝗗𝗼𝘄𝗻𝗹𝗼𝗮𝗱 | 𝙒𝙖𝙜𝙪𝙧𝙞 𝘽𝙤𝙩

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

    // Enviar reacción de procesando
    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
    await conn.reply(m.chat, infoMessage, m, JT)

    // Codificar URL para usar en las APIs
    const ytUrl = encodeURIComponent(url)
    
    // URLs de las APIs de AlyaBot solamente
    const audioAPIs = [
      `https://rest.alyabotpe.xyz/dl/ytmp3?url=${ytUrl}`,
      `https://rest.alyabotpe.xyz/dl/ytdlv2?url=${ytUrl}&type=audio`
    ]
    
    const videoAPIs = [
      `https://rest.alyabotpe.xyz/dl/ytmp4?url=${ytUrl}`,
      `https://rest.alyabotpe.xyz/dl/ytdlv2?url=${ytUrl}&type=video`
    ]

    if (['play', 'yta', 'ytmp3', 'playaudio'].includes(command)) {
      try {
        await conn.sendMessage(m.chat, { react: { text: "🔍", key: m.key } });
        console.log(`Buscando audio para: ${title}`)
        
        const data = await fetchWithFallback(audioAPIs)
        console.log(`Audio encontrado en: ${data.url}`)
        
        // Enviar reacción de éxito
        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
        
        // Limpiar título para nombre de archivo
        const cleanTitle = (data.title || title || 'audio')
          .replace(/[<>:"/\\|?*]/g, '')
          .substring(0, 50)
        
        // Enviar el audio
        await conn.sendMessage(m.chat, {
          audio: { 
            url: data.url,
            mimetype: 'audio/mpeg'
          },
          fileName: `${cleanTitle}.mp3`,
          mimetype: 'audio/mpeg',
          ptt: false
        }, { quoted: m })
        
      } catch (e) {
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        console.error('Error en descarga de audio:', e)
        return conn.reply(m.chat, 
          `🌸 𝗬𝗼𝘂𝗧𝘂𝗯𝗲 𝗗𝗼𝘄𝗻𝗹𝗼𝗮𝗱 | 𝙒𝙖𝙜𝙪𝙧𝙞 𝘽𝙤𝙩\n\n` +
          `━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
          `❌ *¡Error en la descarga de audio!*\n\n` +
          `𝗠𝗲𝗻𝘀𝗮𝗷𝗲: ${e.message}\n\n` +
          `Intenta con otro enlace o más tarde.`,
          m
        )
      }
    } else if (['play2', 'ytv', 'ytmp4'].includes(command)) {
      try {
        await conn.sendMessage(m.chat, { react: { text: "🔍", key: m.key } });
        console.log(`Buscando video para: ${title}`)
        
        const data = await fetchWithFallback(videoAPIs)
        console.log(`Video encontrado en: ${data.url}`)
        
        // Enviar reacción de éxito
        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
        
        // Limpiar título para nombre de archivo
        const cleanTitle = (data.title || title || 'video')
          .replace(/[<>:"/\\|?*]/g, '')
          .substring(0, 50)
        
        // Enviar el video
        await conn.sendMessage(m.chat, {
          video: { 
            url: data.url,
            mimetype: 'video/mp4'
          },
          fileName: `${cleanTitle}.mp4`,
          mimetype: 'video/mp4',
          caption: `🌸 𝗬𝗼𝘂𝗧𝘂𝗯𝗲 𝗗𝗼𝘄𝗻𝗹𝗼𝗮𝗱 | 𝙒𝙖𝙜𝙪𝙧𝙞 𝘽𝙤𝙩\n\n✅ *${cleanTitle}*\n\n📹 Video descargado exitosamente.`
        }, { quoted: m })
        
      } catch (e) {
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        console.error('Error en descarga de video:', e)
        return conn.reply(m.chat, 
          `🌸 𝗬𝗼𝘂𝗧𝘂𝗯𝗲 𝗗𝗼𝘄𝗻𝗹𝗼𝗮𝗱 | 𝙒𝙖𝙜𝙪𝙧𝙞 𝘽𝙤𝙩\n\n` +
          `━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
          `❌ *¡Error en la descarga de video!*\n\n` +
          `𝗠𝗲𝗻𝘀𝗮𝗷𝗲: ${e.message}\n\n` +
          `Intenta con otro enlace o más tarde.`,
          m
        )
      }
    } else {
      await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
      return conn.reply(m.chat, 
        `🌸 𝗬𝗼𝘂𝗧𝘂𝗯𝗲 𝗗𝗼𝘄𝗻𝗹𝗼𝗮𝗱 | 𝙒𝙖𝙜𝙪𝙧𝙞 𝘽𝙤𝙩\n\n` +
        `✧︎ Comando no reconocido.\n\n` +
        `Usa: ${usedPrefix}play [nombre/url] para audio\n` +
        `o: ${usedPrefix}play2 [nombre/url] para video`,
        m
      )
    }

  } catch (error) {
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    return m.reply(
      `🌸 𝗬𝗼𝘂𝗧𝘂𝗯𝗲 𝗗𝗼𝘄𝗻𝗹𝗼𝗮𝗱 | 𝙒𝙖𝙜𝙪𝙧𝙞 𝘽𝙤𝙩\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
      `⚠︎ *Ocurrió un error:*\n\n` +
      `𝗠𝗲𝗻𝘀𝗮𝗷𝗲: ${error.message}`
    )
  }
}

handler.command = handler.help = ['play', 'yta', 'ytmp3', 'play2', 'ytv', 'ytmp4', 'playaudio']
handler.tags = ['descargas']
handler.group = true
handler.register = true

export default handler

function formatViews(views) {
  if (!views) return "No disponible"
  if (views >= 1_000_000_000) return `${(views / 1_000_000_000).toFixed(1)}B (${views.toLocaleString()})`
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M (${views.toLocaleString()})`
  if (views >= 1_000) return `${(views / 1_000).toFixed(1)}k (${views.toLocaleString()})`
  return views.toString()
}