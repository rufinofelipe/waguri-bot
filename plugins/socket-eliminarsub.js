// eliminarsub.js - Versión corregida con mejor manejo de confirmaciones

let handler = async (m, { conn, text, usedPrefix, command, isOwner, participants }) => {
  if (!isOwner) {
    return m.reply('❌ *ACCESO DENEGADO*\n\nSolo el owner del bot puede usar este comando.')
  }

  if (!text) {
    const helpMessage = 
      `🤖 *GESTIÓN DE SUB-BOTS*\n\n` +
      `📌 *Uso:*\n` +
      `• ${usedPrefix}${command} listar - Ver lista de participantes\n` +
      `• ${usedPrefix}${command} @tag/número - Eliminar un usuario\n` +
      `• ${usedPrefix}${command} todos - Eliminar múltiples usuarios\n\n` +
      `💡 *Nota:* Para eliminar, debes confirmar enviando *"sí"* en un mensaje aparte.`

    return m.reply(helpMessage)
  }

  // Función para esperar respuesta (CORREGIDA)
  const esperarRespuesta = async (mensajePregunta, tiempoLimite = 30000) => {
    // Enviar la pregunta
    await m.reply(mensajePregunta)
    
    return new Promise((resolve) => {
      let respondido = false
      const timeout = setTimeout(() => {
        if (!respondido) {
          conn.ev.off('messages.upsert', listener)
          resolve(null)
        }
      }, tiempoLimite)

      const listener = async (update) => {
        const msg = update.messages?.[0]
        if (!msg) return
        if (msg.key?.remoteJid !== m.chat) return
        if (msg.key?.participant && msg.key.participant !== m.sender) return
        if (!msg.key?.participant && msg.key?.fromMe) return
        
        const texto = msg.text?.toLowerCase()?.trim()
        
        if (texto === 'sí' || texto === 'si' || texto === 'yes' || texto === 'confirmar') {
          clearTimeout(timeout)
          respondido = true
          conn.ev.off('messages.upsert', listener)
          resolve(true)
        } else if (texto === 'no' || texto === 'cancelar') {
          clearTimeout(timeout)
          respondido = true
          conn.ev.off('messages.upsert', listener)
          resolve(false)
        }
      }

      conn.ev.on('messages.upsert', listener)
    })
  }

  // Listar todos los participantes
  if (text.toLowerCase() === 'listar') {
    try {
      const allParticipants = participants || (await conn.groupMetadata(m.chat)).participants
      
      let listMessage = `📋 *LISTA DE PARTICIPANTES*\n\n`
      listMessage += `📊 Total: ${allParticipants.length}\n\n`

      allParticipants.forEach((participant, index) => {
        const phone = participant.id.split('@')[0]
        const name = participant.name || participant.notify || 'Sin nombre'
        const esBotPrincipal = participant.id === conn.user.id
        
        listMessage += `${index + 1}. ${esBotPrincipal ? '🤖 ' : ''}*${name}*\n`
        listMessage += `   📱 ${phone}\n`
        listMessage += `   👤 ${participant.admin ? '👑 Admin' : 'Miembro'}`
        if (!esBotPrincipal) {
          listMessage += `\n   🔧 Eliminar: ${usedPrefix}${command} ${phone}`
        }
        listMessage += '\n\n'
      })

      await m.reply(listMessage)
    } catch (error) {
      await m.reply('❌ Error al listar: ' + error.message)
    }
    return
  }

  // Eliminar todos los participantes (excepto owner y bot principal)
  if (text.toLowerCase() === 'todos') {
    try {
      const allParticipants = participants || (await conn.groupMetadata(m.chat)).participants
      
      // Excluir al bot principal y al owner (quien ejecuta el comando)
      const usuariosAEliminar = allParticipants.filter(p => 
        p.id !== conn.user.id && p.id !== m.sender
      )

      if (usuariosAEliminar.length === 0) {
        return m.reply('🤖 *NO HAY USUARIOS PARA ELIMINAR*')
      }

      // Preguntar confirmación
      const confirmacion = await esperarRespuesta(
        `⚠️ *¿ELIMINAR A ${usuariosAEliminar.length} USUARIOS?*\n\n` +
        `Se eliminarán todos excepto:\n` +
        `• 🤖 El bot principal\n` +
        `• 👤 Tú (el owner)\n\n` +
        `📌 *Responde con "sí" para confirmar*\n` +
        `📌 *Responde con "no" para cancelar*\n\n` +
        `⏰ Tienes 30 segundos para responder.`
      )

      if (confirmacion === null) {
        return m.reply('⏰ *TIEMPO AGOTADO*\n\nNo se recibió respuesta.')
      }
      
      if (!confirmacion) {
        return m.reply('❌ *OPERACIÓN CANCELADA*')
      }

      // Proceder a eliminar
      let eliminados = 0
      let fallidos = 0
      let resultados = []

      for (const usuario of usuariosAEliminar) {
        try {
          await conn.groupParticipantsUpdate(m.chat, [usuario.id], 'remove')
          eliminados++
          resultados.push(`✅ ${usuario.name || usuario.id.split('@')[0]}`)
          
          // Pequeña pausa para evitar bloqueos
          await new Promise(resolve => setTimeout(resolve, 1000))
        } catch (error) {
          fallidos++
          resultados.push(`❌ ${usuario.name || usuario.id.split('@')[0]}: ${error.message}`)
        }
      }

      // Enviar resumen
      const resumen = 
        `📊 *RESUMEN DE ELIMINACIÓN*\n\n` +
        `✅ Eliminados: ${eliminados}\n` +
        `❌ Fallados: ${fallidos}\n` +
        `🤖 Total intentados: ${usuariosAEliminar.length}\n\n` +
        `📋 Primeros resultados:\n${resultados.slice(0, 5).join('\n')}` +
        (resultados.length > 5 ? `\n\n... y ${resultados.length - 5} más` : '')

      await m.reply(resumen)

    } catch (error) {
      await m.reply('❌ Error: ' + error.message)
    }
    return
  }

  // Eliminar usuario específico
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
          `• Responde a un mensaje con ${usedPrefix}${command}`
        )
      }
    }

    // Verificar que no sea el bot principal
    if (targetJid === conn.user.id) {
      return m.reply('❌ No puedes eliminar el bot principal con este comando.')
    }

    // Verificar que esté en el grupo
    const allParticipants = participants || (await conn.groupMetadata(m.chat)).participants
    const targetUser = allParticipants.find(p => p.id === targetJid)

    if (!targetUser) {
      return m.reply('❌ Usuario no encontrado en este grupo.')
    }

    const phone = targetJid.split('@')[0]
    const name = targetUser.name || targetUser.notify || 'Sin nombre'

    // Preguntar confirmación
    const confirmacion = await esperarRespuesta(
      `⚠️ *¿ELIMINAR A ESTE USUARIO?*\n\n` +
      `📛 *Nombre:* ${name}\n` +
      `📱 *Número:* ${phone}\n` +
      `👤 *Rol:* ${targetUser.admin ? '👑 Admin' : 'Miembro'}\n\n` +
      `📌 *Responde con "sí" para confirmar*\n` +
      `📌 *Responde con "no" para cancelar*\n\n` +
      `⏰ Tienes 30 segundos para responder.`
    )

    if (confirmacion === null) {
      return m.reply('⏰ *TIEMPO AGOTADO*\n\nNo se recibió respuesta.')
    }
    
    if (!confirmacion) {
      return m.reply('❌ *OPERACIÓN CANCELADA*')
    }

    // Eliminar al usuario
    await conn.groupParticipantsUpdate(m.chat, [targetJid], 'remove')
    
    await m.reply(
      `✅ *USUARIO ELIMINADO*\n\n` +
      `📛 *Nombre:* ${name}\n` +
      `📱 *Número:* ${phone}\n` +
      `📍 Ha sido eliminado del grupo exitosamente.`
    )

  } catch (error) {
    let errorMsg = '❌ Error: '
    if (error.message.includes('not authorized')) {
      errorMsg += 'No tienes permisos de administrador.'
    } else if (error.message.includes('403')) {
      errorMsg += 'El bot no tiene permisos para eliminar participantes.'
    } else {
      errorMsg += error.message
    }
    await m.reply(errorMsg)
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