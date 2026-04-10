import pkg from '@whiskeysockets/baileys'
import fs from 'fs'
import fetch from 'node-fetch'
import axios from 'axios'
import moment from 'moment-timezone'
const { generateWAMessageFromContent, prepareWAMessageMedia, proto } = pkg

var handler = m => m
handler.all = async function (m) {

    global.getBuffer = async function getBuffer(url, options) {
        try {
            options = options || {}
            const cacheKey = `buffer_${url}`
            if (global.iconCache && global.iconCache.has(cacheKey)) {
                const cached = global.iconCache.get(cacheKey)
                if (Date.now() - cached.timestamp < 300000) {
                    console.log('⚡ Buffer desde caché')
                    return cached.data
                }
            }
            var res = await axios({
                method: "get",
                url,
                headers: {
                    'DNT': 1,
                    'User-Agent': 'GoogleBot',
                    'Upgrade-Insecure-Request': 1
                },
                timeout: options.timeout || 8000,
                ...options,
                responseType: 'arraybuffer'
            })
            if (global.iconCache && res.data) {
                global.iconCache.set(cacheKey, {
                    data: res.data,
                    timestamp: Date.now()
                })
            }
            return res.data
        } catch (e) {
            console.log(`⚠️ Error en getBuffer: ${e.message}`)
            return null
        }
    }

    global.safeFetch = async function safeFetch(url, options = {}) {
        try {
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), options.timeout || 10000)
            const response = await fetch(url, {
                signal: controller.signal,
                ...options
            })
            clearTimeout(timeoutId)
            if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`)
            return response
        } catch (error) {
            console.log(`⚠️ SafeFetch error para ${url}: ${error.message}`)
            if (url.includes('catbox.moe') && options.fallbackUrl) {
                try {
                    return await fetch(options.fallbackUrl, { timeout: 5000 })
                } catch (fallbackError) {
                    throw new Error(`Tanto URL principal como fallback fallaron`)
                }
            }
            throw error
        }
    }

    global.creador = 'wa.me/240222646582'
    global.ofcbot = `${conn.user.jid.split('@')[0]}`
    global.namechannel = 'waguri bot'
    global.namechannel2 = 'waguri bot'
    global.namegrupo = 'waguri bot'
    global.namecomu = 'waguri bot'
    global.listo = '*Aquí tienes ฅ^•ﻌ•^ฅ*'
    global.fotoperfil = await conn.profilePictureUrl(m.sender, 'image').catch(_ => 'https://raw.githubusercontent.com/danielalejandrobasado-glitch/Yotsuba-MD-Premium/main/uploads/d4abc3ed38259119.jpg')

    global.canalIdM = ["120363420979328566@newsletter", "120363420979328566@newsletter"]
    global.canalNombreM = ["waguri bot"]
    global.channelRD = await getRandomChannel()

    global.d = new Date(Date.now() + 3600000)
    global.locale = 'es'
    global.dia = global.d.toLocaleDateString(global.locale, { weekday: 'long' })
    global.fecha = global.d.toLocaleDateString('es', { day: 'numeric', month: 'numeric', year: 'numeric' })
    global.mes = global.d.toLocaleDateString('es', { month: 'long' })
    global.año = global.d.toLocaleDateString('es', { year: 'numeric' })
    global.tiempo = global.d.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true })

    global.rwait = '🕒'
    global.done = '✅'
    global.error = '✖️'
    global.msm = '⚠︎'

    global.emoji = '🩵'
    global.emoji2 = '✨'
    global.emoji3 = '💎'
    global.emoji4 = '🌸'
    global.emoji5 = '🩵'
    global.emojis = [global.emoji, global.emoji2, global.emoji3, global.emoji4].getRandom()

    global.wait = '🩵 Espera un momento, soy lento...'
    global.waitt = '🩵 Espera un momento, soy lento...'

    var canal = 'https://whatsapp.com/channel/0029VbBUHyQCsU9IpJ0oIO2i'
    var comunidad = 'https://chat.whatsapp.com/EFUkB3vLyAzAc4ZQzLabsp?mode=gi_t'
    var git = 'https://github.com/Brauliovh3'
    var github = 'https://github.com/Brauliovh3/HATSUNE-MIKU'
    let correo = 'rufinofelipe495@gmail.com'
    global.redes = [canal, comunidad, git, github, correo].getRandom()

    global.nombre = m.pushName || 'Anónimo'
    global.taguser = '@' + m.sender.split("@s.whatsapp.net")[0]
    var more = String.fromCharCode(8206)
    global.readMore = more.repeat(850)

    global.packsticker = `◌ ˚ ✦ ˚ ◌ ˚ ✦ ˚ ◌
  ｡･ﾟ♡ﾟ･｡
↳ Usuario: ${global.nombre}
↳ Bot: ${global.ofcbot || 'Bot'}
↳ ${global.fecha} • ${global.tiempo}
◌ ˚ ✦ ˚ ◌ ˚ ✦ ˚ ◌`

    global.packsticker2 = `⏤͟͞ू⃪ ✧ Blue lock Club ✧ ⏤͟͞ू⃪
   「 rest.apicausas.xyz 」`

    global.fkontak = { key: { participant: `0@s.whatsapp.net`, ...(m.chat ? { remoteJid: `6285600793871-1614953337@g.us` } : {}) }, message: { 'contactMessage': { 'displayName': `${global.nombre}`, 'vcard': `BEGIN:VCARD\nVERSION:3.0\nN:XL;${global.nombre},;;;\nFN:${global.nombre},\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`, 'jpegThumbnail': null, thumbnail: null, sendEphemeral: true } } }

    global.fake = {
        contextInfo: {
            isForwarded: true,
            forwardedNewstelterMessageInfo: {
                newsletterJid: global.channelRD.id,
                newsletterName: global.channelRD.name,
                serverMessageId: -1
            }
        }
    }

    global.icono = ['https://raw.githubusercontent.com/danielalejandrobasado-glitch/Yotsuba-MD-Premium/main/uploads/d4abc3ed38259119.jpg'].getRandom()

    let iconBuffer
    if (global.icons) {
        iconBuffer = global.icons
    } else {
        const iconRes = await fetch(global.icono)
        iconBuffer = Buffer.from(await iconRes.arrayBuffer())
    }

    global.rcanal = {
        contextInfo: {
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: global.channelRD.id,
                serverMessageId: '',
                newsletterName: global.channelRD.name
            },
            externalAdReply: {
                title: global.ofcbot,
                body: global.creador,
                mediaUrl: null,
                description: null,
                previewType: "PHOTO",
                thumbnail: iconBuffer,
                sourceUrl: global.redes,
                mediaType: 1,
                renderLargerThumbnail: false
            },
            mentionedJid: null
        }
    }
}

export default handler

function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)]
}

async function getRandomChannel() {
    let randomIndex = Math.floor(Math.random() * global.canalIdM.length)
    return {
        id: global.canalIdM[randomIndex],
        name: global.canalNombreM[randomIndex]
    }
}