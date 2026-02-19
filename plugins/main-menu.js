// código creado por Rufino 

import fetch from 'node-fetch'

const channelId = '120363423258391692@newsletter'
const channelName = '🌸❖𝗪𝗔𝗚𝗨𝗥𝗜 𝗕𝗢𝗧❖🌸'
const menuImage = 'https://raw.githubusercontent.com/ANDERSONARRUE/Img.2/main/upload_1771531295102.jpg'

let handler = async (m, { conn }) => {
  let mentionedJid = m.mentionedJid
  let userId = mentionedJid && mentionedJid[0] ? mentionedJid[0] : m.sender
  let user = global.db.data.users[userId]
  let name = conn.getName(userId)
  let totalreg = Object.keys(global.db.data.users).length
  let totalCommands = Object.values(global.plugins).filter((v) => v.help && v.tags).length
  const uptime = clockString(process.uptime() * 1000)

  let txt = `
✿°• 𝗪𝗔𝗚𝗨𝗥𝗜 𝗕𝗢𝗧 •°✿
- ┈┈∘┈˃̶✿˂̶┈∘┈┈ -

𑁍𓂃 ¡Hola @${userId.split('@')[0]}! ⸜(｡˃ᵕ˂)⸝♡
𑁍𓂃 Soy ${botname}

- ┈┈∘┈˃̶✿˂̶┈∘┈┈ -
𑁍𓂃 𓈒𓏸 *ᴛɪᴘᴏ ::* ${conn.user.jid == global.conn.user.jid ? 'Principal' : 'Sub-bot'}
𑁍𓂃 𓈒𓏸 *ᴜᴘᴛɪᴍᴇ ::* ${uptime}
𑁍𓂃 𓈒𓏸 *ᴜsᴇʀs ::* ${totalreg}
𑁍𓂃 𓈒𓏸 *ʟɪʙ ::* Baileys
- ┈┈∘┈˃̶✿˂̶┈∘┈┈ -

✾) ᅠ⌜ ⚙️ 𝗛𝗘𝗥𝗥𝗔𝗠𝗜𝗘𝗡𝗧𝗔𝗦 ⌝

·˚꒰ /autoadmin ꒱˚·
 ᜒ✿ hace admin al bot
·˚꒰ /ping ꒱˚·
 ᜒ✿ tiempo de respuesta
·˚꒰ /demote ꒱˚·
 ᜒ✿ quitar admin a usuario
·˚꒰ /join ꒱˚·
 ᜒ✿ unirse a otro grupo
·˚꒰ /quitar prefijo ꒱˚·
 ᜒ✿ quita el prefijo
·˚꒰ /update ꒱˚·
 ᜒ✿ actualizar el bot
·˚꒰ /setprefijo ꒱˚·
 ᜒ✿ poner prefijo
·˚꒰ /bots ꒱˚·
 ᜒ✿ lista de subbots
·˚꒰ /delprimary ꒱˚·
 ᜒ✿ elimina bot primario
·˚꒰ /delprimary2 ꒱˚·
 ᜒ✿ elimina 2do primario
·˚꒰ /leave ꒱˚·
 ᜒ✿ salir de un grupo
·˚꒰ /logotipo ꒱˚·
 ᜒ✿ poner logo
·˚꒰ /reload ꒱˚·
 ᜒ✿ reactivar el bot
·˚꒰ /setbanner ꒱˚·
 ᜒ✿ poner banner
·˚꒰ /setcurrency ꒱˚·
 ᜒ✿ poner moneda
·˚꒰ /setname ꒱˚·
 ᜒ✿ poner nombre
·˚꒰ /setprimary ꒱˚·
 ᜒ✿ elegir bot primario
·˚꒰ /tag ꒱˚·
 ᜒ✿ mencionar a todos
·˚꒰ /invocar ꒱˚·
 ᜒ✿ invocar al grupo
·˚꒰ /sticker ꒱˚·
 ᜒ✿ crear sticker
·˚꒰ /kick ꒱˚·
 ᜒ✿ eliminar usuario
·˚꒰ /antilink ꒱˚·
 ᜒ✿ activar anti-enlace
·˚꒰ /del ꒱˚·
 ᜒ✿ eliminar mensaje
·˚꒰ /reg ꒱˚·
 ᜒ✿ registrarse en el bot
·˚꒰ /creador ꒱˚·
 ᜒ✿ ver creadores
·˚꒰ /repo ꒱˚·
 ᜒ✿ repositorio del bot
·˚꒰ /link ꒱˚·
 ᜒ✿ enlaces oficiales
·˚꒰ /emojimix ꒱˚·
 ᜒ✿ combinar emojis
·˚꒰ /letra ꒱˚·
 ᜒ✿ letra de canción

✾) ᅠ⌜ 🎮 𝗗𝗜𝗩𝗘𝗥𝗦𝗜𝗢́𝗡 ⌝

·˚꒰ /doxear ꒱˚·
 ᜒ✿ simula un doxeo
·˚꒰ /facto ꒱˚·
 ᜒ✿ dato aleatorio
·˚꒰ /piropo ꒱˚·
 ᜒ✿ tira un piropo
·˚꒰ /reto ꒱˚·
 ᜒ✿ el bot te reta
·˚꒰ /top <texto> ꒱˚·
 ᜒ✿ top 10 de categoría
·˚꒰ /iqtest ꒱˚·
 ᜒ✿ test de iq
·˚꒰ /gey <usuario> ꒱˚·
 ᜒ✿ señala un gay

✾) ᅠ⌜ 🎨 𝗔𝗡𝗜𝗠𝗘 ⌝

·˚꒰ /bath ꒱˚·
 ᜒ✿ bañarse
·˚꒰ /bite ꒱˚·
 ᜒ✿ morder
·˚꒰ /blush ꒱˚·
 ᜒ✿ sonrojarse
·˚꒰ /bored ꒱˚·
 ᜒ✿ estar aburrido
·˚꒰ /buenas-noches ꒱˚·
 ᜒ✿ desear buenas noches
·˚꒰ /buenos-dias ꒱˚·
 ᜒ✿ desear buenos días
·˚꒰ /cry ꒱˚·
 ᜒ✿ llorar
·˚꒰ /dance ꒱˚·
 ᜒ✿ bailar
·˚꒰ /fumar ꒱˚·
 ᜒ✿ fumar
·˚꒰ /hug ꒱˚·
 ᜒ✿ abrazar
·˚꒰ /kiss ꒱˚·
 ᜒ✿ besar
·˚꒰ /pensar ꒱˚·
 ᜒ✿ pensar
·˚꒰ /sacred ꒱˚·
 ᜒ✿ asustarse
·˚꒰ /slap ꒱˚·
 ᜒ✿ dar una cachetada
·˚꒰ /sleep ꒱˚·
 ᜒ✿ dormir

✾) ᅠ⌜ 🤖 𝗜𝗔 ⌝

·˚꒰ /copilot ꒱˚·
 ᜒ✿ habla con Copilot
·˚꒰ /gemini ꒱˚·
 ᜒ✿ habla con Gemini
·˚꒰ /GPT ꒱˚·
 ᜒ✿ habla con ChatGPT

✾) ᅠ⌜ 📥 𝗗𝗘𝗦𝗖𝗔𝗥𝗚𝗔𝗦 ⌝

·˚꒰ /play ꒱˚·
 ᜒ✿ música desde YouTube
·˚꒰ /play2 ꒱˚·
 ᜒ✿ videos desde YouTube
·˚꒰ /tiktoksearch ꒱˚·
 ᜒ✿ buscar en TikTok
·˚꒰ /ig ꒱˚·
 ᜒ✿ descargar Instagram
·˚꒰ /APK ꒱˚·
 ᜒ✿ descargar aplicación
·˚꒰ /pin ꒱˚·
 ᜒ✿ descargar Pinterest

✾) ᅠ⌜ ⚔️ 𝗥𝗣𝗚 ⌝

·˚꒰ /cazar ꒱˚·
 ᜒ✿ iniciar misión de caza
·˚꒰ /contratos ꒱˚·
 ᜒ✿ ver contratos especiales
·˚꒰ /aceptar <id> ꒱˚·
 ᜒ✿ aceptar un contrato
·˚꒰ /completar ꒱˚·
 ᜒ✿ completar contrato activo
·˚꒰ /perfil ꒱˚·
 ᜒ✿ ver tus estadísticas
·˚꒰ /diario ꒱˚·
 ᜒ✿ recompensa diaria
·˚꒰ /minar ꒱˚·
 ᜒ✿ minar criptomonedas
·˚꒰ /transferir @usuario cantidad ꒱˚·
 ᜒ✿ enviar créditos
·˚꒰ /taller ꒱˚·
 ᜒ✿ tienda de mejoras
·˚꒰ /comprar <objeto> ꒱˚·
 ᜒ✿ comprar ítem del taller
·˚꒰ /comprar.boy <objeto> ꒱˚·
 ᜒ✿ comprar objeto especial
·˚꒰ /item ꒱˚·
 ᜒ✿ info de un objeto
·˚꒰ /vender <objeto> ꒱˚·
 ᜒ✿ vender ítem del inventario
·˚꒰ /duelo @usuario ꒱˚·
 ᜒ✿ retar a duelo PvP
·˚꒰ /hack ꒱˚·
 ᜒ✿ hackear para recompensas
·˚꒰ /best ꒱˚·
 ᜒ✿ ranking de jugadores
·˚꒰ /estadisticas ꒱˚·
 ᜒ✿ stats detalladas
·˚꒰ /inventario ꒱˚·
 ᜒ✿ revisar tu equipo

✾) ᅠ⌜ 💰 𝗘𝗖𝗢𝗡𝗢𝗠𝗜́𝗔 ⌝

·˚꒰ /trabajar ꒱˚·
 ᜒ✿ ganar dinero con trabajos
·˚꒰ /balance ꒱˚·
 ᜒ✿ ver efectivo y banco
·˚꒰ /pay @usuario <cantidad> ꒱˚·
 ᜒ✿ transferir ${moneda}
·˚꒰ /rob @usuario ꒱˚·
 ᜒ✿ robar ${moneda} (riesgoso)
·˚꒰ /deposit <cantidad> ꒱˚·
 ᜒ✿ depositar al banco
·˚꒰ /withdraw <cantidad> ꒱˚·
 ᜒ✿ retirar del banco

- ┈┈∘┈˃̶✿˂̶┈∘┈┈ -
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
