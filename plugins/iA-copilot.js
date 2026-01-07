import fetch from 'node-fetch';

const API_KEY = 'stellar-dXXUtmL2';
const API_URL = 'https://rest.alyabotpe.xyz/ai/copilot';

async function handler(m, { text, conn, usedPrefix, command }) {
    // Verificar si el usuario está registrado
    const user = global.db.data.users[m.sender];
    if (!user || !user.registered) {
        await conn.sendMessage(m.chat, { react: { text: "🔒", key: m.key } });
        return m.reply(
            `🔒 *REGISTRO REQUERIDO* 🔒\n\n` +
            `Para usar el comando *${command}* necesitas estar registrado.\n\n` +
            `📋 *Regístrate con:*\n` +
            `${usedPrefix}reg nombre.edad\n\n` +
            `*Ejemplo:* ${usedPrefix}reg ${conn.getName(m.sender) || 'Usuario'}.18\n\n` +
            `¡Regístrate para usar Copilot! 🤖`
        );
    }

    if (!text) {
        return m.reply("Por favor, ingresa una petición para Copilot.\n> *Ejemplo:* .copilot ¿quién eres?");
    }

    const processingMsg = await conn.sendMessage(
        m.chat, 
        { text: '> *Copilot está procesando tu petición...*' }, 
        { quoted: m }
    );

    try {
        const url = `${API_URL}?text=${encodeURIComponent(text)}&key=${API_KEY}`;
        const res = await fetch(url);
        const data = await res.json();
        const responseText = data.result || data.response || data.answer || data.text || data.message;

        await conn.sendMessage(
            m.chat,
            { 
                text: `${responseText}`,
                edit: processingMsg.key 
            }
        );

    } catch (error) {
        console.error('Error en Copilot:', error);

        await conn.sendMessage(
            m.chat,
            { 
                text: "❌ Error al conectar con Copilot",
                edit: processingMsg.key 
            }
        );
    }
}

handler.help = ["copilot"];
handler.tags = ["ai"];
handler.command = ["copilot"];
handler.limit = true;
handler.register = true;
handler.group = true;

export default handler;