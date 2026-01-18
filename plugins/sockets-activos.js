import ws from 'ws'
import { join } from 'path'
import fs from 'fs'

const readSessionName = (jid) => {
  try {
    const number = jid.split('@')[0]?.replace(/\D/g, '')
    if (!number) return null
    const configPath = join('./JadiBots', number, 'config.json')
    if (!fs.existsSync(configPath)) return null
    const cfg = JSON.parse(fs.readFileSync(configPath))
    return cfg?.name || null
  } catch (e) {
    return null
  }
}

let handler = async (m, { conn }) => {
  const mainBotConn = global.conn
  if (!global.conns || !Array.isArray(global.conns)) global.conns = []
  global.conns = global.conns.filter(subConn => {
    return subConn.user?.jid && subConn.ws?.socket?.readyState === ws.OPEN
  })

  let totalSubs = global.conns.length
  const totalPrincipales = 1
  const totalBots = totalPrincipales + totalSubs
  const sesiones = totalBots.toLocaleString()

  let botsEnGrupo = 0
  let botsEnGrupoDetalles = []

  const mainJid = mainBotConn.user?.jid || conn.user?.jid
  let mainName = readSessionName(mainJid) || mainBotConn.user?.name || 'Waguri Bot🌸'

  if (mainBotConn.chats && mainBotConn.chats[m.chat]) {
    botsEnGrupo++
    botsEnGrupoDetalles.push({ jid: mainBotConn.user.jid, tipo: '⍟' })
  }

  for (let subConn of global.conns) {
    if (subConn.chats && subConn.chats[m.chat]) {
      botsEnGrupo++
      botsEnGrupoDetalles.push({ jid: subConn.user.jid, tipo: '⛧' })
    }
  }

  let txt = `◤━━━━━━━━━━━━━━━━━━━◥\nʙᴏᴛꜱ • ᴀᴄᴛɪᴠᴏꜱ\n◣━━━━━━━━━━━━━━━━━━━◤\n\n`
  txt += `⟣ ᴛᴏᴛᴀʟ: ${sesiones}\n`
  txt += `⟢ ᴘʀɪɴᴄɪᴘᴀʟ: ${totalPrincipales}\n`
  txt += `⟣ ꜱᴜʙꜱ: ${totalSubs}\n\n`
  txt += `◤━━━━━━━━━━━━━━━━━━━◥\nɢʀᴜᴘᴏ • ᴀᴄᴛᴜᴀʟ\n◣━━━━━━━━━━━━━━━━━━━◤\n\n`
  txt += `⟢ ᴘʀᴇꜱᴇɴᴛᴇꜱ: ${botsEnGrupo}\n\n`

  if (botsEnGrupo > 0) {
    for (let b of botsEnGrupoDetalles) {
      txt += `${b.tipo} @${b.jid.split('@')[0]}\n`
    }
  } else {
    txt += `⟣ ɴɪɴɢᴜɴ ʙᴏᴛ ᴀᴄᴛɪᴠᴏ\n`
  }

  const mentions = botsEnGrupoDetalles.map(b => b.jid)
  await conn.sendMessage(m.chat, { text: txt, mentions }, { quoted: m })
}

handler.command = ['sockets', 'bots']
handler.group = true
export default handler