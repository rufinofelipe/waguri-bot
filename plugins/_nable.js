// By Duartexv
import { createHash } from 'crypto' 
import fetch from 'node-fetch'

const handler = async (m, { conn, usedPrefix, command, args, isOwner, isAdmin, isROwner }) => {
  let chat = global.getChat ? global.getChat(m.chat) : global.db.data.chats[m.chat]
  let user = global.getUser ? global.getUser(m.sender) : global.db.data.users[m.sender]
  let bot = global.db.data.settings[conn.user.jid] || {}
  let type = command.toLowerCase()
  let isAll = false, isUser = false

  const typeMap = {
    'antilink': 'antiLink',
    'antilink2': 'antiLink2',
    'antibot': 'antiBot',
    'antibots': 'antiBot',
    'antibot2': 'antiBot2',
    'antisubbots': 'antiBot2',
    'autoaceptar': 'autoAceptar',
    'aceptarauto': 'autoAceptar',
    'autorechazar': 'autoRechazar',
    'rechazarauto': 'autoRechazar',
    'antiprivado': 'antiPrivate',
    'antiprivate': 'antiPrivate',
    'antimencion': 'antiMencion',
    'antimencionar': 'antiMencion'
  }

  let dbKey = typeMap[type] || type
  let isEnable = chat[dbKey] || bot[dbKey] || false

  const validFunctions = [
    'welcome', 'bienvenida',
    'antibot', 'antibots', 
    'autoaceptar', 'aceptarauto',
    'autorechazar', 'rechazarauto',
    'autoresponder', 'autorespond',
    'antisubbots', 'antibot2',
    'modoadmin', 'soladmin',
    'reaction', 'reaccion',
    'nsfw', 'modohorny',
    'detect', 'avisos',
    'antilink', 'antilink2',
    'antifake',
    'antiarabes', 'antiarab',
    'antitoxic', 'antitoxics',
    'antimencion', 'antimencionar',
    'autolevelup', 'autonivel',
    'antispam',
    'antiprivado', 'antiprivate',
    'restrict', 'restringir',
    'jadibotmd', 'modejadibot',
    'serbot',
    'subbots',
    'audios', 'audiosmenu'
  ]

  const isValidFunction = (funcName) => {
    return validFunctions.includes(funcName.toLowerCase())
  }

  if (command === 'enable') {
    if (args[0]) {
      type = args[0].toLowerCase()

      if (!isValidFunction(type)) {
        return m.reply(`❌ Error: La función "${type}" no existe.\n\nUsa *${usedPrefix}enable* sin parámetros para ver las funciones disponibles.`)
      }
      isEnable = true
    } else {
      const funcionesLista = `
*📋 LISTA DE FUNCIONES*

*Grupo:*
• welcome / bienvenida - Mensaje de bienvenida
• antibot / antibots - Anti bots
• autoaceptar - Auto aceptar usuarios
• autorechazar - Auto rechazar usuarios
• autoresponder - Respuestas automáticas
• antisubbots / antibot2 - Anti sub-bots
• modoadmin / soladmin - Solo administradores
• reaction / reaccion - Reacciones automáticas
• nsfw / modohorny - Contenido NSFW
• detect / avisos - Detectar cambios del grupo
• antilink / antilink2 - Anti enlaces
• antifake - Anti números falsos
• antiarabes / antiarab - Anti números árabes/spam
• antitoxic / antitoxics - Anti lenguaje tóxico
• antimencion / antimencionar - Anti estado/bio
• autolevelup / autonivel - Subir nivel automático
• antispam - Anti spam
• audios / audiosmenu - Audios por palabras

*Bot Global:*
• antiprivado / antiprivate - Anti chat privado
• restrict / restringir - Modo restricción
• jadibotmd / modejadibot - Modo jadibot
• serbot - Función serbot
• subbots - Sub-bots

*Uso:* ${usedPrefix}enable [función]
*Ejemplo:* ${usedPrefix}enable antilink`
      return m.reply(funcionesLista)
    }
  } else if (command === 'disable') {
    if (args[0]) {
      type = args[0].toLowerCase()

      if (!isValidFunction(type)) {
        return m.reply(`❌ Error: La función "${type}" no existe.\n\nUsa *${usedPrefix}disable* sin parámetros para ver las funciones disponibles.`)
      }
      isEnable = false
    } else {
      const funcionesLista = `
*📋 LISTA DE FUNCIONES PARA DESACTIVAR*

*Grupo:*
• welcome / bienvenida - Mensaje de bienvenida
• antibot / antibots - Anti bots
• autoaceptar - Auto aceptar usuarios
• autorechazar - Auto rechazar usuarios
• autoresponder - Respuestas automáticas
• antisubbots / antibot2 - Anti sub-bots
• modoadmin / soladmin - Solo administradores
• reaction / reaccion - Reacciones automáticas
• nsfw / modohorny - Contenido NSFW
• detect / avisos - Detectar cambios del grupo
• antilink / antilink2 - Anti enlaces
• antifake - Anti números falsos
• antiarabes / antiarab - Anti números árabes/spam
• antitoxic / antitoxics - Anti lenguaje tóxico
• antimencion / antimencionar - Anti estado/bio
• autolevelup / autonivel - Subir nivel automático
• antispam - Anti spam
• audios / audiosmenu - Audios por palabras

*Bot Global:*
• antiprivado / antiprivate - Anti chat privado
• restrict / restringir - Modo restricción
• jadibotmd / modejadibot - Modo jadibot
• serbot - Función serbot
• subbots - Sub-bots

*Uso:* ${usedPrefix}disable [función]
*Ejemplo:* ${usedPrefix}disable antilink`
      return m.reply(funcionesLista)
    }
  } else if (args[0] === 'on' || args[0] === 'enable') {
    if (!isValidFunction(type)) {
      return m.reply(`❌ Error: La función "${type}" no existe.\n\nUsa *${usedPrefix}enable* para ver las funciones disponibles.`)
    }
    isEnable = true
  } else if (args[0] === 'off' || args[0] === 'disable') {
    if (!isValidFunction(type)) {
      return m.reply(`❌ Error: La función "${type}" no existe.\n\nUsa *${usedPrefix}enable* para ver las funciones disponibles.`)
    }
    isEnable = false
  } else {
    if (!isValidFunction(type)) {
      return m.reply(`❌ Error: La función "${type}" no existe.\n\nUsa *${usedPrefix}enable* para ver las funciones disponibles.`)
    }
    const estado = isEnable ? '✅ Activado' : '❌ Desactivado'
    return m.reply(`*Configuración de ${command}:*

Estado actual: *${estado}*

*Comandos disponibles:*
• ${usedPrefix}${command} on - Activar
• ${usedPrefix}${command} off - Desactivar
• ${usedPrefix}enable ${command} - Activar
• ${usedPrefix}disable ${command} - Desactivar`)
  }

  // Permisos y configuraciones (sin cambios en la lógica)
  switch (type) {
    case 'welcome':
    case 'bienvenida':
      if (!m.isGroup) {
        if (!isOwner) {
          global.dfail('group', m, conn)
          throw false
        }
      } else if (!isAdmin) {
        global.dfail('admin', m, conn)
        throw false
      }
      chat.welcome = isEnable
      break

    case 'antiprivado':
    case 'antiprivate':
      isAll = true
      if (!isOwner) {
        global.dfail('rowner', m, conn)
        throw false
      }
      bot.antiPrivate = isEnable
      break

    case 'audios':
    case 'audiosmenu':
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail('admin', m, conn)
          throw false
        }
      }
      chat.audios = isEnable
      break

    case 'restrict':
    case 'restringir':
      isAll = true
      if (!isOwner) {
        global.dfail('rowner', m, conn)
        throw false
      }
      bot.restrict = isEnable
      break

    case 'antibot':
    case 'antibots':
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail('admin', m, conn)
          throw false
        }
      }
      chat.antiBot = isEnable
      break

    case 'autoaceptar':
    case 'aceptarauto':
      if (!m.isGroup) {
        if (!isOwner) {
          global.dfail('group', m, conn)
          throw false
        }
      } else if (!isAdmin) {
        global.dfail('admin', m, conn)
        throw false
      }
      chat.autoAceptar = isEnable
      break

    case 'autorechazar':
    case 'rechazarauto':
      if (!m.isGroup) {
        if (!isOwner) {
          global.dfail('group', m, conn)
          throw false
        }
      } else if (!isAdmin) {
        global.dfail('admin', m, conn)
        throw false
      }
      chat.autoRechazar = isEnable
      break

    case 'autoresponder':
    case 'autorespond':
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail('admin', m, conn)
          throw false
        }
      }
      chat.autoresponder = isEnable
      break

    case 'antisubbots':
    case 'antibot2':
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail('admin', m, conn)
          throw false
        }
      }
      chat.antiBot2 = isEnable
      break

    case 'modoadmin':
    case 'soloadmin':
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail('admin', m, conn);
          throw false;
        }
      }
      chat.modoadmin = isEnable;
      break;

    case 'reaction':
    case 'reaccion':
      if (!m.isGroup) {
        if (!isOwner) {
          global.dfail('group', m, conn)
          throw false
        }
      } else if (!isAdmin) {
        global.dfail('admin', m, conn)
        throw false
      }
      chat.reaction = isEnable
      break

    case 'nsfw':
    case 'modohorny':
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail('admin', m, conn)
          throw false
        }
      }
      chat.nsfw = isEnable
      break

    case 'jadibotmd':
    case 'modejadibot':
      isAll = true
      if (!isOwner) {
        global.dfail('rowner', m, conn)
        throw false
      }
      bot.jadibotmd = isEnable
      break

    case 'serbot':
      isAll = true
      if (!isOwner) {
        global.dfail('rowner', m, conn)
        throw false
      }
      bot.serbot = isEnable
      break

    case 'detect':
    case 'avisos':
      if (!m.isGroup) {
        if (!isOwner) {
          global.dfail('group', m, conn)
          throw false
        }
      } else if (!isAdmin) {
        global.dfail('admin', m, conn)
        throw false
      }
      chat.detect = isEnable
      break

    case 'antilink':
      if (!m.isGroup) {
        return m.reply('Este comando debe usarse dentro del grupo que desea configurar.')
      }
      if (!(isAdmin || isOwner)) {
        global.dfail('admin', m, conn)
        throw false
      }
      chat.antiLink = isEnable
      break

    case 'antilink2':
      if (!m.isGroup) {
        return m.reply('Este comando debe usarse dentro del grupo que desea configurar.')
      }
      if (!(isAdmin || isOwner)) {
        global.dfail('admin', m, conn)
        throw false
      }
      chat.antiLink2 = isEnable
      break

    case 'antifake':
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail('admin', m, conn)
          throw false
        }
      }
      chat.antifake = isEnable
      break

    case 'antiarabes':
    case 'antiarab':
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail('admin', m, conn)
          throw false
        }
      }
      chat.antiarabes = isEnable
      break

    case 'antitoxic':
    case 'antitoxics':
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail('admin', m, conn)
          throw false
        }
      }
      chat.antitoxic = isEnable
      break

    case 'antimencion':
    case 'antimencionar':
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail('admin', m, conn)
          throw false
        }
      }
      chat.antiMencion = isEnable
      break

    case 'autolevelup':
    case 'autonivel':
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail('admin', m, conn)
          throw false
        }
      }
      chat.autolevelup = isEnable
      break

    case 'antispam':
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail('admin', m, conn)
          throw false
        }
      }
      chat.antispam = isEnable
      break

    case 'subbots':
      isAll = true
      if (!isOwner) {
        global.dfail('rowner', m, conn)
        throw false
      }
      bot.subbots = isEnable
      break
  }

  // Configurar acción para antiMencion
  if ((dbKey === 'antiMencion' || type === 'antimencion') && args[1] && args[1].toLowerCase() === 'action') {
    const action = (args[2] || '').toLowerCase()
    if (!m.isGroup) return m.reply('Este ajuste solo puede aplicarse en grupos.')
    if (!(isAdmin || isOwner)) {
      global.dfail('admin', m, conn)
      throw false
    }
    if (!['kick', 'delete'].includes(action)) {
      return m.reply('❌ Acción inválida. Usa `kick` o `delete`.\n\nEjemplo: `enable antimencion action kick`')
    }
    chat.antiMencionAction = action
    return m.reply(`✅ Acción antiMencion establecida a: *${action}*`)
  }

  if (!isAll && dbKey === 'antiMencion' && isEnable && chat.antiMencionAction === undefined) {
    chat.antiMencionAction = 'kick'
  }

  // Guardar configuración
  if (isAll) {
    bot[dbKey] = isEnable
  } else {
    chat[dbKey] = isEnable
  }

  // Guardar en base de datos
  if (global.db && global.db.write) {
    await global.db.write().catch(console.error)
  }

  // Respuesta final
  const mensaje = `✅ *${type}* ${isEnable ? 'activado' : 'desactivado'} ${isAll ? 'para el bot' : 'para este chat'}`
  m.reply(mensaje)
}

handler.help = ['welcome', 'bienvenida', 'antiprivado', 'antiprivate', 'restrict', 'restringir', 'autolevelup', 'autonivel', 'antibot', 'antibots', 'autoaceptar', 'aceptarauto', 'autorechazar', 'rechazarauto', 'autoresponder', 'autorespond', 'antisubbots', 'antibot2', 'modoadmin', 'soloadmin', 'reaction', 'reaccion', 'nsfw', 'modohorny', 'antispam', 'jadibotmd', 'modejadibot', 'serbot', 'subbots', 'detect', 'avisos', 'antilink', 'antilink2', 'antifake', 'antiarabes', 'antitoxic', 'antimencion', 'antimencionar', 'audios', 'enable', 'disable']
handler.tags = ['nable']
handler.command = ['welcome', 'bienvenida', 'antiprivado', 'antiprivate', 'restrict', 'restringir', 'autolevelup', 'autonivel', 'antibot', 'antibots', 'autoaceptar', 'aceptarauto', 'autorechazar', 'rechazarauto', 'autoresponder', 'autorespond', 'antisubbots', 'antibot2', 'modoadmin', 'soloadmin', 'reaction', 'reaccion', 'nsfw', 'modohorny', 'antispam', 'jadibotmd', 'modejadibot', 'serbot', 'subbots', 'detect', 'avisos', 'antilink', 'antilink2', 'antifake', 'antiarabes', 'antitoxic', 'antimencion', 'antimencionar', 'audios', 'enable', 'disable']

export default handler