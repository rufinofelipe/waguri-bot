// eliminarsub.js - VERSIÓN SIMPLE Y FUNCIONAL

let handler = async (m, { conn, text, usedPrefix, command, isOwner, participants }) => {
  if (!isOwner) return m.reply('❌ Solo el owner puede usar este comando.')
  
  if (!text) return m.reply(
    `*🤖 COMANDO ELIMINAR SUB-BOTS*\n\n` +
    `📌 *Uso:*\n` +
    `• ${usedPrefix}${command} listar - Ver todos en el grupo\n` +
    `• ${usedPrefix}${command} @tag - Eliminar a alguien\n` +
    `• ${usedPrefix}${command} 519xxxxxxx - Eliminar por número\n` +
    `• Responde a un mensaje con ${usedPrefix}${command}`
  )

  // LISTAR TODOS
  if (text.toLowerCase() === 'listar') {
    try {
      const all = participants || await conn.groupMetadata(m.chat).then(g => g.participants)
      let msg = `📋 *TODOS EN EL GRUPO:*\n\n`
      
      all.forEach((p, i) => {
        const num = p.id.split('@')[0]
        const name = p.name || p.notify || 'Sin nombre'
        msg += `${i+1}. ${p.id === conn.user.id ? '🤖 ' : ''}*${name}*\n`
        msg += `   📱 ${num}\n`
        if (p.id !== conn.user.id) msg += `   🔧 ${usedPrefix}${command} ${num}\n`
        msg += '\n'
      })
      
      return m.reply(msg)
    } catch(e) {
      return m.reply('❌ Error al listar')
    }
  }

  // OBTENER EL JID A ELIMINAR
  let jidEliminar = ''
  
  if (m.quoted) {
    jidEliminar = m.quoted.sender
  } else if (m.mentionedJid && m.mentionedJid.length > 0) {
    jidEliminar = m.mentionedJid[0]
  } else if (text.includes('@')) {
    jidEliminar = text.includes('s.whatsapp.net') ? text : text + '@s.whatsapp.net'
  } else {
    const soloNumeros = text.replace(/\D/g, '')
    if (soloNumeros.length >= 10) {
      jidEliminar = soloNumeros + '@s.whatsapp.net'
    } else {
      return m.reply('❌ Usa: @tag o número de teléfono')
    }
  }

  // VERIFICAR
  if (jidEliminar === conn.user.id) return m.reply('❌ No puedo eliminarme a mí mismo')
  
  const allUsers = participants || await conn.groupMetadata(m.chat).then(g => g.participants)
  const usuario = allUsers.find(u => u.id === jidEliminar)
  if (!usuario) return m.reply('❌ Usuario no encontrado en el grupo')

  // ELIMINAR DIRECTAMENTE SIN CONFIRMACION
  try {
    await conn.groupParticipantsUpdate(m.chat, [jidEliminar], 'remove')
    
    const nombre = usuario.name || usuario.notify || 'Usuario'
    const numero = jidEliminar.split('@')[0]
    
    m.reply(`✅ *ELIMINADO:* ${nombre} (${numero})`)
    
  } catch(error) {
    let msgError = '❌ Error: '
    if (error.message.includes('not authorized')) msgError += 'No eres admin'
    else if (error.message.includes('403')) msgError += 'El bot no es admin'
    else msgError += error.message
    
    m.reply(msgError)
  }
}

handler.help = ['eliminarsub @tag']
handler.tags = ['owner']
handler.command = /^(eliminarsub|quitarsub)$/i
handler.group = true
handler.botAdmin = true
handler.admin = true
handler.owner = true

export default handler