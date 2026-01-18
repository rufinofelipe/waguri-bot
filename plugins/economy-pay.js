import db from '../lib/database.js'

let handler = async (m, { conn, text, usedPrefix }) => {
    let who
    if (m.mentionedJid.length) who = m.mentionedJid[0]
    else if (m.quoted) who = m.quoted.sender
    else if (text) who = text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
    else return conn.reply(m.chat, `🌸 Usa: *${usedPrefix}pay @tag* <cantidad>\nO responde a un mensaje con la cantidad.`, m)

    if (who == conn.user.jid) return conn.reply(m.chat, `No puedes pagarme a mí mismo 😏`, m)
    if (who == m.sender) return conn.reply(m.chat, `No puedes pagarte a ti mismo, loco 😂`, m)

    if (!(who in db.data.users)) return conn.reply(m.chat, `El usuario no está registrado en la base de datos.`, m)

    let amount = text.match(/\d+/)?.[0]
    if (!amount) return conn.reply(m.chat, `🌸 Debes especificar una cantidad numérica.\nEjemplo: ${usedPrefix}pay @tag 500`, m)

    amount = Number(amount)
    if (isNaN(amount) || amount <= 0) return conn.reply(m.chat, `La cantidad debe ser un número positivo.`, m)

    let sender = db.data.users[m.sender]
    let receiver = db.data.users[who]

    if ((sender.coin || 0) < amount) {
        return conn.reply(m.chat, `No tienes suficientes Waguri Coins.\nTienes solo ${sender.coin || 0} coin.`, m)
    }

    sender.coin -= amount
    receiver.coin = (receiver.coin || 0) + amount

    // Guardar cambios
    db.write()

    let txt = `🌸 *¡Transferencia exitosa!*

Pagaste **\( {amount} Waguri Coins** 🪙 a \){conn.getName(who)}

Tu nuevo saldo en mano: **${sender.coin}**
Saldo de \( {conn.getName(who)} en mano: ** \){receiver.coin}** ✨`

    await conn.reply(m.chat, txt, m)
}

handler.help = ['pay @tag <cantidad>']
handler.tags = ['economy', 'rpg']
handler.command = /^(pay|pagar|enviar|transferir)$/i
handler.group = true
handler.register = true

export default handler