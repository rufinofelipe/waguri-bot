//código creado por Rufino
import fetch from 'node-fetch';
import { Sticker, StickerTypes } from 'wa-sticker-formatter';

const API_KEY = 'stellar-NpSITguV';
const API_URL = 'https://rest.alyabotpe.xyz/whatsapp/emojimix';

async function handler(m, { text, conn }) {
    if (!text) {
        return m.reply(`🌸 *𝗪𝗔𝗚𝗨𝗥𝗨 𝗕𝗢𝗧 🌸*\n\n` +
                      `🎭 *EMOJI MIX*\n\n` +
                      `❌ *Formato incorrecto*\n\n` +
                      `*Uso:* .emojimix 😂+😭\n` +
                      `*Uso:* .emojimix 😍+🥰\n` +
                      `*Uso:* .emojimix 🐶+🐱\n\n` +
                      `💡 *Separa los emojis con un signo +*`);
    }

    // Extraer emojis (formato: 😂+😭 o 😂 😭)
    let emoji1, emoji2;
    
    if (text.includes('+')) {
        const parts = text.split('+');
        emoji1 = parts[0].trim();
        emoji2 = parts[1].trim();
    } else {
        // Intentar separar por espacio si no hay +
        const emojis = text.match(/[\p{Emoji}]/gu);
        if (emojis && emojis.length >= 2) {
            emoji1 = emojis[0];
            emoji2 = emojis[1];
        } else {
            return m.reply('❌ Necesito 2 emojis separados por + (ej: 😂+😭)');
        }
    }

    if (!emoji1 || !emoji2) {
        return m.reply('❌ No se pudieron detectar 2 emojis válidos.');
    }

    // Reacción ⌚
    try {
        await conn.sendReaction(m.chat, m.key, '⌚');
    } catch {}

    // Mensaje de procesamiento
    const processingMsg = await conn.sendMessage(
        m.chat,
        {
            text: `🌸 *𝗪𝗔𝗚𝗨𝗥𝗨 𝗕𝗢𝗧 🌸*\n\n` +
                  `🔄 *Combinando emojis...*\n\n` +
                  `🎭 *Emoji 1:* ${emoji1}\n` +
                  `🎭 *Emoji 2:* ${emoji2}\n` +
                  `⏳ *Creando sticker...*`
        },
        { quoted: m }
    );

    try {
        // Construir URL de la API
        const url = `${API_URL}?emoji1=${encodeURIComponent(emoji1)}&emoji2=${encodeURIComponent(emoji2)}&key=${API_KEY}`;
        console.log('URL API EmojiMix:', url);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'image/*'
            }
        });

        if (!response.ok) {
            throw new Error(`Error API: ${response.status} ${response.statusText}`);
        }

        const contentType = response.headers.get('content-type');
        console.log('Content-Type:', contentType);

        // Verificar que sea una imagen
        if (!contentType || !contentType.includes('image')) {
            const errorText = await response.text();
            console.error('Respuesta no es imagen:', errorText);
            throw new Error('La API no devolvió una imagen válida');
        }

        // Obtener la imagen como buffer
        const imageBuffer = await response.buffer();
        
        // Crear sticker a partir de la imagen
        const sticker = new Sticker(imageBuffer, {
            pack: 'WAGURI BOT',
            author: 'Emoji Mix',
            type: StickerTypes.FULL,
            categories: ['😀'],
            id: '12345',
            quality: 50,
            background: 'transparent'
        });

        // Enviar el sticker
        await conn.sendMessage(
            m.chat,
            await sticker.toMessage(),
            { quoted: m }
        );

        // Reacción ✅
        try {
            await conn.sendReaction(m.chat, m.key, '✅');
        } catch {}

        // Eliminar mensaje de procesamiento
        await conn.sendMessage(m.chat, { delete: processingMsg.key });

    } catch (error) {
        console.error('Error EmojiMix:', error);
        
        // Reacción ❌
        try {
            await conn.sendReaction(m.chat, m.key, '❌');
        } catch {}
        
        // Mensaje de error
        const errorMsg = await conn.sendMessage(
            m.chat,
            {
                text: `🌸 *𝗪𝗔𝗚𝗨𝗥𝗨 𝗕𝗢𝗧 🌸*\n\n` +
                      `❌ *ERROR AL COMBINAR EMOJIS*\n\n` +
                      `🎭 *Emojis:* ${emoji1} + ${emoji2}\n\n` +
                      `⚠️ *Error:* ${error.message}\n\n` +
                      `*Posibles causas:*\n` +
                      `• Esos emojis no se pueden combinar\n` +
                      `• API temporalmente no disponible\n` +
                      `• Formato de emoji no soportado\n\n` +
                      `💡 *Intenta con otras combinaciones:*\n` +
                      `• 😂+😭, 😍+🥰, 😎+🤩\n` +
                      `• 🐶+🐱, 🍕+🍔, ⚽+🏀`
            },
            { quoted: m }
        );

        // Actualizar mensaje de procesamiento
        await conn.sendMessage(
            m.chat,
            { 
                text: "❌ Error en la combinación",
                edit: processingMsg.key 
            }
        );
    }
}

handler.help = ["emojimix <emoji1+emoji2>"];
handler.tags = ["sticker", "fun"];
handler.command = ["emojimix", "mixemoji", "emojifusion", "emojicombine"];
handler.limit = true;
handler.register = true;
handler.group = true;

export default handler;