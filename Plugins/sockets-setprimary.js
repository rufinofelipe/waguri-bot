// ༻✦༺ ༻✧༺ ༻✦༺ ༻⸙͎۪۫༺ ༻✦༺ ༻✧༺ ༻✦༺
//   Coronación del Guardián Principal - Código de la Casa Waguri
// ༻✦༺ ༻✧༺ ༻✦༺ ༻⸙͎۪۫༺ ༻✦༺ ༻✧༺ ༻✦༺

import ws from 'ws'

const handler = async (m, { conn }) => {
  const subBots = [...new Set([...global.conns.filter((conn) => conn.user && conn.ws.socket && conn.ws.socket.readyState !== ws.CLOSED).map((conn) => conn.user.jid)])]
  if (global.conn?.user?.jid && !subBots.includes(global.conn.user.jid)) {
    subBots.push(global.conn.user.jid)
  }
  const chat = global.db.data.chats[m.chat]
  const mentionedJid = await m.mentionedJid
  const who = mentionedJid[0] ? mentionedJid[0] : m.quoted ? await m.quoted.sender : false
  if (!who) return conn.reply(m.chat, `🌸 *Menciona a la flor que deseas coronar como guardián principal del jardín.*`, m)
  if (!subBots.includes(who)) return conn.reply(m.chat, `🌿 *Esta esencia no está fusionada con el espíritu del jardín.*\n\nNo poseo la capacidad de designarla como guardián principal.`, m, rcanal)
  if (chat.primaryBot === who) {
    return conn.reply(m.chat, `👑 *@${who.split`@`[0]} ya es el guardián principal de este jardín.*`, m, { mentions: [who] });
  }
  try {
    chat.primaryBot = who
    conn.reply(m.chat, `🌺 *He coronado a @${who.split`@`[0]} como guardián principal.*\n\nAhora mi esencia fluirá únicamente a través de esta flor elegida.`, m, { mentions: [who] })
  } catch (e) {
    conn.reply(m.chat, `🍂 *El ritual de coronación ha fallado.*\n\nLa conexión con esta esencia se ha interrumpido.`, m, rcanal)
  }
}

handler.help = ['setprimary']
handler.tags = ['grupo']
handler.command = ['setprimary']
handler.group = true
handler.admin = true

export default handler

// ༻✦༺ ༻✧༺ ༻✦༺ ༻⸙͎۪۫༺ ༻✦༺ ༻✧༺ ༻✦༺
//   Que el guardián elegido proteja el jardín con sabiduría
// ༻✦༺ ༻✧༺ ༻✦༺ ༻⸙͎۪۫༺ ༻✦༺ ༻✧༺ ༻✦༺
