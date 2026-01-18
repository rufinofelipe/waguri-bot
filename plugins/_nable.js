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
        return conn.reply(m.chat, `❌ *Error:* La función "*${type}*" no existe.\n\n> Use *${usedPrefix}enable* sin parámetros para ver las funciones disponibles.`, m)
      }

      isEnable = true
    } else {
      const funcionesDisponibles = [
        '🎵 *⊱ ──── ≪ °❈° ≫ ──── ⊰* 🎵',
        '💙 *𝐇𝐀𝐓𝐒𝐔𝐍𝐄 𝐌𝐈𝐊𝐔 - 𝐅𝐔𝐍𝐂𝐈𝐎𝐍𝐄𝐒* 💙',
        '🎵 *⊱ ──── ≪ °❈° ≫ ──── ⊰* 🎵\n',
        '🎤 *『 𝐆𝐑𝐔𝐏𝐎 』*\n',
        '🌸 *welcome/bienvenida* ✨',
        '  └─ Mensaje de bienvenida\n',
        '🤖 *antibot/antibots* 🔧',
        '  └─ Anti bots\n',
        '✅ *autoaceptar* 👥',
        '  └─ Auto aceptar usuarios\n',
        '❌ *autorechazar* 🚫',
        '  └─ Auto rechazar usuarios\n',
        '💬 *autoresponder* 📝',
        '  └─ Respuestas automáticas\n',
        '🚫 *antisubbots/antibot2* 🤖',
        '  └─ Anti sub-bots\n',
        '👑 *modoadmin/soladmin* 👑',
        '  └─ Solo administradores\n',
        '😊 *reaction/reaccion* 💖',
        '  └─ Reacciones automáticas\n',
        '🔞 *nsfw/modohorny* 🔥',
        '  └─ Contenido NSFW\n',
        '👁️ *detect/avisos* 📢',
        '  └─ Detectar cambios del grupo\n',
        '🔗 *antilink* 🚫',
        '  └─ Anti enlaces\n',
        '🎭 *antifake* 👤',
        '  └─ Anti números falsos\n',
        '🕌 *antiarabes* 🇸🇦',
        '  └─ Anti números árabes/spam\n',
        '🚫 *antitoxic* 💢',
        '  └─ Anti lenguaje tóxico/ofensivo\n',
        '🚫 *antimencion/antimencionar* 📱',
        '  └─ Anti estado/bio (elimina automáticamente)\n',
        '⬆️ *autolevelup/autonivel* 📈',
        '  └─ Subir nivel automático\n',
        '🚫 *antispam* 📨',
        '  └─ Anti spam\n',
        '🔊 *audios* 🎵',
        '  └─ Audios automáticos por palabras\n',
        '🎤 *『 𝐁𝐎𝐓 𝐆𝐋𝐎𝐁𝐀𝐋 』*\n',
        '🚫 *antiprivado/antiprivate* 📵',
        '  └─ Anti chat privado\n',
        '🔒 *restrict/restringir* ⚡',
        '  └─ Modo restricción\n',
        '🤖 *jadibotmd/modejadibot* 📱',
        '  └─ Modo jadibot\n',
        '🤖 *serbot* 📱',
        '  └─ Función serbot (code/qr)\n',
        '🤖 *subbots* 👥',
        '  └─ Sub-bots\n',
        '🎵 *⊱ ──── ≪ °❈° ≫ ──── ⊰* 🎵',
        '',
        `💙 *𝐔𝐒𝐎:* ${usedPrefix}enable [función]`,
        `🌸 *𝐄𝐉𝐄𝐌𝐏𝐋𝐎:* ${usedPrefix}enable antilink`
      ].join('\n')

      return conn.reply(m.chat, funcionesDisponibles, m)
    }
  } else if (command === 'disable') {
    if (args[0]) {
      type = args[0].toLowerCase()


      if (!isValidFunction(type)) {
        return conn.reply(m.chat, `❌ *Error:* La función "*${type}*" no existe.\n\n> Use *${usedPrefix}disable* sin parámetros para ver las funciones disponibles.`, m)
      }

      isEnable = false
    } else {
      const funcionesDisponibles = [
        '🎵 *⊱ ──── ≪ °❈° ≫ ──── ⊰* 🎵',
        '💙 *𝐇𝐀𝐓𝐒𝐔𝐍𝐄 𝐌𝐈𝐊𝐔 - 𝐃𝐄𝐒𝐀𝐂𝐓𝐈𝐕𝐀𝐑 𝐅𝐔𝐍𝐂𝐈𝐎𝐍𝐄𝐒* 💙',
        '🎵 *⊱ ──── ≪ °❈° ≫ ──── ⊰* 🎵\n',
        '🎤 *『 𝐆𝐑𝐔𝐏𝐎 』*\n',
        '🌸 *welcome/bienvenida* ✨',
        '  └─ Mensaje de bienvenida\n',
        '🤖 *antibot/antibots* 🔧',
        '  └─ Anti bots\n',
        '✅ *autoaceptar* 👥',
        '  └─ Auto aceptar usuarios\n',
        '❌ *autorechazar* 🚫',
        '  └─ Auto rechazar usuarios\n',
        '💬 *autoresponder* 📝',
        '  └─ Respuestas automáticas\n',
        '🚫 *antisubbots/antibot2* 🤖',
        '  └─ Anti sub-bots\n',
        '👑 *modoadmin/soladmin* 👑',
        '  └─ Solo administradores\n',
        '😊 *reaction/reaccion* 💖',
        '  └─ Reacciones automáticas\n',
        '🔞 *nsfw/modohorny* 🔥',
        '  └─ Contenido NSFW\n',
        '👁️ *detect/avisos* 📢',
        '  └─ Detectar cambios del grupo\n',
        '🔗 *antilink* 🚫',
        '  └─ Anti enlaces\n',
        '🎭 *antifake* 👤',
        '  └─ Anti números falsos\n',
        '🕌 *antiarabes* 🇸🇦',
        '  └─ Anti números árabes/spam\n',
        '🚫 *antitoxic* 💢',
        '  └─ Anti lenguaje tóxico/ofensivo\n',
        '🚫 *antimencion/antimencionar* 📱',
        '  └─ Anti estado/bio (elimina automáticamente)\n',
        '⬆️ *autolevelup/autonivel* 📈',
        '  └─ Subir nivel automático\n',
        '🚫 *antispam* 📨',
        '  └─ Anti spam\n',
        '🔊 *audios* 🎵',
        '  └─ Audios automáticos por palabras\n',
        '🎤 *『 𝐁𝐎𝐓 𝐆𝐋𝐎𝐁𝐀𝐋 』*\n',
        '🚫 *antiprivado/antiprivate* 📵',
        '  └─ Anti chat privado\n',
        '🔒 *restrict/restringir* ⚡',
        '  └─ Modo restricción\n',
        '🤖 *jadibotmd/modejadibot* 📱',
        '  └─ Modo jadibot\n',
        '🤖 *serbot* 📱',
        '  └─ Función serbot (code/qr)\n',
        '🤖 *subbots* 👥',
        '  └─ Sub-bots\n',
        '🎵 *⊱ ──── ≪ °❈° ≫ ──── ⊰* 🎵',
        '',
        `💙 *𝐔𝐒𝐎:* ${usedPrefix}disable [función]`,
        `🌸 *𝐄𝐉𝐄𝐌𝐏𝐋𝐎:* ${usedPrefix}disable antilink`
      ].join('\n')

      return conn.reply(m.chat, funcionesDisponibles, m)
    }
  } else if (args[0] === 'on' || args[0] === 'enable') {

    if (!isValidFunction(type)) {
      return conn.reply(m.chat, `❌ *Error:* La función "*${type}*" no existe.\n\n> Funciones disponibles: ${validFunctions.filter((f, i, arr) => arr.indexOf(f) === i).slice(0, 10).join(', ')}...`, m)
    }
    isEnable = true;
  } else if (args[0] === 'off' || args[0] === 'disable') {

    if (!isValidFunction(type)) {
      return conn.reply(m.chat, `❌ *Error:* La función "*${type}*" no existe.\n\n> Funciones disponibles: ${validFunctions.filter((f, i, arr) => arr.indexOf(f) === i).slice(0, 10).join(', ')}...`, m)
    }
    isEnable = false
  } else {

    if (!isValidFunction(type)) {
      return conn.reply(m.chat, `❌ *Error:* La función "*${type}*" no existe.\n\n> Use *${usedPrefix}enable* para ver las funciones disponibles.`, m)
    }
    const estado = isEnable ? '✓ Activado' : '✗ Desactivado'
    return conn.reply(m.chat, `💙 Un administrador puede activar o desactivar el *${command}* utilizando:\n\n> ✐ *${usedPrefix}${command} on* para activar.\n> ✐ *${usedPrefix}${command} off* para desactivar.\n> ✐ *${usedPrefix}enable ${command}* para activar.\n> ✐ *${usedPrefix}disable ${command}* para desactivar.\n\n✧ Estado actual » *${estado}*`, m, global.getRcanal?.() || global.rcanal)
  }

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
      console.log(`🔧 Welcome ${isEnable ? 'activado' : 'desactivado'} para ${m.chat}. Nuevo valor:`, chat.welcome)
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
        return conn.reply(m.chat, '💙 Este comando debe usarse dentro del grupo que desea configurar. Use el comando en el grupo objetivo.', m)
      }
      if (!(isAdmin || isOwner)) {
        global.dfail('admin', m, conn)
        throw false
      }
      chat.antiLink = isEnable
      break

    case 'antilink2':

      if (!m.isGroup) {
        return conn.reply(m.chat, '💙 Este comando debe usarse dentro del grupo que desea configurar. Use el comando en el grupo objetivo.', m)
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



  if ((dbKey === 'antiMencion' || type === 'antimencion') && args[1] && args[1].toLowerCase() === 'action') {
    const action = (args[2] || '').toLowerCase()
    if (!m.isGroup) return conn.reply(m.chat, '❌ Este ajuste solo puede aplicarse en grupos.', m)
    if (!(isAdmin || isOwner)) {
      global.dfail('admin', m, conn)
      throw false
    }
    if (!['kick', 'delete'].includes(action)) {
      return conn.reply(m.chat, '❌ Acción inválida. Use `kick` o `delete`.\n\nEjemplo: `enable antimencion action kick`', m)
    }
    chat.antiMencionAction = action
    return conn.reply(m.chat, `✅ antiMencion action establecido a *${action}* para este chat.`, m)
  }


  if (!isAll && dbKey === 'antiMencion' && isEnable && chat.antiMencionAction === undefined) {
    chat.antiMencionAction = 'kick'
  }

  if (isAll) {
    bot[dbKey] = isEnable
  } else {
    chat[dbKey] = isEnable
  }


  if (global.db && global.db.write) {
    await global.db.write().catch(console.error)
  }


  const mensaje = `💙 La función *${type}* se *${isEnable ? 'activó' : 'desactivó'}* ${isAll ? 'para este Bot' : isUser ? '' : 'para este chat'}`;
  m.reply(mensaje)
};

handler.help = ['welcome', 'bienvenida', 'antiprivado', 'antiprivate', 'restrict', 'restringir', 'autolevelup', 'autonivel', 'antibot', 'antibots', 'autoaceptar', 'aceptarauto', 'autorechazar', 'rechazarauto', 'autoresponder', 'autorespond', 'antisubbots', 'antibot2', 'modoadmin', 'soloadmin', 'reaction', 'reaccion', 'nsfw', 'modohorny', 'antispam', 'jadibotmd', 'modejadibot', 'serbot', 'subbots', 'detect', 'avisos', 'antilink', 'antilink2', 'antifake', 'antiarabes', 'antitoxic', 'antimencion', 'antimencionar', 'audios', 'enable', 'disable']
handler.tags = ['nable'];
handler.command = ['welcome', 'bienvenida', 'antiprivado', 'antiprivate', 'restrict', 'restringir', 'autolevelup', 'autonivel', 'antibot', 'antibots', 'autoaceptar', 'aceptarauto', 'autorechazar', 'rechazarauto', 'autoresponder', 'autorespond', 'antisubbots', 'antibot2', 'modoadmin', 'soloadmin', 'reaction', 'reaccion', 'nsfw', 'modohorny', 'antispam', 'jadibotmd', 'modejadibot', 'serbot', 'subbots', 'detect', 'avisos', 'antilink', 'antilink2', 'antifake', 'antiarabes', 'antitoxic', 'antimencion', 'antimencionar', 'audios', 'enable', 'disable']

export default handler
