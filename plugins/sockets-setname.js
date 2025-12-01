// ༻✦༺ ༻✧༺ ༻✦༺ ༻⸙͎۪۫༺ ༻✦༺ ༻✧༺ ༻✦༺
//   Ritual del Nombre Ancestral - Código de la Casa Waguri
// ༻✦༺ ༻✧༺ ༻✦༺ ༻⸙͎۪۫༺ ༻✦༺ ༻✧༺ ༻✦༺

import fs from 'fs'
import path from 'path'

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`🌸 *El ritual del nombre está incompleto.*\n\nPara renombrar tu esencia:\n\n🌺 ${usedPrefix + command} *<nuevo_nombre>*`)

  const senderNumber = m.sender.replace(/[^0-9]/g, '')
  const botPath = path.join('./JadiBots', senderNumber)
  const configPath = path.join(botPath, 'config.json')

  if (!fs.existsSync(botPath)) {
    return m.reply('🌿 *Este ritual solo puede ser realizado por el dueño de la esencia.*')
  }

  let config = {}

  if (fs.existsSync(configPath)) {
    try {
      config = JSON.parse(fs.readFileSync(configPath))
    } catch (e) {
      return m.reply('🍂 *Error al leer los pergaminos del nombre ancestral.*')
    }
  }

  config.name = text.trim()

  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
    m.reply(`🌺 *Tu esencia ha sido renombrada!*\n\nAhora serás conocido como *${text.trim()}* en este mundo mágico.`)
  } catch (err) {
    console.error(err)
    m.reply('🍃 *El ritual ha fallado.*\n\nEl nombre ancestral no pudo ser grabado en los pergaminos.')
  }
}

handler.help = ['setname']
handler.tags = ['serbot']
handler.command = /^setname$/i
handler.owner = false // solo el dueño puede usar esto

export default handler

// ༻✦༺ ༻✧༺ ༻✦༺ ༻⸙͎۪۫༺ ༻✦༺ ༻✧༺ ༻✦༺
//   Que tu nuevo nombre refleje la esencia de tu ser
// ༻✦༺ ༻✧༺ ༻✦༺ ༻⸙͎۪۫༺ ༻✦༺ ༻✧༺ ༻✦༺
