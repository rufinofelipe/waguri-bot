//código creado por Rufino 
import fetch from 'node-fetch';

const API_KEY = 'stellar-SSfb2OPw';
const API_URL = 'https://rest.alyabotpe.xyz/ai/texttoimage';

async function handler(m, { text, conn }) {
    if (!text) {
        return m.reply(`🌸 *𝗪𝗔𝗚𝗨𝗥𝗨 𝗕𝗢𝗧 🌸*\n\n` +
                      `❌ *Escribe una descripción*\n\n` +
                      `*Ejemplo:* .tti un gato astronauta en el espacio`);
    }

    // Mensaje de espera
    const waitMsg = await m.reply('🎨 *Generando imagen con IA...*\n⏳ Por favor espera...');

    try {
        // Preparar la solicitud
        const prompt = encodeURIComponent(text);
        const url = `${API_URL}?text=${prompt}&key=${API_KEY}`;
        
        console.log('Solicitando imagen a:', url);
        
        // Hacer la petición a la API
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json'
            },
            timeout: 30000
        });

        // Verificar respuesta
        if (!response.ok) {
            throw new Error(`API respondió con error: ${response.status}`);
        }

        // Intentar diferentes formatos de respuesta
        const responseText = await response.text();
        console.log('Respuesta raw:', responseText.substring(0, 200));
        
        let imageUrl;
        
        try {
            // Intentar parsear como JSON
            const data = JSON.parse(responseText);
            console.log('Datos JSON:', data);
            
            // Buscar URL en diferentes posibles campos
            imageUrl = data.result || data.url || data.image || data.link || data.data || data.file;
            
            // Si no es URL directa, podría ser base64
            if (imageUrl && imageUrl.startsWith('data:image')) {
                // Es base64, la manejamos diferente
                return await handleBase64Image(imageUrl, text, m, conn, waitMsg);
            }
            
        } catch (jsonError) {
            console.log('No es JSON, podría ser URL directa o base64');
            // Si no es JSON, podría ser una URL directa o base64
            if (responseText.startsWith('http')) {
                imageUrl = responseText.trim();
            } else if (responseText.startsWith('data:image')) {
                return await handleBase64Image(responseText, text, m, conn, waitMsg);
            }
        }

        if (!imageUrl) {
            // Intentar buscar URL en el texto de respuesta
            const urlMatch = responseText.match(/https?:\/\/[^\s"']+/);
            if (urlMatch) {
                imageUrl = urlMatch[0];
            } else {
                throw new Error('No se encontró URL de imagen en la respuesta');
            }
        }

        console.log('URL de imagen encontrada:', imageUrl);

        // Verificar que sea una URL válida
        if (!imageUrl.startsWith('http') && !imageUrl.startsWith('data:image')) {
            throw new Error(`URL inválida: ${imageUrl.substring(0, 50)}...`);
        }

        // Enviar la imagen
        await conn.sendMessage(m.chat, {
            image: { url: imageUrl },
            caption: `🌸 *𝗪𝗔𝗚𝗨𝗥𝗨 𝗕𝗢𝗧 🌸*\n\n` +
                    `✅ *IMAGEN GENERADA*\n\n` +
                    `📝 *Prompt:* ${text}\n` +
                    `🖼️ *Generado con IA*`
        }, { quoted: m });

        // Eliminar mensaje de espera
        await conn.sendMessage(m.chat, { delete: waitMsg.key });

    } catch (error) {
        console.error('Error completo:', error);
        
        // Eliminar mensaje de espera
        try {
            await conn.sendMessage(m.chat, { delete: waitMsg.key });
        } catch {}
        
        // Mensaje de error detallado
        await m.reply(`🌸 *𝗪𝗔𝗚𝗨𝗥𝗨 𝗕𝗢𝗧 🌸*\n\n` +
                     `❌ *Error al generar imagen*\n\n` +
                     `🔧 *Detalles:* ${error.message}\n\n` +
                     `💡 *Sugerencias:*\n` +
                     `• Intenta con texto más simple\n` +
                     `• Espera unos segundos\n` +
                     `• Verifica tu conexión\n` +
                     `• Prueba otro prompt`);
    }
}

// Función para manejar imágenes base64
async function handleBase64Image(base64Data, text, m, conn, waitMsg) {
    console.log('Procesando imagen base64');
    
    // Convertir base64 a buffer
    const base64Image = base64Data.split(';base64,').pop();
    const imageBuffer = Buffer.from(base64Image, 'base64');
    
    // Enviar imagen desde buffer
    await conn.sendMessage(m.chat, {
        image: imageBuffer,
        caption: `🌸 *𝗪𝗔𝗚𝗨𝗥𝗨 𝗕𝗢𝗧 🌸*\n\n` +
                `✅ *IMAGEN GENERADA*\n\n` +
                `📝 *Prompt:* ${text}\n` +
                `🖼️ *Generado con IA*`
    }, { quoted: m });
    
    // Eliminar mensaje de espera
    await conn.sendMessage(m.chat, { delete: waitMsg.key });
}

handler.help = ["tti <texto>"];
handler.tags = ["ai", "imagen"];
handler.command = ["tti", "textoimagen", "imagen", "dibujar", "aiimg"];
handler.limit = true;
handler.group = true;

export default handler;
