// eliminarsub.js - Elimina sub-bots del grupo Y del servidor

let handler = async (m, { conn, text, usedPrefix, command, isOwner }) => {
  if (!isOwner) return m.reply('❌ Solo el owner.')

  // Mostrar ayuda si no hay texto
  if (!text) {
    return m.reply(
      `*🤖 ELIMINAR SUB-BOTS*\n\n` +
      `🔹 *Listar todos:* ${usedPrefix}eliminarsub listar\n` +
      `🔹 *Eliminar por @tag:* ${usedPrefix}eliminarsub @mencion\n` +
      `🔹 *Eliminar por número:* ${usedPrefix}eliminarsub 519xxxxxxx\n` +
      `🔹 *Eliminar todo:* ${usedPrefix}eliminarsub todos\n` +
      `🔹 *Eliminar (sí):* ${usedPrefix}eliminarsub sí\n\n` +
      `⚠️ *ADVERTENCIA:* También eliminará del servidor.`
    )
  }

  // COMANDO: .eliminarsub sí
  if (text.toLowerCase() === 'sí' || text.toLowerCase() === 'si') {
    try {
      // Obtener metadata del grupo
      const groupMetadata = await conn.groupMetadata(m.chat)
      const participants = groupMetadata.participants
      
      // Buscar el sub-bot más reciente (último que no sea el bot principal ni el owner)
      let subBot = null
      
      // Primero buscar por patrones comunes de sub-bots
      for (let participant of participants) {
        if (participant.id === conn.user.id) continue // No es el bot principal
        if (participant.id === m.sender) continue // No es el owner
        
        const nombre = participant.name || participant.notify || ''
        const numero = participant.id.split('@')[0]
        
        // Patrones que indican que es un sub-bot
        if (nombre.includes('Bot') || nombre.includes('Sub') || 
            nombre.includes('Clone') || nombre.includes('Sock') ||
            /^\d+$/.test(numero) || numero.startsWith('1') ||
            nombre === '' || nombre === 'null' || nombre.length < 3) {
          subBot = participant
          break
        }
      }
      
      // Si no encontró por patrones, tomar el último miembro no-admin
      if (!subBot) {
        const posiblesSubs = participants.filter(p => 
          p.id !== conn.user.id && 
          p.id !== m.sender && 
          !p.admin
        )
        
        if (posiblesSubs.length > 0) {
          subBot = posiblesSubs[posiblesSubs.length - 1] // Último de la lista
        }
      }

      if (!subBot) {
        return m.reply('❌ No se encontró ningún sub-bot para eliminar.\nUsa: .eliminarsub @tag')
      }

      const nombre = subBot.name || subBot.notify || 'Sub-bot'
      const numero = subBot.id.split('@')[0]
      const jid = subBot.id

      // 1. ELIMINAR DEL GRUPO
      await conn.groupParticipantsUpdate(m.chat, [jid], 'remove')
      
      // 2. ELIMINAR DEL SERVIDOR (Bloquear número)
      try {
        await conn.updateBlockStatus(jid, 'block')
      } catch (e) {
        console.log('No se pudo bloquear, pero se eliminó del grupo')
      }

      m.reply(`✅ *SUB-BOT ELIMINADO COMPLETAMENTE*\n\n` +
              `📛 *Nombre:* ${nombre}\n` +
              `📱 *Número:* ${numero}\n` +
              `📍 Eliminado del grupo y bloqueado del servidor.`)

    } catch (error) {
      m.reply(`❌ Error: ${error.message}`)
    }
    return
  }

  // COMANDO: .eliminarsub listar
  if (text.toLowerCase() === 'listar') {
    try {
      const groupMetadata = await conn.groupMetadata(m.chat)
      const participants = groupMetadata.participants
      
      let mensaje = `📋 *MIEMBROS DEL GRUPO:*\n\n`
      let contador = 1
      
      participants.forEach(p => {
        const nombre = p.name || p.notify || 'Sin nombre'
        const numero = p.id.split('@')[0]
        const esBotPrincipal = p.id === conn.user.id
        const esOwner = p.id === m.sender
        
        mensaje += `${contador}. ${esBotPrincipal ? '🤖 ' : ''}${esOwner ? '👑 ' : ''}*${nombre}*\n`
        mensaje += `   📱 ${numero}\n`
        if (!esBotPrincipal && !esOwner) {
          mensaje += `   🔧 ${usedPrefix}eliminarsub ${numero}\n`
        }
        mensaje += `   👤 ${p.admin ? 'Administrador' : 'Miembro'}\n\n`
        contador++
      })
      
      m.reply(mensaje)
    } catch (error) {
      m.reply('❌ Error al listar miembros')
    }
    return
  }

  // COMANDO: .eliminarsub todos
  if (text.toLowerCase() === 'todos') {
    try {
      const groupMetadata = await conn.groupMetadata(m.chat)
      const participants = groupMetadata.participants
      
      // Filtrar: solo eliminar posibles sub-bots (no owner, no bot principal, no admins)
      const posiblesSubs = participants.filter(p => {
        if (p.id === conn.user.id) return false // No es bot principal
        if (p.id === m.sender) return false // No es owner
        if (p.admin) return false // No eliminar admins
        
        const nombre = p.name || p.notify || ''
        const numero = p.id.split('@')[0]
        
        // Solo eliminar si parece ser sub-bot
        return (nombre.includes('Bot') || nombre.includes('Sub') || 
                nombre === '' || nombre === 'null' || /^\d+$/.test(numero))
      })

      if (posiblesSubs.length === 0) {
        return m.reply('❌ No se encontraron sub-bots para eliminar.')
      }

      let eliminados = 0
      let errores = 0
      
      for (let sub of posiblesSubs) {
        try {
          // Eliminar del grupo
          await conn.groupParticipantsUpdate(m.chat, [sub.id], 'remove')
          
          // Bloquear del servidor
          try {
            await conn.updateBlockStatus(sub.id, 'block')
          } catch (e) {}
          
          eliminados++
          await new Promise(resolve => setTimeout(resolve, 1000)) // Esperar 1 segundo
          
        } catch (error) {
          errores++
        }
      }

      m.reply(`✅ *ELIMINACIÓN MASIVA COMPLETADA*\n\n` +
              `✅ Eliminados: ${eliminados}\n` +
              `❌ Errores: ${errores}\n` +
              `🤖 Total procesados: ${posiblesSubs.length}`)

    } catch (error) {
      m.reply(`❌ Error: ${error.message}`)
    }
    return
  }

  // COMANDO: .eliminarsub @tag o .eliminarsub 519xxxxxxx
  try {
    let jid = ''
    
    if (m.quoted) {
      jid = m.quoted.sender
    } else if (m.mentionedJid && m.mentionedJid.length > 0) {
      jid = m.mentionedJid[0]
    } else if (text.includes('@')) {
      jid = text.includes('s.whatsapp.net') ? text : text + '@s.whatsapp.net'
    } else {
      const soloNumeros = text.replace(/\D/g, '')
      if (soloNumeros.length >= 10) {
        jid = soloNumeros + '@s.whatsapp.net'
      } else {
        return m.reply('❌ Usa: @tag o número de teléfono')
      }
    }

    // Verificaciones
    if (jid === conn.user.id) return m.reply('❌ No puedo eliminarme a mí mismo')
    if (jid === m.sender) return m.reply('❌ No puedes eliminarte a ti mismo')

    const groupMetadata = await conn.groupMetadata(m.chat)
    const participants = groupMetadata.participants
    const usuario = participants.find(p => p.id === jid)
    
    if (!usuario) return m.reply('❌ Usuario no encontrado en el grupo')

    const nombre = usuario.name || usuario.notify || 'Usuario'
    const numero = jid.split('@')[0]

    // 1. ELIMINAR DEL GRUPO
    await conn.groupParticipantsUpdate(m.chat, [jid], 'remove')
    
    // 2. ELIMINAR DEL SERVIDOR (Bloquear)
    try {
      await conn.updateBlockStatus(jid, 'block')
    } catch (e) {
      console.log('No se pudo bloquear, pero se eliminó del grupo')
    }

    m.reply(`✅ *ELIMINADO COMPLETAMENTE*\n\n` +
            `📛 *Nombre:* ${nombre}\n` +
            `📱 *Número:* ${numero}\n` +
            `📍 Eliminado del grupo y bloqueado del servidor.`)

  } catch (error) {
    let errorMsg = '❌ Error: '
    if (error.message.includes('not authorized')) errorMsg += 'No eres admin'
    else if (error.message.includes('403')) errorMsg += 'El bot no es admin'
    else errorMsg += error.message
    
    m.reply(errorMsg)
  }
}

handler.help = ['eliminarsub [@tag/sí/listar/todos]']
handler.tags = ['owner']
handler.command = /^(eliminarsub|quitarsub|kicksub)$/i
handler.group = true
handler.botAdmin = true
handler.admin = true
handler.owner = true

export default handler