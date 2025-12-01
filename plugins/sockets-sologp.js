// ༻✦༺ ༻✧༺ ༻✦༺ ༻⸙͎۪۫༺ ༻✦༺ ༻✧༺ ༻✦༺
//   Ritual del Jardín Exclusivo - Código de la Casa Waguri
// ༻✦༺ ༻✧༺ ༻✦༺ ༻⸙͎۪۫༺ ༻✦༺ ༻✧༺ ༻✦༺

const handler = async (m, { conn, command, usedPrefix, text }) => {
  try {
    const isSubBots = [conn.user.jid, ...global.owner.map(([number]) => `${number}@s.whatsapp.net`)].includes(m.sender)
    if (!isSubBots) return m.reply(`🌸 *Este ritual solo puede ser realizado por los guardianes del jardín.*`)

    const config = global.db.data.settings[conn.user.jid]
    const value = text ? text.trim().toLowerCase() : ''
    const type = 'gponly'
    const isEnable = config[type] || false
    const enable = value === 'enable' || value === 'on'
    const disable = value === 'disable' || value === 'off'
    if (enable || disable) {
      if (isEnable === enable)
        return m.reply(`🌿 *El jardín exclusivo ya estaba ${enable ? 'activado' : 'desactivado'}.*`)
      config[type] = enable
      return conn.reply(m.chat, `🌺 *Has ${enable ? 'activado' : 'desactivado'} el jardín exclusivo* para esta esencia.\n\n${enable ? 'Ahora solo floreceré en jardines grupales.' : 'Mi esencia fluirá libremente por todos los caminos.'}`)
    }
    conn.reply(m.chat, `✨ Puedes activar o desactivar el *${command}* utilizando:\n\n🌷 *${command}* enable\n🌷 *${command}* disable\n\n🎋 Estado actual » *${isEnable ? '✓ Activado' : '✗ Desactivado'}*`, m, rcanal)
  } catch (error) {
    await m.react('✖️')
    conn.reply(m.chat, `🍂 *El ritual del jardín exclusivo ha fallado*\n\n${error.message || error}`, m, rcanal)
  }
}

handler.command = ['sologp']
handler.help = ['sologp']
handler.tags = ['socket']

export default handler

// ༻✦༺ ༻✧༺ ༻✦༺ ༻⸙͎۪۫༺ ༻✦༺ ༻✧༺ ༻✦༺
//   Que tu jardín sea un santuario de pureza
// ༻✦༺ ༻✧༺ ༻✦༺ ༻⸙͎۪۫༺ ༻✦༺ ༻✧༺ ༻✦༺
