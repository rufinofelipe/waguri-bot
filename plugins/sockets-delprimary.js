// ༻✦༺ ༻✧༺ ༻✦༺ ༻⸙͎۪۫༺ ༻✦༺ ༻✧༺ ༻✦༺
//   Liberación del Guardián Principal - Código de la Casa Waguri
// ༻✦༺ ༻✧༺ ༻✦༺ ༻⸙͎۪۫༺ ༻✦༺ ༻✧༺ ༻✦༺

import ws from 'ws'

const handler = async (m, { conn, usedPrefix }) => {
  const chat = global.db.data.chats[m.chat]

  if (!chat.primaryBot) {
    return conn.reply(m.chat, `🌸 *Este jardín no tiene un guardián principal designado.*\n\nTodas las flores pueden brillar con igual intensidad.`, m, rcanal)
  }

  try {
    const oldPrimary = chat.primaryBot
    chat.primaryBot = null

    conn.reply(
      m.chat, 
      `🌺 *El guardián @${oldPrimary.split`@`[0]} ha sido liberado de sus deberes.*\n\nAhora todas las flores del jardín pueden desplegar su magia con libertad y armonía.`, 
      m, 
      { mentions: [oldPrimary] }
    )
  } catch (e) {
    conn.reply(
      m.chat, 
      `🍃 *No pude completar el ritual de liberación.*\n\nEl destino parece resistirse a este cambio momentáneamente.`, 
      m
    )
  }
}

handler.help = ['delprimary']
handler.tags = ['grupo']
handler.command = ['delprimary']
handler.admin = true  

export default handler

// ༻✦༺ ༻✧༺ ༻✦༺ ༻⸙͎۪۫༺ ༻✦༺ ༻✧༺ ༻✦༺
//   Que el equilibrio regrese al jardín
// ༻✦༺ ༻✧༺ ༻✦༺ ༻⸙͎۪۫༺ ༻✦༺ ༻✧༺ ༻✦༺
