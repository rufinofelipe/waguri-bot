import fs from 'fs'
import path from 'path'

const dbPath = path.join(process.cwd(), 'database.json')

let handler = async (m, { conn, text, usedPrefix, command }) => {
  let db = JSON.parse(fs.readFileSync(dbPath, 'utf-8') || '{}')
  if (!db.users) db.users = {}
  
  let user = db.users[m.sender]
  if (!user) {
    user = db.users[m.sender] = {
      wallet: 0,
      bank: 0,
      lastDaily: 0,
      lastWork: 0,
      lastRob: 0
    }
  }

  user.wallet = Number(user.wallet) || 0
  user.bank   = Number(user.bank)   || 0

  if (!text) {
    return conn.reply(m.chat, `🌸 Usa: *\( {usedPrefix + command} <cantidad>*\nEjemplo: \){usedPrefix + command} 300`, m)
  }

  let cantidad = Number(text.trim())
  if (isNaN(cantidad) || cantidad <= 0) {
    return conn.reply(m.chat, `🌸 La cantidad debe ser un número positivo.`, m)
  }

  if (cantidad > user.bank) {
    return conn.reply(m.chat, `🌸 No tienes suficientes Waguri Coins en el banco.\nSolo tienes ${user.bank} guardados.`, m)
  }

  // Transferir del banco a la cartera
  user.bank -= cantidad
  user.wallet += cantidad

  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2))

  let txt = `🌸 *¡Retiro realizado con éxito!*

Sacaste **${cantidad} Waguri Coins** 🪙 del banco.

Ahora tienes:
En mano: **${user.wallet}**
En banco: **${user.bank}** ✨`

  conn.reply(m.chat, txt, m)
}

handler.help = ['retirar <cantidad>']
handler.tags = ['economy']
handler.command = /^(retirar|ret|withdraw)$/i
handler.group = true
handler.register = true

export default handler