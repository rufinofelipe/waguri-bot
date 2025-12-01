// ༻✦༺ ༻✧༺ ༻✦༺ ༻⸙͎۪۫༺ ༻✦༺ ༻✧༺ ༻✦༺
//   Ritual de Partida Elegante - Código de la Casa Waguri
// ༻✦༺ ༻✧༺ ༻✦༺ ༻⸙͎۪۫༺ ༻✦༺ ༻✧༺ ༻✦༺

const handler = async (m, { conn, command, usedPrefix, text }) => {
  try {
    const isSubBots = [conn.user.jid, ...global.owner.map(([number]) => `${number}@s.whatsapp.net`)].includes(m.sender)
    if (!isSubBots) return m.reply(`🌸 *Este ritual solo puede ser realizado por los guardianes del jardín.*`)

    await m.react('🕒')
    const id = text || m.chat
    const chat = global.db.data.chats[m.chat]
    chat.welcome = false
    await conn.reply(id, `🌺 *La flor más brillante del jardín se despide*\n\nQue la magia los acompañe siempre...`)
    await conn.groupLeave(id)
    chat.welcome = true
    await m.react('✔️')
  } catch (error) {
    await m.react('✖️')
    conn.reply(m.chat, `🍂 *El ritual de partida falló*\n\n${error.message || error}`, m, rcanal)
  }
}

handler.command = ['leave']
handler.help = ['leave']
handler.tags = ['socket']

export default handler

// ༻✦༺ ༻✧༺ ༻✦༺ ༻⸙͎۪۫༺ ༻✦༺ ༻✧༺ ༻✦༺
//   Que cada partida sea con gracia y elegancia
// ༻✦༺ ༻✧༺ ༻✦༺ ༻⸙͎۪۫༺ ༻✦༺ ༻✧༺ ༻✦༺
