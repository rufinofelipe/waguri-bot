import pkg from '@whiskeysockets/baileys'
import fs from 'fs'
import fetch from 'node-fetch'
import axios from 'axios'
import moment from 'moment-timezone'

const { generateWAMMessageFromContent, prepareWAMessageMedia, proto } = pkg

var handler = m => m
handler.all = async function (m, { conn }) {

  if (!conn) {
    console.log('⚠️ conn no está disponible')
    return
  }

  if (!conn.user) {
    console.log('⚠️ conn.user aún no está disponible, esperando...')
    return
  }

  if (!conn.user.jid) {
    console.log('⚠️ conn.user.jid aún no está disponible, esperando...')
    return
  }

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

  const channelRD = await getRandomChannel().catch(() => ({
    id: '120363423258391692@newsletter',
    name: global.namechannel
  }))

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
        showAdAttribution: false,
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
  try {
    if (!global.canalIdM || !global.canalNombreM || global.canalIdM.length === 0) {
      return {
        id: '120363423258391692@newsletter',
        name: '🌸❖𝗪𝗔𝗚𝗨𝗥𝗜 𝗕𝗢𝗧❖🌸'
      }
    }

    let randomIndex = Math.floor(Math.random() * global.canalIdM.length)
    return {
      id: global.canalIdM[randomIndex],
      name: global.canalNombreM[randomIndex]
    }
  } catch (e) {
    console.log('Error en getRandomChannel:', e)
    return {
      id: '120363312092804854@newsletter',
      name: '⟡ 𝐃𝐢𝐠𝐢𝐭𝐚𝐥 𝐂𝐞𝐧𝐭𝐞𝐫 ⟡'
    }
  }
}