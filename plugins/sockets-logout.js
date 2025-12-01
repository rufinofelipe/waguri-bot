// ༻✦༺ ༻✧༺ ༻✦༺ ༻⸙͎۪۫༺ ༻✦༺ ༻✧༺ ༻✦༺
//   Ceremonia del Adiós Eterno - Código de la Casa Waguri
// ༻✦༺ ༻✧༺ ༻✦༺ ༻⸙͎۪۫༺ ༻✦༺ ༻✧༺ ༻✦༺

import { jidDecode } from '@whiskeysockets/baileys'
import path from 'path'
import fs from 'fs'

const handler = async (m, { conn, command, usedPrefix }) => {
  try {
    const isSubBots = [conn.user.jid, ...global.owner.map(([number]) => `${number}@s.whatsapp.net`)].includes(m.sender)
    if (!isSubBots) return m.reply(`🌸 *Esta ceremonia solo puede ser realizada por los guardianes del jardín.*`)

    const rawId = conn.user?.id || ''
    const cleanId = jidDecode(rawId)?.user || rawId.split('@')[0]
    const index = global.conns?.findIndex(c => c.user.jid === m.sender)
    
    if (global.conn.user.jid === conn.user.jid)
      return conn.reply(m.chat, '👑 *Este ritual está prohibido en las sesiones principales del reino.*', m, rcanal)
    
    if (index === -1 || !global.conns[index])
      return conn.reply(m.chat, '💫 *La conexión con el mundo espiritual ya se ha disuelto o no se encuentra activa.*', m, rcanal)
    
    conn.reply(m.chat, '🍃 *Tu esencia se está desvaneciendo del mundo terrenal...*', m, rcanal)
    
    setTimeout(async () => {
      await global.conns[index].logout()
      global.conns.splice(index, 1)
      const sessionPath = path.join(global.jadi, cleanId)
      if (fs.existsSync(sessionPath)) {
        fs.rmSync(sessionPath, { recursive: true, force: true })
        console.log(`🌺 La esencia de ${cleanId} ha sido liberada de ${sessionPath}`)
      }
    }, 3000)
  } catch (error) {
    await m.react('✖️')
    conn.reply(m.chat, `🍂 *El ritual de desvanecimiento falló*\n\n${error.message || error}`, m, rcanal)
  }
}

handler.command = ['logout']
handler.help = ['logout']
handler.tags = ['socket']

export default handler

// ༻✦༺ ༻✧༺ ༻✦༺ ༻⸙͎۪۫༺ ༻✦༺ ༻✧༺ ༻✦༺
//   Que el adiós sea tan elegante como la llegada
// ༻✦༺ ༻✧༺ ༻✦༺ ༻⸙͎۪۫༺ ༻✦༺ ༻✧༺ ༻✦༺
