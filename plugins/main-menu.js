import fetch from 'node-fetch'

const channelId = '120363423258391692@newsletter'
const channelName = '🌸❖𝗪𝗔𝗚𝗨𝗥𝗜 𝗕𝗢𝗧❖🌸'
const menuImage = 'https://cdn.hostrta.win/fl/85rm.jpg'

let handler = async (m, { conn }) => {
  let mentionedJid = m.mentionedJid
  let userId = mentionedJid && mentionedJid[0] ? mentionedJid[0] : m.sender
  let user = global.db.data.users[userId]
  let name = conn.getName(userId)
  let totalreg = Object.keys(global.db.data.users).length
  let totalCommands = Object.values(global.plugins).filter((v) => v.help && v.tags).length
  const uptime = clockString(process.uptime() * 1000)

  let txt = `
╭─⊷ *INFORMACIÓN DEL BOT*
│ ๖ۣۜ҉➢ Tipo : ${(conn.user.jid == global.conn.user.jid ? 'Principal' : 'Sub-bot')}
│ ๖ۣۜ҉➢ Activo : ${uptime}
│ ๖ۣۜ҉➢ Usuarios : ${totalreg}
│ ๖ۣۜ҉➢ Biblioteca : Baileys
│ ๖ۣۜ҉➢ Canal : https://whatsapp.com/channel/0029VbBUHyQCsU9IpJ0oIO2i
╰─────────────⊷

╭─⊷ *HERRAMIENTAS*
│ ๖ۣۜ҉➢ autoadmin - Hace admin al bot
│ ๖ۣۜ҉➢ ping - Comprueba el tiempo de respuesta
│ ๖ۣۜ҉➢ demote - Descarta a un usuario como admin
│ ๖ۣۜ҉➢ join - El bot se une a otro grupo
│ ๖ۣۜ҉➢ quitar prefijo - Quita el prefijo de comandos
│ ๖ۣۜ҉➢ update - Actualizar bot
│ ๖ۣۜ҉➢ setprefijo - Poner prefijo de comandos
│ ๖ۣۜ҉➢ bots - Ver lista de subbots
│ ๖ۣۜ҉➢ delprimary - Elimina el bot primario
│ ๖ۣۜ҉➢ delprimary2 - Elimina al segundo bot primario
│ ๖ۣۜ҉➢ leave - Salir de un grupo
│ ๖ۣۜ҉➢ logotipo - Poner logo
│ ๖ۣۜ҉➢ reload - Reactivar el bot
│ ๖ۣۜ҉➢ setbanner - Poner banner
│ ๖ۣۜ҉➢ setcurrency - Poner moneda
│ ๖ۣۜ҉➢ setname - Poner nombre
│ ๖ۣۜ҉➢ setprimary - Elegir bot primario
│ ๖ۣۜ҉➢ tag - Menciona a todos los usuarios
│ ๖ۣۜ҉➢ invocar - Invocar al grupo
│ ๖ۣۜ҉➢ sticker - Hacer sticker
│ ๖ۣۜ҉➢ kick - Elimina a un usuario
│ ๖ۣۜ҉➢ antilink - Anti enlace
│ ๖ۣۜ҉➢ del - Elimina un mensaje
│ ๖ۣۜ҉➢ reg - Regístrate en el bot
│ ๖ۣۜ҉➢ creador - Lista de los creadores del bot
│ ๖ۣۜ҉➢ repo - Muestra el repositorio del bot
│ ๖ۣۜ҉➢ link - Muestra los enlaces oficiales
╰─────────────⊷

╭─⊷ *DIVERSIÓN*
│ ๖ۣۜ҉➢ doxear - Simula un doxeo
│ ๖ۣۜ҉➢ facto - Tira un facto aleatorio
│ ๖ۣۜ҉➢ piropo - Tira un piropo
│ ๖ۣۜ҉➢ reto - El bot te reta
│ ๖ۣۜ҉➢ top <texto> - Top 10 de una categoría
│ ๖ۣۜ҉➢ iqtest - El bot hace un test de tu IQ
│ ๖ۣۜ҉➢ gey <usuario> - El bot muestra a un gay
╰─────────────⊷

╭─⊷ *ANIME*
│ ๖ۣۜ҉➢ bath - Bañarse
│ ๖ۣۜ҉➢ bite - Morder
│ ๖ۣۜ҉➢ blush - Sonrojarse
│ ๖ۣۜ҉➢ bored - Estar aburrido
│ ๖ۣۜ҉➢ buenas-noches - Desear buenas noches
│ ๖ۣۜ҉➢ buenos-dias - Desear buenos días
│ ๖ۣۜ҉➢ cry - Llorar
│ ๖ۣۜ҉➢ dance - Bailar
│ ๖ۣۜ҉➢ fumar - Fumar
│ ๖ۣۜ҉➢ hug - Abrazar
│ ๖ۣۜ҉➢ kiss - Besar
│ ๖ۣۜ҉➢ pensar - Pensar
│ ๖ۣۜ҉➢ sacred - Asustado
│ ๖ۣۜ҉➢ slap - Dar una cachetada
│ ๖ۣۜ҉➢ sleep - Dormir
╰─────────────⊷

╭─⊷ *INTELIGENCIA ARTIFICIAL*
│ ๖ۣۜ҉➢ copilot - Habla con Copilot
│ ๖ۣۜ҉➢ gemini - Habla con Gemini
│ ๖ۣۜ҉➢ GPT - Habla con ChatGPT
╰─────────────⊷

╭─⊷ *DESCARGAS*
│ ๖ۣۜ҉➢ play - Descargar música desde YouTube
│ ๖ۣۜ҉➢ play2 - Descargar videos desde YouTube
│ ๖ۣۜ҉➢ tiktoksearch - Buscar contenido en TikTok para descargar
│ ๖ۣۜ҉➢ ig - Descarga archivos de Instagram
│ ๖ۣۜ҉➢ APK - Descarga una aplicación
│ ๖ۣۜ҉➢ pin - Descargar archivos de Pinterest
╰─────────────⊷

╭─⊷ *RPG*
│ ๖ۣۜ҉➢ cazar - Inicia una misión de caza
│ ๖ۣۜ҉➢ contratos - Muestra contratos especiales
│ ๖ۣۜ҉➢ aceptar <id> - Acepta un contrato del tablero
│ ๖ۣۜ҉➢ completar - Completa el contrato activo
│ ๖ۣۜ҉➢ perfil - Muestra tus estadísticas
│ ๖ۣۜ҉➢ diario - Reclama recompensa diaria
│ ๖ۣۜ҉➢ minar - Mina criptomonedas
│ ๖ۣۜ҉➢ transferir @usuario cantidad - Envía créditos a otro jugador
│ ๖ۣۜ҉➢ taller - Abre la tienda de mejoras
│ ๖ۣۜ҉➢ comprar <objeto> - Compra un ítem del taller
│ ๖ۣۜ҉➢ comprar.boy <objeto> - Compra un objeto especial
│ ๖ۣۜ҉➢ item - Muestra información de un objeto
│ ๖ۣۜ҉➢ vender <objeto> - Vende un ítem de tu inventario
│ ๖ۣۜ҉➢ duelo @usuario - Reta a un duelo PVP
│ ๖ۣۜ҉➢ hack - Hackea sistemas para ganar recompensas
│ ๖ۣۜ҉➢ best - Ranking de mejores jugadores
│ ๖ۣۜ҉➢ estadisticas - Muestra stats detalladas
│ ๖ۣۜ҉➢ inventario - Revisa tu equipo disponible
╰─────────────⊷

╭─⊷ *ECONOMÍA*
│ ๖ۣۜ҉➢ balance - Ver tu saldo actual
│ ๖ۣۜ҉➢ daily - Reclamar recompensa diaria
│ ๖ۣۜ҉➢ trabajar - Realiza un trabajo para ganar monedas
│ ๖ۣۜ҉➢ trabajos - Ver lista de trabajos disponibles
│ ๖ۣۜ҉➢ aceptartrabajo - Aceptar un trabajo de la lista
│ ๖ۣۜ҉➢ renunciar - Renunciar a tu trabajo actual
│ ๖ۣۜ҉➢ casino - Accede al casino para apostar
│ ๖ۣۜ҉➢ tienda - Ver la tienda de objetos disponibles
│ ๖ۣۜ҉➢ comprar - Comprar un objeto de la tienda
│ ๖ۣۜ҉➢ vender - Vender un objeto del inventario
│ ๖ۣۜ҉➢ items - Ver tus objetos e inventario
│ ๖ۣۜ҉➢ usar - Usar un objeto del inventario
│ ๖ۣۜ҉➢ loteria - Participar en la lotería
│ ๖ۣۜ҉➢ topcoins - Ver el ranking de usuarios con más monedas
│ ๖ۣۜ҉➢ pay - Enviar monedas a otro usuario
│ ๖ۣۜ҉➢ economia - Ver tus estadísticas económicas
╰─────────────⊷

*Hola @${userId.split('@')[0]}, mi nombre es ${botname}*
`.trim()

  await conn.sendMessage(m.chat, {
    text: txt,
    contextInfo: {
      mentionedJid: [m.sender, userId],
      forwardingScore: 1,
      externalAdReply: {
        title: channelName,
        body: dev,
        thumbnailUrl: menuImage,
        sourceUrl: redes,
        mediaType: 1,
        renderLargerThumbnail: true
      }
    },
  }, { quoted: m })
}

handler.help = ['menu']
handler.tags = ['main']
handler.command = ['menu', 'menú', 'help', 'menucompleto', 'comandos', 'helpcompleto', 'allmenu']

export default handler

function clockString(ms) {
  let seconds = Math.floor((ms / 1000) % 60)
  let minutes = Math.floor((ms / (1000 * 60)) % 60)
  let hours = Math.floor((ms / (1000 * 60 * 60)) % 24)
  return `${hours}h ${minutes}m ${seconds}s`
}