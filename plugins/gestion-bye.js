// ༻✦༺ ༻✧༺ ༻✦༺ ༻⸙͎۪۫༺ ༻✦༺ ༻✧༺ ༻✦༺
//   Jardín de las Despedidas - Código de la Casa Waguri
// ༻✦༺ ༻✧༺ ༻✦༺ ༻⸙͎۪۫༺ ༻✦༺ ༻✧༺ ༻✦༺

import fs from 'fs'
import { join } from 'path'
import { WAMessageStubType } from '@whiskeysockets/baileys'

// Función para obtener nombre y estandarte del bot según la sesión/config
function getBotConfig(conn) {
  let nombreBot = typeof botname !== 'undefined' ? botname : 'Yotsuba Nakano'
  let bannerFinal = 'https://qu.ax/zRNgk.jpg'

  const botActual = conn.user?.jid?.split('@')[0]?.replace(/\D/g, '')
  const configPath = join('./JadiBots', botActual || '', 'config.json')
  if (botActual && fs.existsSync(configPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(configPath))
      if (config.name) nombreBot = config.name
      if (config.banner) bannerFinal = config.banner
    } catch {}
  }
  return { nombreBot, bannerFinal }
}

// Ceremonia de despedida (usado por el comando testbye y por el evento)
async function sendByeTo(conn, chatId, userId) {
  try {
    const chat = global.db.data.chats?.[chatId]
    // Activado por defecto si nunca se configuró
    const isByeEnabled = chat && chat.bye !== undefined ? chat.bye : true
    if (!isByeEnabled) return

    const taguser = '@' + (userId || '').split('@')[0]
    const { nombreBot, bannerFinal } = getBotConfig(conn)
    const devby = `${nombreBot}, ${typeof textbot !== 'undefined' ? textbot : ''}`

    const despedida =
      `🌸 ADIÓS, VIAJERO 🌸\n\n` +
      `✨ ${taguser}\n\n` +
      `🍃 Que los vientos te sean favorables en tu camino.\n` +
      `🌺 Esperamos tu regreso a este jardín encantado.\n\n` +
      `> Si necesitas guía, usa *#help*.`

    await conn.sendMessage(chatId, {
      text: despedida,
      contextInfo: {
        mentionedJid: [userId],
        externalAdReply: {
          title: devby,
          sourceUrl: 'https://whatsapp.com/',
          mediaType: 1,
          renderLargerThumbnail: true,
          thumbnailUrl: 'https://qu.ax/CZpHp.jpg'
        }
      }
    })
  } catch (e) {
    console.error('Error en la ceremonia de despedida:', e)
  }
}

// Compatibilidad: exportar sendBye como estaba en tu código original
export async function sendBye(conn, m) {
  try {
    const chatId = m.chat
    const userId = m.sender || (m.messageStubParameters && m.messageStubParameters[0])
    if (!chatId || !userId) return
    await sendByeTo(conn, chatId, userId)
  } catch (e) {
    console.error('Error en el envoltorio de despedida:', e)
  }
}

// Guardián que escucha eventos de participantes (se ejecuta antes de procesar mensajes normales)
let handler = m => m

handler.before = async function (m, { conn, groupMetadata }) {
  try {
    if (!m.messageStubType || !m.isGroup) return true

    const chat = global.db.data.chats?.[m.chat]
    if (!chat) return true

    // Si el jardín tiene primaryBot definido y no es este, no procesar
    const primaryBot = chat.primaryBot
    if (primaryBot && conn.user?.jid !== primaryBot) return false

    // Solo procesar si la despedida está activada (por defecto true)
    const isByeEnabled = typeof chat.bye !== 'undefined' ? chat.bye : true
    if (!isByeEnabled) return true

    // Evento: flor que abandona el jardín
    if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_REMOVE || m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_LEAVE) {
      const userId = m.messageStubParameters?.[0]
      if (!userId) return true

      // Obtener groupMetadata si no fue pasado
      const gm = groupMetadata || (await conn.groupMetadata?.(m.chat).catch(() => null)) || {}

      await sendByeTo(conn, m.chat, userId)
      return false
    }

    return true
  } catch (err) {
    console.error('Error del guardián de despedidas:', err)
    return true
  }
}

// COMANDOS del Jardín (activar/desactivar) y testbye. Mantengo la lógica original y permisos.
const cmdHandler = async (m, { conn, command, args, usedPrefix, isAdmin, isOwner }) => {
  if (command === 'testbye') {
    // Prueba ceremonial: siempre envía el mensaje, aunque esté desactivado
    await sendByeTo(conn, m.chat, m.sender)
    return
  }

  if (command !== 'bye') return

  // Solo jardineros mayores pueden activar/desactivar
  if (!(isAdmin || isOwner)) return conn.reply(m.chat, '🌿 Solo los jardineros mayores pueden modificar las ceremonias de despedida.\n\n- Tu espíritu aún no está preparado para tales decisiones', m, rcanal)

  const chat = global.db.data.chats[m.chat]
  if (!chat) return
  let isByeEnabled = chat.bye !== undefined ? chat.bye : true

  if (args[0] === 'on' || args[0] === 'enable') {
    if (isByeEnabled) return conn.reply(m.chat, `🌸 La ceremonia de *despedida* ya estaba *activada* en este jardín.`, m, rcanal)
    isByeEnabled = true
  } else if (args[0] === 'off' || args[0] === 'disable') {
    if (!isByeEnabled) return conn.reply(m.chat, `🍂 La ceremonia de *despedida* ya estaba *desactivada* en este jardín.`, m, rcanal)
    isByeEnabled = false
  } else {
    return conn.reply(
      m.chat,
      `✨ Los jardineros mayores pueden activar o desactivar la ceremonia *${command}* utilizando:\n\n🌺 *${command}* enable\n🌺 *${command}* disable\n\n🎋 Estado actual » *${isByeEnabled ? '✓ Activada' : '✗ Desactivada'}*`,
      m
    )
  }

  chat.bye = isByeEnabled
  return conn.reply(m.chat, `La ceremonia de *despedida* fue *${isByeEnabled ? 'activada' : 'desactivada'}* para este jardín.`, m, rcanal)
}

cmdHandler.help = ['bye', 'testbye']
cmdHandler.tags = ['group']
cmdHandler.command = ['bye', 'testbye']
cmdHandler.group = true

const exported = handler
exported.help = cmdHandler.help
exported.tags = cmdHandler.tags
exported.command = cmdHandler.command
exported.group = true

export default exported

// ༻✦༺ ༻✧༺ ༻✦༺ ༻⸙͎۪۫༺ ༻✦༺ ༻✧༺ ༻✦༺
//   Que cada despedida sea un nuevo comienzo
// ༻✦༺ ༻✧༺ ༻✦༺ ༻⸙͎۪۫༺ ༻✦༺ ༻✧༺ ༻✦༺
