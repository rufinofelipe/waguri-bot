// código creado por Rufino 

// ============================================
// COMANDO: LYRICS (Letras de canciones)
// Archivo: lyrics.js
// ============================================
import fetch from 'node-fetch';

const API_KEY = 'stellar-SSfb2OPw';
const API_URL = 'https://rest.alyabotpe.xyz/tools/lyrics';

async function handler(m, { text, conn }) {
    if (!text) {
        return m.reply(`🌸 *𝗪𝗔𝗚𝗨𝗥𝗨 𝗕𝗢𝗧 🌸*\n\n` +
                      `🎵 *BUSCADOR DE LETRAS*\n\n` +
                      `❌ *Ingresa una canción*\n\n` +
                      `*Uso:* .lyrics [canción]\n` +
                      `*Ejemplo:* .lyrics Bohemian Rhapsody\n` +
                      `*Ejemplo:* .lyrics Bad Bunny`);
    }

    const cancion = text.trim();
    const waitMsg = await m.reply(`🎵 Buscando letra de "${cancion}"...`);

    try {
        const url = `${API_URL}?query=${encodeURIComponent(cancion)}&key=${API_KEY}`;
        console.log('URL Lyrics:', url);
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Respuesta Lyrics:', JSON.stringify(data, null, 2));
        
        // Verificar si hay error
        if (data.status === false || data.error) {
            throw new Error(data.message || data.error || 'Letra no encontrada');
        }
        
        const result = data.result || data.data || data;
        
        if (!result.lyrics) {
            throw new Error('No se encontró la letra de esta canción');
        }
        
        // Crear mensaje con la letra
        let message = `🌸 *𝗪𝗔𝗚𝗨𝗥𝗨 𝗕𝗢𝗧 🌸*\n\n`;
        message += `🎵 *LETRA DE CANCIÓN*\n\n`;
        
        if (result.title) message += `📌 *Título:* ${result.title}\n`;
        if (result.artist) message += `👤 *Artista:* ${result.artist}\n`;
        if (result.album) message += `💿 *Álbum:* ${result.album}\n`;
        
        message += `\n━━━━━━━━━━━━━━━━━━━━\n`;
        message += `📝 *LETRA:*\n\n`;
        
        // Limitar la longitud de la letra (WhatsApp tiene límite de caracteres)
        const maxLength = 3000;
        let lyrics = result.lyrics;
        
        if (lyrics.length > maxLength) {
            lyrics = lyrics.substring(0, maxLength) + '\n\n[...] *La letra ha sido recortada por longitud*';
        }
        
        message += lyrics;
        message += `\n\n━━━━━━━━━━━━━━━━━━━━\n✨ *Letra obtenida*`;
        
        await conn.sendMessage(m.chat, { text: message }, { quoted: m });
        await conn.sendMessage(m.chat, { delete: waitMsg.key });
        
    } catch (error) {
        console.error('Error Lyrics:', error);
        await m.reply(`❌ Error al buscar letra de "${cancion}": ${error.message}`);
        try { await conn.sendMessage(m.chat, { delete: waitMsg.key }); } catch {}
    }
}

handler.help = ['lyrics <canción>'];
handler.tags = ['tools', 'musica'];
handler.command = ['lyrics', 'letra', 'lyric', 'letras'];
handler.group = true;
handler.limit = true;

export default handler;