import pkg from '@whiskeysockets/baileys'
import fs from 'fs'
import fetch from 'node-fetch'
import axios from 'axios'
import moment from 'moment-timezone'

const { generateWAMMessageFromContent, prepareWAMessageMedia, proto } = pkg

var handler = m => m
handler.all = async function (m, { conn }) {

global.getBuffer = async function getBuffer(url, options = {}) {
  try {

    const cacheKey = `buffer_${url}`
    if (global.iconCache?.has(cacheKey)) {
      const cached = global.iconCache.get(cacheKey)
      if (Date.now() - cached.timestamp < 300000) {
        return cached.data
      }
    }

    const res = await axios({
      method: "get",
      url,
      headers: {
        'DNT': 1,
        'User-Agent': 'GoogleBot',
        'Upgrade-Insecure-Request': 1
      },
      timeout: options.timeout || 8000,
      responseType: 'arraybuffer',
      ...options
    })

    if (res.data) {
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
    return response
  } catch (error) {
    console.log(`⚠️ SafeFetch error: ${error.message}`)
    throw error
  }
}

global.creador = 'wa.me/240222646582'
global.ofcbot = conn.user.jid.split('@')[0]
global.namechannel = '⟡ 𝐃𝐢𝐠𝐢𝐭𝐚𝐥 𝐂𝐞𝐧𝐭𝐞𝐫 ⟡'

global.iconCache = global.iconCache || new Map()
global.defaultIcon = 'https://files.catbox.moe/l8qiik.jpeg'



global.fake = {
  contextInfo: {
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: channelRD?.id,
      newsletterName: channelRD?.name,
      serverMessageId: -1
    }
  },
  quoted: m
}


global.rcanal = { 
  contextInfo: { 
    isForwarded: true, 
    forwardedNewsletterMessageInfo: { 
      newsletterJid: channelRD.id, 
      serverMessageId: 100, 
      newsletterName: channelRD.name
    },
    externalAdReply: { 
      showAdAttribution: true,
      title: "Pack",
      body: "Dev",
      previewType: "PHOTO",
      thumbnailUrl: 'https://qu.ax/JYhlr.jpg',
      sourceUrl: 'https://github.com'
    } 
  }
}

}

export default handler

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)]
}

async function getRandomChannel() {
  let randomIndex = Math.floor(Math.random() * canalIdM.length)
  return {
    id: canalIdM[randomIndex],
    name: canalNombreM[randomIndex]
  }
}
