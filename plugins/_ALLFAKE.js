import pkg from '@whiskeysockets/baileys'
import fs from 'fs'
import fetch from 'node-fetch'
import axios from 'axios'
import moment from 'moment-timezone'
const { generateWAMessageFromContent, prepareWAMessageMedia, proto } = pkg

// Variables globales
global.creador = 'wa.me/240222646582'
global.namechannel = '🌸❖𝗪𝗔𝗚𝗨𝗥𝗜 𝗕𝗢𝗧❖🌸'
global.namechannel2 = '🌸❖𝗪𝗔𝗚𝗨𝗥𝗜 𝗕𝗢𝗧❖🌸'
global.namegrupo = '🌸𝗪𝗔𝗚𝗨𝗥𝗜 𝗕𝗢𝗧❖🌸'
global.namecomu = '🌸 WAGURI BOT COMMUNITY 🌸'
global.listo = '*Aquí tienes ฅ^•ﻌ•^ฅ*'
global.canalIdM = ["120363423258391692@newsletter", "120363423258391692@newsletter"]
global.canalNombreM = ["🌸❖𝗪𝗔𝗚𝗨𝗥𝗜 𝗕𝗢𝗧❖🌸"]
global.iconCache = global.iconCache || new Map()
global.defaultIcon = 'https://raw.githubusercontent.com/ANDERSONARRUE/Img.2/main/upload_1771531295102.jpg'
global.rwait = '🕒'
global.done = '✅'
global.error = '✖️'
global.msm = '⚠︎'
global.emoji = '🌸'
global.emoji2 = '🌸'
global.emoji3 = '🌸'
global.emoji4 = '🌸'
global.emoji5 = '🌸'
global.wait = '🌸 Espera un momento, soy lento...'
global.waitt = '🌸 Espera un momento, soy lento...'
global.waittt = '🌸 Espera un momento, soy lento...'
global.waitttt = '🌸 Espera un momento, soy lento...'

// Funciones globales
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
            timeout: options.timeout || 10000,
            ...options
        })
        clearTimeout(timeoutId)
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        return response
    } catch (error) {
        console.log(`⚠️ SafeFetch error para ${url}: ${error.message}`)
        if (url.includes('catbox.moe') && options.fallbackUrl) {
            console.log(`🔄 Intentando con URL fallback: ${options.fallbackUrl}`)
            try {
                return await fetch(options.fallbackUrl, {
                    timeout: 5000
                })
            } catch (fallbackError) {
                console.log(`❌ Fallback también falló: ${fallbackError.message}`)
                throw new Error(`Tanto URL principal como fallback fallaron`)
            }
        }
        throw error
    }
}

// Funciones auxiliares
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

async function loadIconOptimized() {
    const cacheKey = 'daily_icon'
    const cacheExpiry = 1000 * 60 * 60 * 12
    const cached = global.iconCache.get(cacheKey)
    if (cached && (Date.now() - cached.timestamp) < cacheExpiry) {
        console.log(`✅ Usando icono desde caché`)
        global.icons = cached.data
        return
    }
    setImmediate(async () => {
        try {
            const db = './src/database/db.json'
            const db_ = JSON.parse(fs.readFileSync(db))
            const category = "imagen"
            const random = Math.floor(Math.random() * db_.links[category].length)
            const randomlink = db_.links[category][random]
            console.log(`🔄 Cargando icono en background: ${randomlink}`)
            const response = await global.safeFetch(randomlink, {
                timeout: 5000,
                fallbackUrl: global.defaultIcon
            })
            if (response.ok) {
                const rimg = await response.buffer()
                global.iconCache.set(cacheKey, {
                    data: rimg,
                    timestamp: Date.now()
                })
                global.icons = rimg
                console.log(`✅ Icono cargado y cacheado exitosamente`)
            } else {
                throw new Error(`HTTP ${response.status}`)
            }
        } catch (error) {
            console.log(`⚠️ Error cargando icono en background: ${error.message}`)
            try {
                const fallbackResponse = await global.safeFetch(global.defaultIcon, {
                    timeout: 3000
                })
                if (fallbackResponse.ok) {
                    const fallbackImg = await fallbackResponse.buffer()
                    global.iconCache.set(cacheKey, {
                        data: fallbackImg,
                        timestamp: Date.now()
                    })
                    global.icons = fallbackImg
                    console.log(`✅ Icono fallback cargado`)
                }
            } catch (fallbackError) {
                console.log('⚠️ Usando modo sin icono')
                global.icons = null
            }
        }
    })
    if (!cached) {
        console.log('🔄 Usando modo rápido sin descarga inicial...')
        global.icons = null
    }
}

// Handler
var handler = m => m

handler.all = async function(m) {
    // Configurar ofcbot con conn si está disponible
    if (!global.ofcbot && m && m.conn) {
        global.ofcbot = `${m.conn.user.jid.split('@')[0]}`
    }
    
    global.d = new Date(new Date() + 3600000)
    global.locale = 'es'
    global.dia = global.d.toLocaleDateString(global.locale, {
        weekday: 'long'
    })
    global.fecha = global.d.toLocaleDateString('es', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric'
    })
    global.mes = global.d.toLocaleDateString('es', {
        month: 'long'
    })
    global.año = global.d.toLocaleDateString('es', {
        year: 'numeric'
    })
    global.tiempo = global.d.toLocaleString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: true
    })
    
    global.emojis = [global.emoji, global.emoji2, global.emoji3, global.emoji4].getRandom ? [global.emoji, global.emoji2, global.emoji3, global.emoji4].getRandom() : pickRandom([global.emoji, global.emoji2, global.emoji3, global.emoji4])
    
    await loadIconOptimized()
    
    setInterval(() => {
        if (global.iconCache && global.iconCache.size > 50) {
            const now = Date.now()
            const expiry = 1000 * 60 * 30
            for (const [key, value] of global.iconCache.entries()) {
                if (now - value.timestamp > expiry) {
                    global.iconCache.delete(key)
                }
            }
            console.log(`🧹 Cache limpiado: ${global.iconCache.size} elementos restantes`)
        }
    }, 1000 * 60 * 30)
    
    var ase = new Date()
    var hour = ase.getHours()
    switch (hour) {
        case 0:
            hour = 'Lɪɴᴅᴀ Nᴏᴄʜᴇ 🌃'
            break
        case 1:
            hour = 'Lɪɴᴅᴀ Nᴏᴄʜᴇ 🌃'
            break
        case 2:
            hour = 'Lɪɴᴅᴀ Nᴏᴄʜᴇ 🌃'
            break
        case 3:
            hour = 'Lɪɴᴅᴀ Mᴀɴ̃ᴀɴᴀ 🌄'
            break
        case 4:
            hour = 'Lɪɴᴅᴀ Mᴀɴ̃ᴀɴᴀ 🌄'
            break
        case 5:
            hour = 'Lɪɴᴅᴀ Mᴀɴ̃ᴀɴᴀ 🌄'
            break
        case 6:
            hour = 'Lɪɴᴅᴀ Mᴀɴ̃ᴀɴᴀ 🌄'
            break
        case 7:
            hour = 'Lɪɴᴅᴀ Mᴀɴ̃ᴀɴᴀ 🌅'
            break
        case 8:
            hour = 'Lɪɴᴅᴀ Mᴀɴ̃ᴀɴᴀ 🌄'
            break
        case 9:
            hour = 'Lɪɴᴅᴀ Mᴀɴ̃ᴀɴᴀ 🌄'
            break
        case 10:
            hour = 'Lɪɴᴅᴏ Dɪᴀ 🌤'
            break
        case 11:
            hour = 'Lɪɴᴅᴏ Dɪᴀ 🌤'
            break
        case 12:
            hour = 'Lɪɴᴅᴏ Dɪᴀ 🌤'
            break
        case 13:
            hour = 'Lɪɴᴅᴏ Dɪᴀ 🌤'
            break
        case 14:
            hour = 'Lɪɴᴅᴀ Tᴀʀᴅᴇ 🌆'
            break
        case 15:
            hour = 'Lɪɴᴅᴀ Tᴀʀᴅᴇ 🌆'
            break
        case 16:
            hour = 'Lɪɴᴅᴀ Tᴀʀᴅᴇ 🌆'
            break
        case 17:
            hour = 'Lɪɴᴅᴀ Tᴀʀᴅᴇ 🌆'
            break
        case 18:
            hour = 'Lɪɴᴅᴀ Nᴏᴄʜᴇ 🌃'
            break
        case 19:
            hour = 'Lɪɴᴅᴀ Nᴏᴄʜᴇ 🌃'
            break
        case 20:
            hour = 'Lɪɴᴅᴀ Nᴏᴄʜᴇ 🌃'
            break
        case 21:
            hour = 'Lɪɴᴅᴀ Nᴏᴄʜᴇ 🌃'
            break
        case 22:
            hour = 'Lɪɴᴅᴀ Nᴏᴄʜᴇ 🌃'
            break
        case 23:
            hour = 'Lɪɴᴅᴀ Nᴏᴄʜᴇ 🌃'
            break
    }
    
    global.saludo = hour
    global.nombre = m.pushName || 'Anónimo'
    global.taguser = '@' + m.sender.split("@s.whatsapp.net")[0]
    var more = String.fromCharCode(8206)
    global.readMore = more.repeat(850)
    global.packsticker = `🏆━━━✦✧✦━━━🏆
❖ Usuario: ${global.nombre}
✩ Bot: ${global.ofcbot}
📅 Fecha: ${global.fecha}
⏰ Hora: ${global.tiempo}
🏆━━━✦✧✦━━━🏆`
    global.packsticker2 = ` 🏆━━━✦✧✦━━━🏆 ${global.creador} `
    
    // Redes
    var canal = 'https://whatsapp.com/channel/0029VbBUHyQCsU9IpJ0oIO2i'
    var comunidad = 'https://chat.whatsapp.com/LRQrf8vv50BDtwN8JWfhrX'
    var git = 'https://github.com/Brauliovh3'
    var github = 'https://github.com/Brauliovh3/HATSUNE-MIKU'
    let correo = 'duartexv.ofc@gmail.com'
    global.redes = [canal, comunidad, git, github, correo].getRandom ? [canal, comunidad, git, github, correo].getRandom() : pickRandom([canal, comunidad, git, github, correo])
    
    // Foto de perfil
    try {
        if (m.conn) {
            global.fotoperfil = await m.conn.profilePictureUrl(m.sender, 'image').catch(_ => 'https://cdn.hostrta.win/fl/9zsk.jpg')
        }
    } catch (error) {
        global.fotoperfil = 'https://cdn.hostrta.win/fl/9zsk.jpg'
    }
    
    global.channelRD = await getRandomChannel()
    
    global.fkontak = {
        key: {
            participant: `0@s.whatsapp.net`,
            ...(m.chat ? {
                remoteJid: `6285600793871-1614953337@g.us`
            } : {})
        },
        message: {
            'contactMessage': {
                'displayName': `${global.nombre}`,
                'vcard': `BEGIN:VCARD\nVERSION:3.0\nN:XL;${global.nombre},;;;\nFN:${global.nombre},\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`,
                'jpegThumbnail': null,
                thumbnail: null,
                sendEphemeral: true
            }
        }
    }
    
    global.fake = {
        contextInfo: {
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: global.channelRD.id,
                newsletterName: global.channelRD.name,
                serverMessageId: -1
            }
        }
    }
    
    global.icono = ['https://cdn.hostrta.win/fl/9zsk.jpg'].getRandom ? ['https://cdn.hostrta.win/fl/9zsk.jpg'].getRandom() : pickRandom(['https://cdn.hostrta.win/fl/9zsk.jpg'])
    
    global.rcanal = {
        contextInfo: {
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: global.channelRD.id,
                serverMessageId: '',
                newsletterName: global.channelRD.name
            },
            externalAdReply: {
                title: global.ofcbot || 'Bot',
                body: global.creador,
                mediaUrl: null,
                description: null,
                previewType: "PHOTO",
                thumbnail: global.icons ? global.icons : await (await fetch(global.icono)).buffer(),
                sourceUrl: global.redes,
                mediaType: 1,
                renderLargerThumbnail: false
            },
            mentionedJid: null
        }
    }
}

export default handler
