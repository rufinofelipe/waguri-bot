 import { search, download } from 'aptoide-scraper'

var handler = async (m, { conn, usedPrefix, command, text }) => {
  if (!text) return conn.reply(m.chat, `❀ Por favor, ingrese el nombre de la apk para descargarlo.`, m)
  
  try {
    await m.react('🕒')
    let searchA = await search(text)
    let data5 = await download(searchA[0].id)
    
    // Encabezado con nombre del bot
    let txt = `
🌸┃ 𝗪𝗔𝗚𝗨𝗥𝗜 𝗕𝗢𝗧  ┃🌸
╰───────────────────
    
✧ APTOIDE - DESCARGAS ✧

≡ 📱 𝙉𝙤𝙢𝙗𝙧𝙚: ${data5.name}
≡ 📦 𝙋𝙖𝙘𝙠𝙖𝙜𝙚: ${data5.package}
≡ 🔄 𝙐𝙡𝙩𝙞𝙢𝙖 𝙑𝙚𝙧𝙨𝙞ó𝙣: ${data5.lastup}
≡ 📊 𝙋𝙚𝙨𝙤: ${data5.size}
╰───────────────────
    `
    
    // Enviar thumbnail con información
    await conn.sendFile(m.chat, data5.icon, 'thumbnail.jpg', txt, m)
    
    // Verificar si el archivo es muy grande
    if (data5.size.includes('GB') || data5.size.replace(' MB', '') > 999) {
      await conn.reply(m.chat, 
        `🌸┃ 𝗪𝗔𝗚𝗨𝗥𝗜 𝗕𝗢𝗧  ┃🌸
╰───────────────────

⚠️ 𝗔𝗥𝗖𝗛𝗜𝗩𝗢 𝗗𝗘𝗠𝗔𝗦𝗜𝗔𝗗𝗢 𝗣𝗘𝗦𝗔𝗗𝗢
❖ El archivo es demasiado grande para enviar por WhatsApp.
❖ Peso: ${data5.size}
❖ Intenta buscar una versión más ligera.`, m)
      await m.react('⚠️')
      return
    }
    
    // Enviar el APK con nombre personalizado
    let apkFileName = `${data5.name}_by_WaguriBot.apk`
    await conn.sendMessage(m.chat, { 
      document: { 
        url: data5.dllink 
      }, 
      mimetype: 'application/vnd.android.package-archive', 
      fileName: apkFileName, 
      caption: `🌸 𝗪𝗔𝗚𝗨𝗥𝗜 𝗕𝗢𝗧 - ${data5.name}  🌸`
    }, { quoted: m })
    
    // Mensaje de confirmación
    await conn.reply(m.chat,
      `🌸┃ 𝗪𝗔𝗚𝗨𝗥𝗜 𝗕𝗢𝗧  ┃🌸
╰───────────────────

✅ 𝗗𝗘𝗦𝗖𝗔𝗥𝗚𝗔 𝗖𝗢𝗠𝗣𝗟𝗘𝗧𝗔
❖ Aplicación: ${data5.name}
❖ Versión: ${data5.lastup}
❖ Peso: ${data5.size}
❖ Archivo enviado con éxito.`, m)
    
    await m.react('✅')
    
  } catch (error) {
    await m.react('❌')
    return conn.reply(m.chat, 
      `🌸┃ 𝗪𝗔𝗚𝗨𝗥𝗜 𝗕𝗢𝗧  ┃🌸
╰───────────────────

⚠️ 𝗘𝗥𝗥𝗢𝗥 𝗘𝗡 𝗟𝗔 𝗗𝗘𝗦𝗖𝗔𝗥𝗚𝗔
❖ Se ha producido un problema.
❖ Usa *${usedPrefix}report* para informarlo.
❖ Error: ${error.message}`, m)
  }
}

handler.tags = ['descargas']
handler.help = ['apkmod']
handler.command = ['apk', 'modapk', 'aptoide']
handler.group = true

export default handler