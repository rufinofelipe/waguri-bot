// ============================================
// COMANDO: READ (Ver imágenes de vista única)
// Archivo: read.js
// ============================================
async function handler(m, { conn, quoted }) {
    // Verificar si hay mensaje citado
    if (!quoted) {
        return m.reply(`🌸 *𝗪𝗔𝗚𝗨𝗥𝗨 𝗕𝗢𝗧 🌸*\n\n` +
                      `👁️ *VISUALIZADOR DE VISTA ÚNICA*\n\n` +
                      `❌ *Responde a una imagen/video de vista única*\n\n` +
                      `*Uso:*\n` +
                      `1. Envía una foto/video de vista única\n` +
                      `2. Responde con .read\n` +
                      `3. El bot reenviará el contenido\n\n` +
                      `⚠️ *Solo funciona con imágenes/videos de vista única*`);
    }

    // Verificar si el mensaje citado es de vista única
    if (!quoted.viewOnce) {
        return m.reply('❌ Este mensaje no es de vista única.\nSolo funciona con imágenes/videos que se ven una vez.');
    }

    try {
        // Descargar el archivo
        const media = await quoted.download();
        
        // Determinar el tipo de archivo
        let mimeType = quoted.mimetype || 'image/jpeg';
        let isVideo = mimeType.startsWith('video/');
        let isImage = mimeType.startsWith('image/');
        
        if (!isImage && !isVideo) {
            return m.reply('❌ Solo se pueden leer imágenes o videos de vista única.');
        }
        
        // Enviar reacción indicando procesamiento
        try {
            await conn.sendReaction(m.chat, m.key, '⌚');
        } catch {}
        
        // Crear mensaje informativo
        const infoMsg = await m.reply('🔄 Procesando contenido de vista única...');
        
        // Enviar el contenido
        if (isImage) {
            await conn.sendMessage(m.chat, {
                image: media,
                caption: `🌸 *𝗪𝗔𝗚𝗨𝗥𝗨 𝗕𝗢𝗧 🌸*\n\n` +
                        `✅ *IMAGEN DE VISTA ÚNICA*\n\n` +
                        `👁️ *Contenido recuperado*\n` +
                        `📸 *Imagen preservada*`
            }, { quoted: m });
        } else if (isVideo) {
            await conn.sendMessage(m.chat, {
                video: media,
                caption: `🌸 *𝗪𝗔𝗚𝗨𝗥𝗨 𝗕𝗢𝗧 🌸*\n\n` +
                        `✅ *VIDEO DE VISTA ÚNICA*\n\n` +
                        `👁️ *Contenido recuperado*\n` +
                        `🎬 *Video preservado*`
            }, { quoted: m });
        }
        
        // Reacción de éxito
        try {
            await conn.sendReaction(m.chat, m.key, '✅');
        } catch {}
        
        // Eliminar mensaje informativo
        await conn.sendMessage(m.chat, { delete: infoMsg.key });
        
    } catch (error) {
        console.error('Error en comando read:', error);
        
        // Reacción de error
        try {
            await conn.sendReaction(m.chat, m.key, '❌');
        } catch {}
        
        await m.reply(`❌ Error al leer el contenido:\n${error.message}\n\n` +
                     `*Posibles causas:*\n` +
                     `• El contenido ya expiró\n` +
                     `• Error de descarga\n` +
                     `• Contenido corrupto`);
    }
}

handler.help = ['read'];
handler.tags = ['tools'];
handler.command = ['read', 'leer', 'viewonce', 'ver'];
handler.group = true;
handler.limit = false;

export default handler;