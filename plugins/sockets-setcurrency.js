// ༻✦༺ ༻✧༺ ༻✦༺ ༻⸙͎۪۫༺ ༻✦༺ ༻✧༺ ༻✦༺
//   Ritual de la Moneda Ancestral - Código de la Casa Waguri
// ༻✦༺ ༻✧༺ ༻✦༺ ༻⸙͎۪۫༺ ༻✦༺ ༻✧༺ ༻✦༺

import fs from 'fs'
import path from 'path'

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`🌸 *Formato del ritual incompleto.*\n\nPara cambiar la moneda ancestral:\n\n🌺 ${usedPrefix + command} *<nuevo_nombre_moneda>*`)

  const senderNumber = m.sender.replace(/[^0-9]/g, '')
  const botPath = path.join('./JadiBots', senderNumber)
  const configPath = path.join(botPath, 'config.json')

  // Verifica que la esencia del bot exista (solo el dueño de esa esencia puede modificarla)
  if (!fs.existsSync(botPath)) {
    return m.reply('🌿 *Este ritual solo puede ser realizado por el dueño de la esencia.*')
  }

  let config = {}

  if (fs.existsSync(configPath)) {
    try {
      config = JSON.parse(fs.readFileSync(configPath))
    } catch (e) {
      return m.reply('🍂 *Error al leer los pergaminos de configuración.*')
    }
  }

  config.currency = text.trim()

  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
    m.reply(`🌺 *La moneda ancestral ha sido actualizada!*\n\nAhora fluirás con la energía de *${text.trim()}*`)
  } catch (err) {
    console.error(err)
    m.reply('*🍃 El ritual ha fallado.*\n\nLa moneda ancestral no pudo ser consagrada en los pergaminos.')
  }
}

handler.help = ['setcurrency']
handler.tags = ['sockets']
handler.command = ['setcurrency', 'setmoneda']
handler.owner = true // solo el dueño de la esencia puede usar esto

export default handler

// ༻✦༺ ༻✧༺ ༻✦༺ ༻⸙͎۪۫༺ ༻✦༺ ༻✧༺ ༻✦༺
//   Que tu moneda fluya con la energía del universo
// ༻✦༺ ༻✧༺ ༻✦༺ ༻⸙͎۪۫༺ ༻✦༺ ༻✧༺ ༻✦༺
