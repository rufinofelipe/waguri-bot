// eliminarsub.js - VERSIÓN SIMPLE Y DIRECTA

let handler = async (m, { conn, text, usedPrefix, command, isOwner }) => {
  if (!isOwner) return m.reply('❌ Solo owner.')

  if (!text) {
    return m.reply(
      `*🔧 ELIMINAR SUB-BOTS*\n\n` +
      `Uso:\n` +
      `• ${usedPrefix}eliminarsub @mencion\n` +
      `• ${usedPrefix}eliminarsub 519xxxxxxx\n` +
      `• ${usedPrefix}eliminarsub listar\n` +
      `• ${usedPrefix}eliminarsub todos\n\n` +
      `Solo elimina del grupo.`
    )
  }

  // LISTAR
  if (text.toLowerCase() === 'listar') {
    try {
      const group = await conn.groupMetadata(m.chat)
      let msg = `*👥 GRUPO:* ${group.subject}\n*📊 Miembros:* ${group.participants.length}\n\n`
      
      group.participants.forEach((p, i) => {
        const num = p.id.split('@')[0]
        const name = p.name || p.notify || 'Sin nombre'
        msg += `${i+1}. ${p.id === conn.user.id ? '🤖 ' : ''}${name}\n`
        msg += `   📱 ${num}\n`
        if (p.id !== conn.user.id) msg += `   🗑️ ${usedPrefix}eliminarsub ${num}\n`
        msg += '\n'
      })
      
      return m.reply(msg)
    } catch (e) {
      return m.reply('❌ Error')
    }
  }

  // ELIMINAR TODOS (solo posibles bots)
  if (text.toLowerCase() === 'todos') {
    try {
      const group = await conn.groupMetadata(m.chat)
      const participantes = group.participants
      
      // Solo eliminar si parece bot
      const aEliminar = participantes.filter(p => {
        if (p.id === conn.user.id) return false
        if (p.id === m.sender) return false
        const name = p.name || p.notify || ''
        const num = p.id.split('@')[0]
        return name.includes('Bot') || name.includes('Sub') || /^\d+$/.test(name)
      })

      if (aEliminar.length === 0) return m.reply('❌ No hay bots para eliminar')

      for (let usuario of aEliminar) {
        try {
          await conn.groupParticipantsUpdate(m.chat, [usuario.id], 'remove')
          await new Promise(r => setTimeout(r, 1000))
        } catch (e) {}
      }

      m.reply(`✅ Eliminados ${aEliminar.length} bots`)
      
    } catch (e) {
      m.reply('❌ Error')
    }
    return
  }

  // ELIMINAR POR MENCION/NUMERO
  try {
    let jid = ''
    
    if (m.quoted) {
      jid = m.quoted.sender
    } else if (m.mentionedJid && m.mentionedJid.length > 0) {
      jid = m.mentionedJid[0]
    } else if (text.includes('@')) {
      jid = text.includes('s.whatsapp.net') ? text : text + '@s.whatsapp.net'
    } else {
      const num = text.replace(/\D/g, '')
      if (num.length >= 10) {
        jid = num + '@s.whatsapp.net'
      } else {
        return m.reply('❌ Usa: @tag o número')
      }
    }

    // No eliminar al bot principal ni al owner
    if (jid === conn.user.id) return m.reply('❌ No puedo eliminarme')
    if (jid === m.sender) return m.reply('❌ No puedes eliminarte')

    // Eliminar directamente
    await conn.groupParticipantsUpdate(m.chat, [jid], 'remove')
    
    const num = jid.split('@')[0]
    m.reply(`✅ Eliminado: ${num}`)
    
  } catch (error) {
    m.reply('❌ Error: ' + (error.message || 'No se pudo eliminar'))
  }
}

handler.help = ['eliminarsub @tag']
handler.tags = ['owner']
handler.command = /^(eliminarsub|quitar)$/i
handler.group = true
handler.botAdmin = true
handler.admin = true
handler.owner = true

export default handler