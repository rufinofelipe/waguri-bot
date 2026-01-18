// eliminarsub.js - Comando para eliminar sub-bots (solo owner)

let handler = async (m, { conn, text, usedPrefix, command, isOwner, participants }) => {
  // Verificar si es el owner
  if (!isOwner) {
    return m.reply('❌ *ACCESO DENEGADO*\n\nSolo el owner del bot puede usar este comando.')
  }

  // Mostrar ayuda si no hay argumentos
  if (!text) {
    const helpMessage = 
      `🤖 *GESTIÓN DE SUB-BOTS*\n\n` +
      `📌 *Uso:*\n` +
      `• ${usedPrefix}${command} listar - Ver lista de sub-bots\n` +
      `• ${usedPrefix}${command} todos - Eliminar TODOS los sub-bots\n` +
      `• ${usedPrefix}${command} @tag/número - Confirmar eliminación de un sub-bot\n\n` +
      `💡 *Nota:* Para eliminar, debes confirmar enviando *"sí"* en un mensaje aparte.`

    return m.reply(helpMessage)
  }

  // Listar sub-bots
  if (text.toLowerCase() === 'listar') {
    try {
      const allParticipants = participants || (await conn.groupMetadata(m.chat)).participants
      
      // Filtrar bots
      const botPatterns = [
        /^\d+@s\.whatsapp\.net$/,
        /^bot/i,
        /^subbot/i,
        /-\s?bot$/i
      ]

      const subBots = allParticipants.filter(participant => {
        if (participant.id === conn.user.id) return false
        const phone = participant.id.split('@')[0]
        const name = participant.name || participant.notify || ''
        return botPatterns.some(pattern => 
          pattern.test(phone) || pattern.test(name)
        )
      })

      if (subBots.length === 0) {
        return m.reply('🤖 *NO HAY SUB-BOTS*\n\nNo se encontraron sub-bots en este grupo.')
      }

      let listMessage = `🤖 *LISTA DE SUB-BOTS*\n\n`
      listMessage += `📊 Total: ${subBots.length}\n\n`

      subBots.forEach((bot, index) => {
        const phone = bot.id.split('@')[0]
        const name = bot.name || bot.notify || 'Sin nombre'
        listMessage += `${index + 1}. *${name}*\n`
        listMessage += `   📱 ${phone}\n`
        listMessage += `   🔧 Usa: ${usedPrefix}${command} ${phone}\n\n`
      })

      await m.reply(listMessage)
    } catch (error) {
      await m.reply('❌ Error al listar sub-bots.')
    }
    return
  }

  // Eliminar todos los sub-bots
  if (text.toLowerCase() === 'todos') {
    try {
      const allParticipants = participants || (await conn.groupMetadata(m.chat)).participants
      
      const botPatterns = [
        /^\d+@s\.whatsapp\.net$/,
        /^bot/i,
        /^subbot/i,
        /-\s?bot$/i
      ]

      const subBots = allParticipants.filter(participant => {
        if (participant.id === conn.user.id) return false
        const phone = participant.id.split('@')[0]
        const name = participant.name || participant.notify || ''
        return botPatterns.some(pattern => 
          pattern.test(phone) || pattern.test(name)
        )
      })

      if (subBots.length === 0) {
        return m.reply('🤖 *NO HAY SUB-BOTS*\n\nNo se encontraron sub-bots para eliminar.')
      }

      // Pedir confirmación por mensaje separado
      await m.reply(
        `⚠️ *CONFIRMAR ELIMINACIÓN*\n\n` +
        `¿Estás seguro de eliminar *${subBots.length}* sub-bots?\n\n` +
        `📌 Envía un mensaje con *"sí"* para confirmar.\n` +
        `📌 Envía *"no"* o ignora para cancelar.\n\n` +
        `⏰ Tienes 30 segundos para responder.`
      )

      // Esperar mensaje de confirmación
      const confirm = await conn.waitForMessage(
        m.chat,
        msg => msg.sender === m.sender && 
               (msg.text?.toLowerCase() === 'sí' || msg.text?.toLowerCase() === 'no'),
        { timeout: 30000 }
      )

      if (!confirm || confirm.text.toLowerCase() !== 'sí') {
        return m.reply('❌ *OPERACIÓN CANCELADA*\n\nNo se confirmó la eliminación.')
      }

      // Eliminar sub-bots
      let successCount = 0
      let failCount = 0
      
      for (const bot of subBots) {
        try {
          await conn.groupParticipantsUpdate(m.chat, [bot.id], 'remove')
          successCount++
          await new Promise(resolve => setTimeout(resolve, 1000))
        } catch (error) {
          failCount++
        }
      }

      await m.reply(
        `📊 *RESUMEN DE ELIMINACIÓN*\n\n` +
        `✅ Eliminados: ${successCount}\n` +
        `❌ Fallados: ${failCount}\n` +
        `🤖 Total procesados: ${subBots.length}`
      )

    } catch (error) {
      await m.reply('❌ Error al eliminar sub-bots: ' + error.message)
    }
    return
  }

  // Eliminar sub-bot específico
  try {
    // Obtener JID del objetivo
    let targetJid = ''
    
    if (text.includes('@')) {
      targetJid = text.includes('@s.whatsapp.net') ? text : `${text}@s.whatsapp.net`
    } else if (m.quoted) {
      targetJid = m.quoted.sender
    } else if (m.mentionedJid && m.mentionedJid.length > 0) {
      targetJid = m.mentionedJid[0]
    } else {
      const phoneNumber = text.replace(/[^0-9]/g, '')
      if (phoneNumber.length >= 10) {
        targetJid = `${phoneNumber}@s.whatsapp.net`
      } else {
        return m.reply(
          `❌ *FORMATO INVÁLIDO*\n\n` +
          `Usa:\n• ${usedPrefix}${command} @mención\n` +
          `• ${usedPrefix}${command} 521234567890\n` +
          `• ${usedPrefix}${command} (responde a un mensaje)`
        )
      }
    }

    // Verificar que no sea el bot principal
    if (targetJid === conn.user.id) {
      return m.reply('❌ No puedes eliminar el bot principal.')
    }

    // Verificar que esté en el grupo
    const allParticipants = participants || (await conn.groupMetadata(m.chat)).participants
    const targetUser = allParticipants.find(p => p.id === targetJid)

    if (!targetUser) {
      return m.reply('❌ El usuario no está en este grupo.')
    }

    const phone = targetJid.split('@')[0]
    const name = targetUser.name || targetUser.notify || 'Sin nombre'

    // Pedir confirmación por mensaje separado
    await m.reply(
      `⚠️ *CONFIRMAR ELIMINACIÓN*\n\n` +
      `¿Eliminar a *${name}* (${phone}) como sub-bot?\n\n` +
      `📌 Envía un mensaje con *"sí"* para confirmar.\n` +
      `📌 Envía *"no"* o ignora para cancelar.\n\n` +
      `⏰ Tienes 30 segundos para responder.`
    )

    // Esperar mensaje de confirmación
    const confirm = await conn.waitForMessage(
      m.chat,
      msg => msg.sender === m.sender && 
             (msg.text?.toLowerCase() === 'sí' || msg.text?.toLowerCase() === 'no'),
      { timeout: 30000 }
    )

    if (!confirm || confirm.text.toLowerCase() !== 'sí') {
      return m.reply('❌ *OPERACIÓN CANCELADA*\n\nNo se confirmó la eliminación.')
    }

    // Eliminar el sub-bot
    await conn.groupParticipantsUpdate(m.chat, [targetJid], 'remove')

    await m.reply(
      `✅ *SUB-BOT ELIMINADO*\n\n` +
      `🤖 *Nombre:* ${name}\n` +
      `📱 *Número:* ${phone}\n` +
      `📍 Eliminado del grupo exitosamente.`
    )

  } catch (error) {
    let errorMessage = '❌ Error: '
    if (error.message.includes('not authorized')) {
      errorMessage += 'No tienes permisos de admin.'
    } else if (error.message.includes('401')) {
      errorMessage += 'Usuario no encontrado.'
    } else {
      errorMessage += error.message
    }
    await m.reply(errorMessage)
  }
}

// Función para esperar mensajes (si no existe)
if (!conn.waitForMessage) {
  conn.waitForMessage = (chatId, filter, options = {}) => {
    return new Promise((resolve) => {
      const timeout = options.timeout || 30000
      const timeoutId = setTimeout(() => {
        conn.ev.off('messages.upsert', listener)
        resolve(null)
      }, timeout)

      const listener = async (m) => {
        const message = m.messages?.[0]
        if (!message) return
        if (message.key?.remoteJid !== chatId) return
        if (filter(message)) {
          clearTimeout(timeoutId)
          conn.ev.off('messages.upsert', listener)
          resolve(message)
        }
      }

      conn.ev.on('messages.upsert', listener)
    })
  }
}

handler.help = ['eliminarsub [listar/@tag/número/todos]']
handler.tags = ['owner', 'group']
handler.command = /^(eliminarsub|removesub|kickbot|quitarsub)$/i
handler.group = true
handler.botAdmin = true
handler.admin = true
handler.owner = true

export default handler