import fetch from 'node-fetch'

const channelId = '120363423258391692@newsletter'
const channelName = '🌸❖𝗪𝗔𝗚𝗨𝗥𝗜 𝗕𝗢𝗧❖🌸'
const menuImage = 'https://cdn.stellarwa.xyz/files/M2Ua.jpeg'

let handler = async (m, { conn }) => {
  let mentionedJid = m.mentionedJid
  let userId = mentionedJid && mentionedJid[0] ? mentionedJid[0] : m.sender
  let user = global.db.data.users[userId]
  let name = conn.getName(userId)
  let totalreg = Object.keys(global.db.data.users).length
  let totalCommands = Object.values(global.plugins).filter((v) => v.help && v.tags).length
  const uptime = clockString(process.uptime() * 1000)

  let txt = `
> Hola @${userId.split('@')[0]}, mi nombre es ${botname} ⸜(。˃ ᴗ ˂ )⸝♡

✧˖°⊹ ─────────────── ⊹°˖✧
˚ ♡ ⋆｡˚ Tipo ⟢ ${(conn.user.jid == global.conn.user.jid ? 'Principal' : 'Sub-bot')}
˚ ♡ ⋆｡˚ Activo ⟢ ${uptime}
˚ ♡ ⋆｡˚ Usuarios ⟢ ${totalreg}
˚ ♡ ⋆｡˚ Biblioteca ⟢ Baileys
✧˖°⊹ ─────────────── ⊹°˖✧

❀ /autoadmin
> hace admin al bot
❀ /ping
> comprueba el tiempo de respuesta 
❀/demote
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
menciana a todos los usuarios 
❀ /play
> descarga audio de YouTube 
❀ /play2
> descarga video de YouTube 
❀ /invocar
> invocar al grupo 
❀ /sticker
> hacer sticker
❀ /kick
> elimina a un usuario 
❀ /waguri
> habla con la iA waguri 
❀ /Pinterest
> descarga archivos de pinterest 
❀ /gemini
> habla con gemini 
❀ /copilot
> habla con copilot 
❀ /apk
> descarga una aplicación 
❀ /ig
> descarga archivos de Instagram 
❀ /antilink
> anti enlace 
❀ /tiktoksearch
> busca un vídeo de tiktok
❀ /del
> elimina un mensaje
❀ /reg
> regístrate en el bot
❀ /creador
> lista de los creadores del bot
          🌸 𝐅𝐔𝐍 🌸
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
         🌸 𝗔𝗡𝗜𝗠𝗘 🌸
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
✧˖°⊹ ─────────────── ⊹°˖✧
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










