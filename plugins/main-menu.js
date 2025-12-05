//by Ander
import fetch from 'node-fetch'

const channelId = '120363423258391692@newsletter'
const channelName = '🌸❖𝗪𝗔𝗚𝗨𝗥𝗜 𝗕𝗢𝗧❖🌸'
const menuImage = 'https://files.catbox.moe/4c43sa.png'

let handler = async (m, { conn }) => {
  let mentionedJid = m.mentionedJid
  let userId = mentionedJid && mentionedJid[0] ? mentionedJid[0] : m.sender
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

✿ /autoadmin
✿ /ping
✿ /demote
✿ /join
✿ /quitar prefijo
✿ /update
✿ /setprefijo
✿ /sockets activos
✿ /delprimary 
✿ /delprimary2
✿ /leave
✿ /logotipo
✿ /reload
✿ /setbanner
✿ /setcurrency
✿ /setname
✿ /setprimary

✧˖°⊹ ─────────────── ⊹°˖✧
`.trim()

  // Enviar la imagen con el menú como pie de foto
  await conn.sendMessage(m.chat, {
    image: { url: menuImage },
    caption: txt,
    contextInfo: {
      mentionedJid: [m.sender, userId],
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: channelId,
        newsletterName: channelName,
        serverMessageId: -1,
      },
      forwardingScore: 1,
      externalAdReply: {
        title: botname,
        body: dev,
        thumbnailUrl: banner,
        sourceUrl: redes,
        mediaType: 1,
        renderLargerThumbnail: true,
      },
    },
  }, { quoted: m })
}

handler.help = ['menu']
handler.tags = ['main']
handler.command = ['menu', 'menú', 'help']

export default handler

function clockString(ms) {
  let seconds = Math.floor((ms / 1000) % 60)
  let minutes = Math.floor((ms / (1000 * 60)) % 60)
  let hours = Math.floor((ms / (1000 * 60 * 60)) % 24)
  return `${hours}h ${minutes}m ${seconds}s`
}