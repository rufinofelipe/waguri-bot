import db from '../lib/database.js'
import fs from 'fs'
import PhoneNumber from 'awesome-phonenumber'
import { createHash } from 'crypto'  
import fetch from 'node-fetch'

let Reg = /^(.+)[.|]\s*([0-9]+)$/i

let handler = async function (m, { conn, text, usedPrefix, command }) {
  let user = global.db.data.users[m.sender]
  let name2 = (await conn.getName(m.sender)) || 'waguri'
  let channel = 'https://whatsapp.com/channel/0029VbBUHyQCsU9IpJ0oIO2i'
  let waguriimg = 'https://cdn.hostrta.win/fl/85rm.jpg'
  let instagram = 'https://www.instagram.com/rufino_felipe.15?igsh=MWE1dnZuYnRmeDFpaA=='
  
  // Verificar si el usuario está registrado
  if (user.registered === true) return m.reply(
    `🌟 *¡Ya estás registrado en waguri bot!* 🌟\n\n🌸 Si quieres eliminar tu registro, usa:\n*${usedPrefix}unreg*`
  )

  // Mensaje cuando el usuario no está registrado y usa un comando general
  if (!text && user.registered === false) {
    let registrationPrompt = `🌸 *¡REGISTRO REQUERIDO!* 🌸\n\n` +
      `✨ *Para usar waguri bot necesitas registrarte primero* ✨\n\n` +
      `📋 *Formato de registro:*\n` +
      `${usedPrefix}reg nombre.edad\n\n` +
      `📝 *Ejemplo:*\n` +
      `${usedPrefix}reg ${name2}.18\n\n` +
      `🎁 *Beneficios al registrarte:*\n` +
      `• 39 monedas de inicio\n` +
      `• 300 EXP inicial\n` +
      `• 20 puntos de join\n` +
      `• Acceso a todos los comandos\n\n` +
      `📸 *Sígueme en Instagram:*\n` +
      `${instagram}\n\n` +
      `¡Regístrate ahora y comienza a disfrutar! 🌟`
    
    return m.reply(registrationPrompt)
  }

  // Validación del formato de registro
  if (!Reg.test(text)) return m.reply(
    `🌸 *Registro waguri* 🌸\n\n` +
    `*Formato correcto:*\n` +
    `${usedPrefix + command} nombre.edad\n\n` +
    `*Ejemplo:*\n` +
    `${usedPrefix + command} ${name2}.18\n\n` +
    `📸 *Sígueme en Instagram:*\n` +
    `${instagram}\n\n` +
    `¡Haz tu registro para recibir tu tarjeta y beneficios! 🌟`
  )

  let [_, name, age] = text.match(Reg)
  
  // Validaciones
  if (!name) return m.reply('🌸 El nombre no puede estar vacío. Intenta de nuevo.')
  if (!age) return m.reply('🙂‍↔️ La edad no puede estar vacía. Intenta de nuevo.')
  if (name.length >= 30) return m.reply('🫩 El nombre es muy largo. Usa menos de 30 caracteres.')
  
  age = parseInt(age)
  if (age > 100) return m.reply('💀 ¡Esa edad es demasiado alta! Usa una edad real.')
  if (age < 10) return m.reply('😂 ¡Eres muy pequeño para usar el bot!')

  // Proceso de registro
  user.name = name.trim() + ' ✨'
  user.age = age
  user.regTime = +new Date
  user.registered = true
  user.coin = (user.coin || 0) + 39
  user.exp = (user.exp || 0) + 300
  user.joincount = (user.joincount || 0) + 20

  let sn = createHash('md5').update(m.sender).digest('hex').slice(0, 20)

  // Mensaje de registro exitoso
  let regbot = `🌟 *¡REGISTRO EXITOSO!* 🌟\n\n` +
    `👤 *Nombre:* ${name}\n` +
    `🎂 *Edad:* ${age} años\n` +
    `🆔 *ID:* ${sn}\n\n` +
    `💰 *Recompensas obtenidas:*\n` +
    `• 39 monedas\n` +
    `• 300 EXP\n` +
    `• 20 puntos de join\n\n` +
    `📸 *Sígueme en Instagram:*\n` +
    `${instagram}\n\n` +
    `🌸 *¡Bienvenido a waguri bot!* 🌸\n` +
    `Ahora puedes usar todos los comandos disponibles.`

  await m.react('🌸')

  // Enviar mensaje con imagen
  let thumbBuffer = null
  try {
    const res = await fetch(waguriimg)
    thumbBuffer = Buffer.from(await res.arrayBuffer())
  } catch (e) {
    console.log('Error descargando imagen:', e)
  }

  await conn.sendMessage(m.chat, {
    text: regbot,
    contextInfo: {
      externalAdReply: {
        title: '🌸 Registro en waguri Bot 🌸',
        body: '¡Tu tarjeta está lista! 🌸',
        thumbnail: thumbBuffer,
        mediaType: 1,
        renderLargerThumbnail: true,
        sourceUrl: instagram
      }
    }
  }, { quoted: m })
}

// Middleware para verificar registro en otros comandos
export const before = async function (m, { conn, usedPrefix, command }) {
  let user = global.db.data.users[m.sender]
  
  // Comandos que no requieren registro
  const noRegCommands = ['reg', 'register', 'registrar', 'verify', 'verificar', 'menu', 'help', 'ayuda', 'start']
  
  if (!noRegCommands.includes(command) && user && !user.registered) {
    let name = (await conn.getName(m.sender)) || 'Usuario'
    let instagram = 'https://www.instagram.com/rufino_felipe.15?igsh=MWE1dnZuYnRmeDFpaA=='
    
    let regRequiredMsg = `🔒 *ACCESO RESTRINGIDO* 🔒\n\n` +
      `Hola *${name}*, para usar el comando *${usedPrefix}${command}* necesitas registrarte primero.\n\n` +
      `📋 *Regístrate con:*\n` +
      `${usedPrefix}reg nombre.edad\n\n` +
      `*Ejemplo:* ${usedPrefix}reg ${name}.18\n\n` +
      `📸 *Sígueme en Instagram mientras te registras:*\n` +
      `${instagram}\n\n` +
      `¡Desbloquea todas las funciones del bot! 🚀`
    
    await m.reply(regRequiredMsg)
    return true // Detiene la ejecución del comando
  }
  return false // Permite continuar
}

handler.help = ['reg']
handler.tags = ['rg']
handler.command = ['verify', 'verificar', 'reg', 'register', 'registrar']

export default handler