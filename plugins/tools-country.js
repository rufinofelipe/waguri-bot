// ============================================
// COMANDO: COUNTRY (Información de país)
// Archivo: country.js
// ============================================
import fetch from 'node-fetch';

const API_KEY = 'stellar-yJFoP0BO';
const API_URL = 'https://rest.alyabotpe.xyz/tools/country';

async function handler(m, { text, conn }) {
    if (!text) {
        return m.reply(`🌸 *𝗪𝗔𝗚𝗨𝗥𝗨 𝗕𝗢𝗧 🌸*\n\n` +
                      `🌍 *INFORMACIÓN DE PAÍS*\n\n` +
                      `❌ *Ingresa un país*\n\n` +
                      `*Uso:* .country [país]\n` +
                      `*Ejemplo:* .country Perú\n` +
                      `*Ejemplo:* .country Mexico`);
    }

    const pais = text.trim();
    const waitMsg = await m.reply(`🔍 Buscando información de ${pais}...`);

    try {
        const url = `${API_URL}?country=${encodeURIComponent(pais)}&key=${API_KEY}`;
        console.log('URL Country:', url);
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Respuesta Country:', JSON.stringify(data, null, 2));
        
        // Verificar si hay error
        if (data.status === false || data.error) {
            throw new Error(data.message || data.error || 'País no encontrado');
        }
        
        const result = data.result || data.data || data;
        
        // Construir mensaje
        let message = `🌸 *𝗪𝗔𝗚𝗨𝗥𝗨 𝗕𝗢𝗧 🌸*\n\n`;
        message += `🌍 *INFORMACIÓN DE PAÍS*\n\n`;
        
        if (result.name) message += `🏛️ *País:* ${result.name}\n`;
        if (result.capital) message += `📍 *Capital:* ${result.capital}\n`;
        if (result.region) message += `🗺️ *Región:* ${result.region}\n`;
        if (result.subregion) message += `🌐 *Subregión:* ${result.subregion}\n`;
        if (result.population) message += `👥 *Población:* ${result.population.toLocaleString()}\n`;
        if (result.area) message += `📏 *Área:* ${result.area.toLocaleString()} km²\n`;
        if (result.languages) {
            const langs = Array.isArray(result.languages) ? result.languages.join(', ') : result.languages;
            message += `🗣️ *Idiomas:* ${langs}\n`;
        }
        if (result.currencies) {
            const currencies = Object.values(result.currencies).map(c => c.name).join(', ');
            message += `💰 *Monedas:* ${currencies}\n`;
        }
        if (result.timezones) {
            const timezones = Array.isArray(result.timezones) ? result.timezones.slice(0, 3).join(', ') : result.timezones;
            message += `⏰ *Zonas horarias:* ${timezones}\n`;
        }
        if (result.flag) {
            message += `🎌 *Bandera:* ${result.flag}\n`;
        }
        if (result.callingCodes) {
            const codes = Array.isArray(result.callingCodes) ? result.callingCodes.join(', ') : result.callingCodes;
            message += `📞 *Código telefónico:* +${codes}\n`;
        }
        
        message += `\n━━━━━━━━━━━━━━━━━━━━\n✨ *Información obtenida*`;
        
        await conn.sendMessage(m.chat, { text: message }, { quoted: m });
        await conn.sendMessage(m.chat, { delete: waitMsg.key });
        
    } catch (error) {
        console.error('Error Country:', error);
        await m.reply(`❌ Error al buscar información de ${pais}: ${error.message}`);
        try { await conn.sendMessage(m.chat, { delete: waitMsg.key }); } catch {}
    }
}

handler.help = ['country <país>'];
handler.tags = ['tools'];
handler.command = ['country', 'pais', 'infopais'];
handler.group = true;
handler.limit = true;

export default handler;