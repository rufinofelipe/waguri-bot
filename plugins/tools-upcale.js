// ============================================
// COMANDO: UPSCALE (Mejorar calidad de imagen)
// Archivo: upscale.js
// ============================================
import fetch from 'node-fetch';

const API_KEY = 'stellar-yJFoP0BO';
const API_URL = 'https://rest.alyabotpe.xyz/tools/upscale';

async function handler(m, { text, conn, quoted }) {
    // Verificar si hay imagen para upscale
    let imageBuffer = null;
    let imageUrl = null;
    
    // Verificar imagen citada
    if (quoted && (quoted.mtype === 'imageMessage' || quoted.mtype === 'stickerMessage')) {
        imageBuffer = await quoted.download();
    }
    // Verificar imagen en el mensaje actual
    else if (m.mtype === 'imageMessage') {
        imageBuffer = await m.download();
    }
    // Verificar si se proporcionó URL
    else if (text && text.startsWith('http')) {
        imageUrl = text.trim();
    }
    else {
        return m.reply(`🌸 *𝗪𝗔𝗚𝗨𝗥𝗨 𝗕𝗢𝗧 🌸*\n\n` +
                      `🖼️ *UPSCALE DE IMAGEN*\n\n` +
                      `❌ *Envia una imagen o URL*\n\n` +
                      `*Formas de uso:*\n` +
                      `• Responde a una imagen con .upscale\n` +
                      `• Envia una imagen con .upscale\n` +
                      `• .upscale [URL de imagen]\n\n` +
                      `✨ *Mejora la calidad de imágenes*`);
    }

    const waitMsg = await m.reply('🔄 Mejorando calidad de la imagen...');

    try {
        let response;
        
        if (imageBuffer) {
            // Subir imagen como FormData
            const formData = new FormData();
            const blob = new Blob([imageBuffer], { type: 'image/jpeg' });
            formData.append('image', blob, 'image.jpg');
            formData.append('key', API_KEY);
            
            response = await fetch(API_URL, {
                method: 'POST',
                body: formData
            });
        } else if (imageUrl) {
            // Usar URL
            const url = `${API_URL}?url=${encodeURIComponent(imageUrl)}&key=${API_KEY}`;
            response = await fetch(url);
        }
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Respuesta Upscale:', JSON.stringify(data, null, 2));
        
        // Verificar si hay error
        if (data.status === false || data.error) {
            throw new Error(data.message || data.error || 'Error al procesar imagen');
        }
        
        const result = data.result || data.data || data;
        const upscaledImageUrl = result.url || result.image || result.result;
        
        if (!upscaledImageUrl) {
            throw new Error('No se recibió imagen mejorada');
        }
        
        // Enviar imagen mejorada
        await conn.sendMessage(m.chat, {
            image: { url: upscaledImageUrl },
            caption: `🌸 *𝗪𝗔𝗚𝗨𝗥𝗨 𝗕𝗢𝗧 🌸*\n\n` +
                    `✅ *IMAGEN MEJORADA*\n\n` +
                    `🖼️ *Calidad mejorada con IA*\n` +
                    `✨ *Imagen procesada exitosamente*`
        }, { quoted: m });
        
        await conn.sendMessage(m.chat, { delete: waitMsg.key });
        
    } catch (error) {
        console.error('Error Upscale:', error);
        await m.reply(`❌ Error al mejorar la imagen: ${error.message}`);
        try { await conn.sendMessage(m.chat, { delete: waitMsg.key }); } catch {}
    }
}

handler.help = ['upscale <imagen|url>'];
handler.tags = ['tools', 'imagen'];
handler.command = ['upscale', 'mejorar', 'hd', 'enhance'];
handler.group = true;
handler.limit = true;

export default handler;