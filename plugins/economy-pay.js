// By Rufino 

import db from '../lib/database.js'

let handler = async (m, { conn, text, usedPrefix }) => {
    let who
    if (m.mentionedJid[0]) who = m.mentionedJid[0]
    else if (m.quoted) who = m.quoted.sender
    else return conn.reply(m.chat, `🌸 Usa: *${usedPrefix}pay @tag* <cantidad>\nO responde a un mensaje con la cantidad.`, m)

    if (who == conn.user.jid) return conn.reply(m.chat, `No puedes pagarme a mí mismo 💢`, m)
    if (who == m.sender) return conn.reply(m.chat, `No puedes pagarte a ti mismo,  💢`, m)

    if (!(who in global.db.data.users)) return conn.reply(m.chat, `El usuario no se encuentra en la base de datos.`, m)

    let amount = text.match(/\d+/)?.[0]
    if (!amount) return conn.reply(m.chat, `Debes especificar una cantidad numérica.\nEjemplo: ${usedPrefix}pay @tag 500`, m)

    amount = Number(amount)
    if (isNaN(amount) || amount <= 0) return conn.reply(m.chat, `La cantidad debe ser un número positivo.`, m)

    let sender = global.db.data.users[m.sender]
    let receiver = global.db.data.users[who]

    if ((sender.coin || 0) < amount) {
        return conn.reply(m.chat, `No tienes suficientes \( {moneda}.\nTienes solo \){sender.coin || 0} ${moneda}.`, m)
    }

    sender.coin -= amount
    receiver.coin = (receiver.coin || 0) + amount

    // Guardar cambios (asumiendo que tu db tiene método write o se guarda en otro lugar)
    // Si usas db.write(), agrégalo aquí:
    // db.write()

    let txt = `🌸 *¡Transferencia exitosa!*

Pagaste **\( {amount} \){moneda}** a ${conn.getName(who)}

Tu nuevo saldo en mano: **\( {sender.coin} \){moneda}**
Saldo de \( {conn.getName(who)} en mano: ** \){receiver.coin} ${moneda}** ✨`

    await conn.reply(m.chat, txt, m, { mentions: [who] })
}

handler.help = ['pay @tag <cantidad>']
handler.tags = ['economy', 'rpg']
handler.command = /^(pay|pagar|enviar|transferir)$/i
handler.group = true
handler.register = true

export default handler