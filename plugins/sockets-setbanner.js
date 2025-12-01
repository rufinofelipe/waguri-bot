// ༻✦༺ ༻✧༺ ༻✦༺ ༻⸙͎۪۫༺ ༻✦༺ ༻✧༺ ༻✦༺
//   Ritual del Estandarte Sagrado - Código de la Casa Waguri
// ༻✦༺ ༻✧༺ ༻✦༺ ༻⸙͎۪۫༺ ༻✦༺ ༻✧༺ ༻✦༺

import fs from 'fs'
import path from 'path'
import axios from 'axios'
import FormData from 'form-data'
import { fileTypeFromBuffer } from 'file-type'

async function uploadToFreeImageHost(buffer) {
  try {
    const form = new FormData()
    form.append('source', buffer, 'file')
    const res = await axios.post('https://freeimage.host/api/1/upload', form, {
      params: {
        key: '6d207e02198a847aa98d0a2a901485a5' // Cambia si se acaba la cuota
      },
      headers: form.getHeaders()
    })
    return res.data.image.url
  } catch (err) {
    console.error('Error en el altar de imágenes:', err?.response?.data || err.message)
    return null
  }
}

const handler = async (m, { conn, command }) => {
  const senderNumber = m.sender.replace(/[^0-9]/g, '')
  const botPath = path.join('./JadiBots', senderNumber)
  const configPath = path.join(botPath, 'config.json')

  if (!fs.existsSync(botPath)) {
    return m.reply('🌸 *El ritual del estandarte solo puede ser realizado por el dueño de la esencia.*')
  }

  try {
    const q = m.quoted || m
    const mime = (q.msg || q).mimetype || q.mediaType || ''

    if (!mime || !/image\/(jpe?g|png|webp)/.test(mime)) {
      return conn.sendMessage(m.chat, {
        text: `🎨 *Responde a una imagen o proporciona un enlace sagrado.*\n\n> Ejemplo: #setbanner *<enlace del estandarte>*`,
      }, { quoted: m })
    }

    // Inicio del ritual
    await conn.sendMessage(m.chat, {
      react: { text: '🕯️', key: m.key }
    })

    // Descargar la esencia visual
    const media = await q.download()
    if (!media) throw new Error('🍂 No pude capturar la esencia visual.')

    // Guardar temporalmente en el jardín de los susurros
    const tempDir = './tmp'
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir)
    const { ext } = await fileTypeFromBuffer(media) || { ext: 'png' }
    const tempPath = path.join(tempDir, `estandarte_${Date.now()}.${ext}`)
    fs.writeFileSync(tempPath, media)

    // Elevar al altar de imágenes
    const uploadedUrl = await uploadToFreeImageHost(media)
    if (!uploadedUrl) throw new Error('💫 La esencia visual no pudo ser consagrada.')

    // Grabar en los pergaminos de configuración
    const config = fs.existsSync(configPath)
      ? JSON.parse(fs.readFileSync(configPath))
      : {}
    config.banner = uploadedUrl
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2))

    await conn.sendMessage(m.chat, {
      text: `🌺 *El estandarte ha sido renovado con éxito!*\n\nLa esencia visual ahora fluye con nueva energía.`,
    }, { quoted: m })

    await conn.sendMessage(m.chat, {
      react: { text: '✅', key: m.key }
    })

    // Liberar la esencia temporal
    fs.unlinkSync(tempPath)

  } catch (err) {
    console.error(err)
    await conn.sendMessage(m.chat, {
      text: '🍃 *El ritual ha fallado.*\n\nLa esencia visual no pudo ser consagrada, intenta nuevamente cuando la luna esté más favorable.',
    }, { quoted: m })
    await conn.sendMessage(m.chat, {
      react: { text: '✖️', key: m.key }
    })
  }
}

handler.help = ['setbanner']
handler.tags = ['serbot']
handler.command = /^setbanner$/i
handler.owner = false
export default handler

// ༻✦༺ ༻✧༺ ༻✦༺ ༻⸙͎۪۫༺ ༻✦༺ ༻✧༺ ༻✦༺
//   Que tu estandarte refleje la belleza de tu esencia
// ༻✦༺ ༻✧༺ ༻✦༺ ༻⸙͎۪۫༺ ༻✦༺ ༻✧༺ ༻✦༺
