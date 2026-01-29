// By Rufino  - Comando para pagar/transferir dinero a otros usuarios
import db from '../lib/database.js'

let handler = async (m, { conn, usedPrefix, args }) => {
    let user = global.db.data.users[m.sender]
    
    // Verificar si se mencionó un usuario
    if (!m.mentionedJid || m.mentionedJid.length === 0) {
        return m.reply(`💸 *CÓMO USAR EL COMANDO PAY* 💸

📌 *Sintaxis:* ${usedPrefix}pay [@usuario] [cantidad]
📌 *Ejemplo:* ${usedPrefix}pay @usuario 500

📊 *Tu balance:*
💰 Efectivo: *${user.coin || 0} ${moneda}*
🏦 Banco: *${user.bank || 0} ${moneda}*
💎 Total: *${(user.coin || 0) + (user.bank || 0)} ${moneda}*

⚠️ *Nota:* Solo puedes pagar desde tu efectivo, no desde el banco.
   Para retirar del banco usa: ${usedPrefix}withdraw [cantidad]`)
    }
    
    let mentionedUser = m.mentionedJid[0]
    
    // Validaciones básicas
    if (mentionedUser === m.sender) {
        return m.reply('❌ No puedes pagarte a ti mismo.')
    }
    
    if (mentionedUser === conn.user.jid) {
        return m.reply('🤖 Yo soy un bot, no necesito dinero.')
    }
    
    // Verificar que el usuario mencionado exista en la base de datos
    if (!(mentionedUser in global.db.data.users)) {
        return m.reply('❌ El usuario mencionado no está registrado.')
    }
    
    // Obtener la cantidad a pagar
    if (!args[1] || isNaN(args[1])) {
        return m.reply(`❌ Debes especificar una cantidad válida.\nEjemplo: ${usedPrefix}pay @usuario 1000`)
    }
    
    let amount = parseInt(args[1])
    
    // Validar la cantidad
    if (amount <= 0) {
        return m.reply('❌ La cantidad debe ser mayor a 0.')
    }
    
    if (amount < 10) {
        return m.reply('❌ El monto mínimo para transferir es 10 ' + moneda)
    }
    
    // Verificar que el usuario tiene suficiente dinero
    if (!user.coin || user.coin < amount) {
        let falta = amount - (user.coin || 0)
        return m.reply(`❌ No tienes suficiente efectivo.
        
💰 Tienes: *${user.coin || 0} ${moneda}*
💸 Necesitas: *${amount} ${moneda}*
❌ Te faltan: *${falta} ${moneda}*

💡 *Consejos:*
1. Usa ${usedPrefix}work para ganar dinero
2. Usa ${usedPrefix}daily para tu recompensa diaria
3. Retira dinero del banco con ${usedPrefix}withdraw`)
    }
    
    // Aplicar comisión (opcional)
    let comision = 0
    let comisionPorcentaje = 0 // 0% de comisión, puedes cambiar a 1, 2, 5, etc.
    
    if (comisionPorcentaje > 0) {
        comision = Math.floor(amount * (comisionPorcentaje / 100))
        if (comision < 1) comision = 1
    }
    
    let amountFinal = amount - comision
    
    // Confirmar la transacción (opcional - para grandes cantidades)
    let requiereConfirmacion = amount > 10000
    
    if (requiereConfirmacion) {
        let mensajeConfirmacion = `⚠️ *CONFIRMAR TRANSACCIÓN* ⚠️

¿Estás seguro de transferir *${amount} ${moneda}* a @${mentionedUser.split('@')[0]}?

📊 *Detalles:*
• Monto: *${amount} ${moneda}*
• Comisión (${comisionPorcentaje}%): *${comision} ${moneda}*
• Receptor recibe: *${amountFinal} ${moneda}*
• Tu nuevo balance: *${user.coin - amount} ${moneda}*

Responde *"sí"* para confirmar o *"no"* para cancelar.`
        
        await conn.sendMessage(m.chat, {
            text: mensajeConfirmacion,
            mentions: [mentionedUser]
        }, { quoted: m })
        
        // Esperar confirmación
        let response
        try {
            response = await conn.ev.wait('messages.upsert', {
                timeout: 30000, // 30 segundos para responder
                filter: ({ messages }) => {
                    let msg = messages[0]
                    return msg.key.remoteJid === m.chat && 
                           msg.key.fromMe === false &&
                           msg.key.participant === m.sender &&
                           ['sí', 'si', 'yes', 'confirmar', 'confirm', 'no', 'cancelar', 'cancel'].includes(msg.message.conversation?.toLowerCase())
                }
            })
        } catch (error) {
            return m.reply('⏳ Tiempo de confirmación agotado. La transacción fue cancelada.')
        }
        
        let respuesta = response.messages[0].message.conversation.toLowerCase()
        
        if (!['sí', 'si', 'yes', 'confirmar', 'confirm'].includes(respuesta)) {
            return m.reply('❌ Transacción cancelada.')
        }
    }
    
    // Realizar la transferencia
    let senderName = await conn.getName(m.sender)
    let receiverName = await conn.getName(mentionedUser)
    
    // Restar del remitente
    user.coin -= amount
    
    // Registrar transacción (opcional)
    if (!user.transactions) user.transactions = []
    user.transactions.push({
        type: 'pago_enviado',
        amount: -amount,
        to: mentionedUser,
        timestamp: Date.now(),
        comision: comision
    })
    
    // Sumar al receptor
    let receiverUser = global.db.data.users[mentionedUser]
    receiverUser.coin = (receiverUser.coin || 0) + amountFinal
    
    if (!receiverUser.transactions) receiverUser.transactions = []
    receiverUser.transactions.push({
        type: 'pago_recibido',
        amount: amountFinal,
        from: m.sender,
        timestamp: Date.now()
    })
    
    // Mensaje de éxito
    let mensajeExito = `✅ *TRANSFERENCIA EXITOSA* ✅

💸 *De:* ${senderName}
👤 *Para:* ${receiverName}
💰 *Monto transferido:* ${amount} ${moneda}
${comision > 0 ? `📉 *Comisión (${comisionPorcentaje}%):* ${comision} ${moneda}\n🎯 *Monto recibido:* ${amountFinal} ${moneda}\n` : ''}
📊 *Tu nuevo balance:*
💰 Efectivo: *${user.coin} ${moneda}*
🏦 Banco: *${user.bank || 0} ${moneda}*
💎 Total: *${user.coin + (user.bank || 0)} ${moneda}*`
    
    // Enviar mensaje al remitente
    await conn.sendMessage(m.chat, {
        text: mensajeExito,
        mentions: [mentionedUser]
    }, { quoted: m })
    
    // Notificar al receptor (si está en otro chat)
    try {
        let mensajeReceptor = `🎉 *¡RECIBISTE UN PAGO!* 🎉

👤 *De:* ${senderName}
💰 *Monto:* ${amountFinal} ${moneda}
${comision > 0 ? `📝 *Nota:* Se aplicó comisión de ${comision} ${moneda}\n` : ''}
💵 *Tu nuevo balance:* ${receiverUser.coin} ${moneda}

💡 Usa ${usedPrefix}deposit para proteger tu dinero.`
        
        // Solo enviar si el receptor no está en el mismo chat o es diferente
        await conn.sendMessage(mentionedUser, { text: mensajeReceptor })
    } catch (error) {
        console.log('No se pudo notificar al receptor:', error)
    }
}

handler.help = ['pay', 'pagar', 'transferir']
handler.tags = ['economy', 'rpg']
handler.command = ['pay', 'pagar', 'transferir', 'transfer', 'send']
handler.group = true
handler.register = true

// Configuraciones adicionales
handler.premium = false // Si solo premium puede usar
handler.limit = false // Si quieres limitar el uso
handler.minCoin = 10 // Monto mínimo para transferir

export default handler

// Función para formatear números
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}