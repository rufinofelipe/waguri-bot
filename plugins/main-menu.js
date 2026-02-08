// código creado por Rufino 

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
┏━━━━━━━━━━━━━━━━━━┓
     𝗪𝗔𝗚𝗨𝗥𝗜 𝗕𝗢𝗧
┗━━━━━━━━━━━━━━━━━━┛

🌸 ¡Hola @${userId.split('@')[0]}!
🤖 Mi nombre es ${botname}

┏━━━━━━━━━━━━━━━━━━┓
    📊 𝗘𝗦𝗧𝗔𝗗𝗜́𝗦𝗧𝗜𝗖𝗔𝗦
┗━━━━━━━━━━━━━━━━━━┛
• 🏷️  Tipo: ${(conn.user.jid == global.conn.user.jid ? 'Principal' : 'Sub-bot')}
• ⏰  Activo: ${uptime}
• 👥  Usuarios: ${totalreg}
• 📚  Biblioteca: Baileys

┏━━━━━━━━━━━━━━━━━━┓
    ⚙️ 𝗛𝗘𝗥𝗥𝗔𝗠𝗜𝗘𝗡𝗧𝗔𝗦
┗━━━━━━━━━━━━━━━━━━┛
 ❀ /autoadmin
 > hace admin al bot

 ❀ /ping
 > comprueba el tiempo de respuesta 

 ❀ /demote
 > descarta a un usuario como admin 

 ❀ /join
 > el bot se une a otro

 ❀ /quitar prefijo
 > quita el prefijo de comandos 

 ❀ /update
 > actulizar bot

 ❀ /setprefijo
 > poner prefijo de comandos 

 ❀ /bots
 > ver listo de subbots 

 ❀ /delprimary 
 > elimina el bot primario 

 ❀ /delprimary2
 > elimina al segundo bot primario 

 ❀ /leave
 > salir de un grupo 

 ❀ /logotipo
 > poner logo

 ❀ /reload
 > reactivar el bot

 ❀ /setbanner
 > poner banner 

 ❀ /setcurrency
 > poner moneda 

 ❀ /setname
 > poner nombre 

 ❀ /setprimary
 > elegir bot primario 

 ❀ /tag
 > menciana a todos los usuarios 

 ❀ /invocar
 > invocar al grupo 

 ❀ /sticker
 > hacer sticker

 ❀ /kick
 > elimina a un usuario  

 ❀ /antilink
 > anti enlace 

 ❀ /del
 > elimina un mensaje

 ❀ /reg
 > regístrate en el bot

 ❀ /creador
 > lista de los creadores del bot

 ❀ /repo
 > muestra el repositorio del bot 

 ❀ /link
 > muestra los enlaces oficiales 

 ❀ /emojimix 😀+😀
 > combina dos emojis

 ❀ /letra
 > busca la letra de una canción 

 > 

 ┏━━━━━━━━━━━━━━━━━━┓
     🎮 𝗗𝗜𝗩𝗘𝗥𝗦𝗜𝗢́𝗡
 ┗━━━━━━━━━━━━━━━━━━┛
 ❀ /doxear
 > simula un doxeo

 ❀ /facto
 > tira un facto aleatorio

 ❀ /piropo
 > tira un piropo

 ❀ /reto 
 > el bot te reta

 ❀ /top <texto>
 > top 10 de una categoría 

 ❀ /iqtest
 > el bot hace un test de tu iq

 ❀ /gey <usuario>
 > el bot muestra a un gay

┏━━━━━━━━━━━━━━━━━━┓
     🎨 𝗔𝗡𝗜𝗠𝗘
┗━━━━━━━━━━━━━━━━━━┛
 ❀ /bath  
 > Bañarse

 ❀ /bite  
 > Morder

 ❀ /blush  
 > Sonrojarse

 ❀ /bored  
 > Estar aburrido

 ❀ /buenas-noches  
 > Desear buenas noches

 ❀ /buenos-dias  
 > Desear buenos días

 ❀ /cry  
 > Llorar

 ❀ /dance  
 > Bailar

 ❀ /fumar  
 > Fumar

 ❀ /hug  
 > Abrazar

 ❀ /kiss  
 > Besar

 ❀ /pensar  
 > Pensar

 ❀ /sacred  
 > asustado 

 ❀ /slap  
 > Dar una cachetada

 ❀ /sleep  
 > Dormir

 ┏━━━━━━━━━━━━━━━━━━┓
     🤖 𝗜𝗡𝗧𝗘𝗟𝗜𝗚𝗘𝗡𝗖𝗜𝗔 𝗔𝗥𝗧𝗜𝗙𝗜𝗖𝗜𝗔𝗟
 ┗━━━━━━━━━━━━━━━━━━┛
 ❀ /copilot  
 > habla con copilot 

 ❀ /gemini  
 > habla con gemini

 ❀ /GPT
 > habla con ChatGPT 

 ┏━━━━━━━━━━━━━━━━━━┓
     📥 𝗗𝗘𝗦𝗖𝗔𝗥𝗚𝗔𝗦
 ┗━━━━━━━━━━━━━━━━━━┛
 ❀ /play  
 > Descargar música desde YouTube  

 ❀ /play2  
 > Descargar videos desde YouTube  

 ❀ /tiktoksearch  
 > Buscar contenido en TikTok para   descargar
 
 ❀ /ig
 > descarga archivos de Instagram

 ❀ /APK
 > descarga una aplicación

 ❀ /pin
 > descargar archivos de pinterest 

 ┏━━━━━━━━━━━━━━━━━━┓
     ⚔️ 𝗥𝗣𝗚
 ┗━━━━━━━━━━━━━━━━━━┛
 ❀ /cazar  
 > inicia una misión de caza

 ❀ /contratos  
 > muestra contratos especiales

 ❀ /aceptar <id>  
 > acepta un contrato del tablero

 ❀ /completar  
 > completa el contrato activo

 ❀ /perfil  
 > muestra tus estadísticas

 ❀ /diario  
 > reclama recompensa diaria

 ❀ /minar  
 > mina criptomonedas

 ❀ /transferir @usuario cantidad  
 > envía créditos a otro jugador

 ❀ /taller  
 > abre la tienda de mejoras

 ❀ /comprar <objeto>  
 > compra un ítem del taller

 ❀ /comprar.boy <objeto>  
 > compra un objeto especial

 ❀ /item  
 > muestra información de un objeto

 ❀ /vender <objeto>  
 > vende un ítem de tu inventario

 ❀ /duelo @usuario  
 > reta a un duelo pvp

 ❀ /hack  
 > hackea sistemas para ganar recompensas

 ❀ /best  
 > ranking de mejores jugadores

 ❀ /estadisticas  
 > muestra stats detalladas

 ❀ /inventario  
 > revisa tu equipo disponible

 ┏━━━━━━━━━━━━━━━━━━┓
     💰 𝗘𝗖𝗢𝗡𝗢𝗠𝗜́𝗔
 ┗━━━━━━━━━━━━━━━━━━┛
 ❀ /trabajar
 > realiza diversos trabajos para ganar dinero 

 ❀ /balance
 > consulta tu dinero en efectivo y banco

 ❀ /pay @usuario <cantidad>
 > transfiere ${moneda} desde tu banco a otro usuario

 ❀ /minar
 > mina criptomonedas con sistema de probabilidades

 ❀ /rob @usuario
 > intenta robar ${moneda} de otro jugador (riesgoso)

 ❀ /deposit <cantidad>
 > deposita tu dinero en el banco para protegerlo

 ❀ /withdraw <cantidad>
 > retira dinero de tu banco al efectivo

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

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