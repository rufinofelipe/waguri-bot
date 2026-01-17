// by Rufino 

import fs from 'fs'
import path from 'path'

const dbPath = path.join(process.cwd(), 'database.json')

let handler = async (m, { conn, usedPrefix, command }) => {
  let db = JSON.parse(fs.readFileSync(dbPath, 'utf-8') || '{}')
  if (!db.users) db.users = {}
  
  let user = db.users[m.sender]
  if (!user) {
    user = db.users[m.sender] = {
      wallet: 1000,
      bank: 0,
      lastDaily: 0,
      lastWork: 0,
      lastRob: 0
    }
  }

  user.wallet = Number(user.wallet) || 0
  user.bank   = Number(user.bank)   || 0

  const cooldown = 24 * 60 * 60 * 1000 // 24 horas
  const now = Date.now()

  if (user.lastDaily && now - user.lastDaily < cooldown) {
    let remaining = cooldown - (now - user.lastDaily)
    let hours = Math.floor(remaining / 3600000)
    let minutes = Math.floor((remaining % 3600000) / 60000)
    return conn.reply(m.chat, `🌸 Aún faltan ≈\( {hours}h \){minutes}min para reclamar tu daily. ¡Vuelve mañana! ✨`, m)
  }

  // Recompensa diaria: random entre 300 y 800 (puedes cambiarlo)
  let recompensa = Math.floor(Math.random() * (800 - 300 + 1)) + 300

  user.wallet += recompensa
  user.lastDaily = now

  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2))

  let txt = `🌸 *¡Tu recompensa diaria ha llegado!*

El universo te otorga **${recompensa} Waguri Coins** 🪙 directamente a tu cartera.

Saldo en mano ahora: **${user.wallet}** ✨

¡Sigue así, guerrero de las monedas! 🔥`

  conn.reply(m.chat, txt, m)
}

handler.help = ['daily']
handler.tags = ['economy']
handler.command = /^(daily|daili|dia|recompensa)$/i
handler.group = true
handler.register = true

export default handler