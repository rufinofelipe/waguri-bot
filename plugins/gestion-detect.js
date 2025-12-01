// ༻✦༺ ༻✧༺ ༻✦༺ ༻⸙͎۪۫༺ ༻✦༺ ༻✧༺ ༻✦༺
//   Jardín de las Configuraciones - Código de la Casa Waguri
// ༻✦༺ ༻✧༺ ༻✦༺ ༻⸙͎۪۫༺ ༻✦༺ ༻✧༺ ༻✦༺

import fs from 'fs'
import path from 'path'

const handler = async (m, { conn, usedPrefix, command, args, isOwner, isAdmin }) => {
  // rcanal placeholder (si tu entorno define otro contexto, lo puedes eliminar)
  const rcanal = {}

  const primaryBot = global.db.data.chats[m.chat].primaryBot
  if (primaryBot && conn.user.jid !== primaryBot) throw !1
  const chat = global.db.data.chats[m.chat]
  let type = command.toLowerCase()
  // Por defecto detect = true, resto false si no está definido
  let isEnable = (chat[type] !== undefined)
    ? chat[type]
    : (type === 'detect' ? true : false)

  switch (type) {
    case 'welcome':
    case 'bienvenida': {
      if (m.isGroup && !(isAdmin || isOwner)) {
        global.dfail('admin', m, conn)
        throw false
      }
      chat.welcome = isEnable
      break
    }
    case 'modoadmin':
    case 'onlyadmin': {
      if (m.isGroup && !(isAdmin || isOwner)) {
        global.dfail('admin', m, conn)
        throw false
      }
      chat.modoadmin = isEnable
      break
    }
    case 'antilink':
    case 'antienlace': {
      if (m.isGroup && !(isAdmin || isOwner)) {
        global.dfail('admin', m, conn)
        throw false
      }
      chat.antiLink = isEnable
      break
    }
    case 'detect':
    case 'alertas': {
      // Si se ejecuta en privado sólo el dueño del jardín puede cambiarlo
      if (!m.isGroup) {
        if (!isOwner) {
          global.dfail('group', m, conn)
          throw false
        }
      } else {
        // Si es jardín, sólo jardineros mayores pueden cambiarlo
        if (!isAdmin) {
          global.dfail('admin', m, conn)
          throw false
        }
      }
      // Dejar chat.detect igual al valor actual (se actualizará más abajo según args)
      chat.detect = isEnable
      break
    }
  }

  if (args[0] === 'on' || args[0] === 'enable') {
    if (isEnable) return conn.reply(m.chat, `🌸 *${type}* ya estaba *activado* en este jardín`, m, rcanal)
    isEnable = true
  } else if (args[0] === 'off' || args[0] === 'disable') {
    if (!isEnable) return conn.reply(m.chat, `🍂 *${type}* ya estaba *desactivado* en este jardín`, m, rcanal)
    isEnable = false
  } else {
    return conn.reply(
      m.chat,
      `✨ Los jardineros mayores pueden activar o desactivar la función *${command}* utilizando:\n\n🌺 *${command}* enable\n🌺 *${command}* disable\n\n🎋 Estado actual » *${isEnable ? '✓ Activada' : '✗ Desactivada'}*`,
      m, rcanal
    )
  }

  // Guardar el nuevo estado en la propiedad correspondiente
  chat[type] = isEnable

  conn.reply(m.chat, `🌷 La función *${type}* fue *${isEnable ? 'activada' : 'desactivada'}* para este jardín.`, m, rcanal)
}

handler.help = ['welcome', 'bienvenida', 'modoadmin', 'onlyadmin', 'antilink', 'antienlace', 'detect', 'alertas']
handler.tags = ['nable']
handler.command = ['welcome', 'bienvenida', 'modoadmin', 'onlyadmin', 'antilink', 'antienlace', 'detect', 'alertas']
handler.group = true

export default handler

// ༻✦༺ ༻✧༺ ༻✦༺ ༻⸙͎۪۫༺ ༻✦༺ ༻✧༺ ༻✦༺
//   Que la armonía reine en cada configuración
// ༻✦༺ ༻✧༺ ༻✦༺ ༻⸙͎۪۫༺ ༻✦༺ ༻✧༺ ༻✦༺
