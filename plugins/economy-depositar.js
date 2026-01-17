import fs from 'fs'
import path from 'path'

const dbPath = path.join(process.cwd(), 'database.json')

let handler = async (m, { conn, text, usedPrefix, command }) => {
  let db
  try {
    db = JSON.parse(fs.readFileSync(dbPath, 'utf-8') || '{}')
  } catch (e) {
    return conn.reply(m.chat, 'Error al leer la base de datos. Contacta al dueño.', m)
  }

  if (!db.users) db.users = {}
  
  let userId = m.sender
  let user = db.users[userId]
  if (!user) {
    user = db.users[userId] = {
      wallet: 0,
      bank: 0,
      lastDaily: 0,
      lastWork: 0,
      lastRob: 0
    }
  }

  user.wallet = Number(user.wallet) || 0
  user.bank   = Number(user.bank)   || 0

  // Mensaje de debug (puedes comentarlo después)
  let debug = `Debug:\nTu ID: \( {userId}\nWallet actual: \){user.wallet}\nBank actual: ${user.bank}`

  if (!text) {
    return conn.reply(m.chat, `\( {debug}\n\nUsa: * \){usedPrefix + command} <cantidad>*\nEj: ${usedPrefix + command} 500`, m)
  }

  let cantidad = Number(text.trim())
  if (isNaN(cantidad) || cantidad <= 0) {
    return conn.reply(m.chat, `${debug}\n\nCantidad inválida. Debe ser un número positivo.`, m)
  }

  if (cantidad > user.wallet) {
    return conn.reply(m.chat, `\( {debug}\n\nNo tienes suficientes. Solo tienes \){user.wallet} en mano.`, m)
  }

  user.wallet -= cantidad
  user.bank += cantidad

  try {
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2))
  } catch (e) {
    return conn.reply(m.chat, 'Error al guardar la base de datos.', m)
  }

  let txt = `🌸 *Depósito exitoso!*

Depositaste **${cantidad} Waguri Coins** al banco.

Ahora tienes:
En mano: **${user.wallet}**
En banco: **${user.bank}** ✨`

  conn.reply(m.chat, txt, m)
}

handler.help = ['depositar <cantidad>']
handler.tags = ['economy']
handler.command = /^(depositar|dep|deposit)$/i
handler.group = true
handler.register = true

export default handler