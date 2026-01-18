// eliminarsub.js - Comando mejorado para detectar sub-bots

let handler = async (m, { conn, text, usedPrefix, command, isOwner, participants }) => {
  if (!isOwner) {
    return m.reply('❌ *ACCESO DENEGADO*\n\nSolo el owner del bot puede usar este comando.')
  }

  if (!text) {
    const helpMessage = 
      `🤖 *GESTIÓN DE SUB-BOTS*\n\n` +
      `📌 *Uso:*\n` +
      `• ${usedPrefix}${command} listar - Ver lista de sub-bots\n` +
      `• ${usedPrefix}${command} todos - Eliminar TODOS los sub-bots\n` +
      `• ${usedPrefix}${command} @tag/número - Eliminar un sub-bot\n\n` +
      `💡 *Nota:* Para eliminar, debes confirmar enviando *"sí"* en un mensaje aparte.`

    return m.reply(helpMessage)
  }

  // Función mejorada para detectar sub-bots
  const esSubBot = (participant) => {
    if (participant.id === conn.user.id) return false // No es el bot principal
    
    const phone = participant.id.split('@')[0]
    const name = (participant.name || participant.notify || '').toLowerCase()
    
    // Patrones más flexibles para detectar sub-bots
    const patrones = [
      // Patrones en el nombre
      /bot/i,
      /sub/i,
      /clone/i,
      /copy/i,
      /spawn/i,
      /sock/i,
      /md/i,
      /baileys/i,
      /multi/i,
      /device/i,
      /session/i,
      /terminal/i,
      
      // Patrones en el número (comunes en bots)
      /^\d{10,}$/, // Números muy largos
      /^1/, // Comienza con 1
      /^0/, // Comienza con 0
      /^\d+$/, // Solo números
      
      // Números específicos de país para bots
      /^55/, // Brasil
      /^91/, // India
      /^62/, // Indonesia
      /^1\d{10}$/, // EEUU/Canadá
    ]
    
    // Verificar si el nombre o número coincide con algún patrón
    const esBotPorNombre = patrones.some(patron => patron.test(name))
    const esBotPorNumero = patrones.some(patron => patron.test(phone))
    
    // También verificar si tiene nombre muy genérico o vacío
    const nombreGenerico = !name || name === '' || name === 'null' || name === 'undefined' || 
                          name === 'user' || name === 'user' || name.length < 3
    
    return esBotPorNombre || esBotPorNumero || nombreGenerico
  }

  // Listar sub-bots
  if (text.toLowerCase() === 'listar') {
    try {
      const allParticipants = participants || (await conn.groupMetadata(m.chat)).participants
      
      // Filtrar usando la función mejorada
      const subBots = allParticipants.filter(esSubBot)

      if (subBots.length === 0) {
        // Mostrar TODOS los participantes para debug
        let debugMessage = `🔍 *DEBUG - TODOS LOS PARTICIPANTES*\n\n`
        debugMessage += `📊 Total: ${allParticipants.length}\n\n`
        
        allParticipants.forEach((participant, index) => {
          if (participant.id === conn.user.id) return
          const phone = participant.id.split('@')[0]
          const name = participant.name || participant.notify || 'Sin nombre'
          debugMessage += `${index + 1}. *${name}*\n`
          debugMessage += `   📱 ${phone}\n`
          debugMessage += `   👤 ${participant.admin ? '👑 Admin' : 'Miembro'}\n\n`
        })
        
        debugMessage += `\n💡 *Si ves sub-bots aquí, ajusta los patrones en el código.*`
        
        return m.reply(debugMessage)
      }

      let listMessage = `🤖 *LISTA DE SUB-BOTS DETECTADOS*\n\n`
      listMessage += `📊 Total: ${subBots.length}\n\n`

      subBots.forEach((bot, index) => {
        const phone = bot.id.split('@')[0]
        const name = bot.name || bot.notify || 'Sin nombre'
        listMessage += `${index + 1}. *${name}*\n`
        listMessage += `   📱 ${phone}\n`
        listMessage += `   👤 ${bot.admin ? '👑 Admin' : 'Miembro'}\n`
        listMessage += `   🔧 Eliminar: ${usedPrefix}${command} ${phone}\n\n`
      })

      await m.reply(listMessage)
    } catch (error) {
      await m.reply('❌ Error al listar: ' + error.message)
    }
    return
  }

  // Eliminar todos los sub-bots
  if (text.toLowerCase() === 'todos') {
    try {
      const allParticipants = participants || (await conn.groupMetadata(m.chat)).participants
      const subBots = allParticipants.filter(esSubBot)

      if (subBots.length === 0) {
        return m.reply('🤖 *NO SE DETECTARON SUB-BOTS*\n\nUsa *.eliminarsub listar* para ver todos los participantes.')
      }

      // Mostrar qué se va a eliminar
      let previewMessage = `⚠️ *SE ELIMINARÁN ${subBots.length} SUB-BOTS:*\n\n`
      subBots.slice(0, 10).forEach((bot, index) => {
        const phone = bot.id.split('@')[0]
        const name = bot.name || bot.notify || 'Sin nombre'
        previewMessage += `${index + 1}. ${name} (${phone})\n`
      })
      if (subBots.length > 10) previewMessage += `\n... y ${subBots.length - 10} más`
      
      previewMessage += `\n\n📌 *Envía "sí" para confirmar la eliminación.*`

      await m.reply(previewMessage)

      // Esperar confirmación
      const confirm = await conn.waitForMessage(
        m.chat,
        msg => msg.sender === m.sender && msg.text?.toLowerCase() === 'sí',
        { timeout: 30000 }
      )

      if (!confirm) {
        return m.reply('❌ *CANCELADO*\n\nNo se recibió confirmación.')
      }

      // Eliminar
      let successCount = 0
      let failCount = 0
      
      for (const bot of subBots) {
        try {
          await conn.groupParticipantsUpdate(m.chat, [bot.id], 'remove')
          successCount++
          await new Promise(resolve => setTimeout(resolve, 500)) // Pausa
        } catch (error) {
          failCount++
        }
      }

      await m.reply(
        `✅ *ELIMINACIÓN COMPLETADA*\n\n` +
        `✅ Exitosos: ${successCount}\n` +
        `❌ Fallidos: ${failCount}\n` +
        `🤖 Total: ${subBots.length}`
      )

    } catch (error) {
      await m.reply('❌ Error: ' + error.message)
    }
    return
  }

  // Eliminar sub-bot específico (modo manual - sin detección automática)
  try {
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
        return m.reply(`❌ Formato inválido. Usa: ${usedPrefix}${command} @tag o número`)
      }
    }

    if (targetJid === conn.user.id) {
      return m.reply('❌ No puedes eliminar el bot principal.')
    }

    const allParticipants = participants || (await conn.groupMetadata(m.chat)).participants
    const targetUser = allParticipants.find(p => p.id === targetJid)

    if (!targetUser) {
      return m.reply('❌ Usuario no encontrado en el grupo.')
    }

    const phone = targetJid.split('@')[0]
    const name = targetUser.name || targetUser.notify || 'Sin nombre'

    // Pedir confirmación
    await m.reply(
      `⚠️ *¿ELIMINAR A ESTE USUARIO?*\n\n` +
      `📛 *Nombre:* ${name}\n` +
      `📱 *Número:* ${phone}\n` +
      `👤 *Rol:* ${targetUser.admin ? '👑 Admin' : 'Miembro'}\n\n` +
      `📌 *Envía "sí" para confirmar la eliminación.*`
    )

    const confirm = await conn.waitForMessage(
      m.chat,
      msg => msg.sender === m.sender && msg.text?.toLowerCase() === 'sí',
      { timeout: 30000 }
    )

    if (!confirm) {
      return m.reply('❌ *CANCELADO*')
    }

    await conn.groupParticipantsUpdate(m.chat, [targetJid], 'remove')
    
    await m.reply(`✅ *ELIMINADO*\n\n${name} (${phone}) ha sido eliminado del grupo.`)

  } catch (error) {
    await m.reply('❌ Error: ' + error.message)
  }
}

// Configuración del handler
handler.help = ['eliminarsub [listar/todos/@tag]']
handler.tags = ['owner', 'group']
handler.command = /^(eliminarsub|removesub|kickbot|quitarsub)$/i
handler.group = true
handler.botAdmin = true
handler.admin = true
handler.owner = true

export default handler