async function handler(m, { conn }) {
    const communityLink = 'https://chat.whatsapp.com/LRQrf8vv50BDtwN8JWfhrX';
    const channelLink = 'https://whatsapp.com/channel/0029VbBUHyQCsU9IpJ0oIO2i';
    
    const message = `🌸 *𝗪𝗔𝗚𝗨𝗥𝗜 𝗕𝗢𝗧 🌸*\n\n` +
                   `🌟 *¡CONÉCTATE CON NOSOTROS!* 🌟\n\n` +
                   `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                   `📱 *GRUPO DE LA COMUNIDAD*\n` +
                   `━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
                   `💬 *Chat en vivo con la comunidad*\n` +
                   `🔗 *Enlace:*\n\`\`\`${communityLink}\`\`\`\n\n` +
                   `✨ *Beneficios del grupo:*\n` +
                   `• 💬 Chat activo y soporte\n` +
                   `• 🤝 Ayuda entre usuarios\n` +
                   `• 🎮 Eventos y juegos\n` +
                   `• 📢 Anuncios importantes\n` +
                   `• ❓ Preguntas y respuestas\n\n` +
                   `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                   `📢 *CANAL OFICIAL*\n` +
                   `━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
                   `📡 *Recibe noticias directamente*\n` +
                   `🔗 *Enlace:*\n\`\`\`${channelLink}\`\`\`\n\n` +
                   `✨ *Beneficios del canal:*\n` +
                   `• 📢 Anuncios oficiales\n` +
                   `• 🚀 Novedades del bot\n` +
                   `• 🔄 Actualizaciones\n` +
                   `• 🎁 Sorteos exclusivos\n` +
                   `• ⭐ Contenido premium\n\n` +
                   `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                   `📌 *INSTRUCCIONES*\n` +
                   `━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
                   `*Para unirte al grupo:*\n` +
                   `1. Haz clic en el enlace del grupo\n` +
                   `2. Toca "Unirse al grupo"\n` +
                   `3. ¡Listo! Ya estás en la comunidad\n\n` +
                   `*Para seguir el canal:*\n` +
                   `1. Haz clic en el enlace del canal\n` +
                   `2. Toca "Seguir"\n` +
                   `3. Recibirás noticias automáticamente\n\n` +
                   `*¡Te esperamos en ambas comunidades!* 🎉\n` +
                   `🌸 *𝗪𝗔𝗚𝗨𝗥𝗜 𝗕𝗢𝗧 🌸*`;
    
    await conn.sendMessage(m.chat, 
        { 
            text: message,
            quoted: m 
        }
    );
}

handler.help = ["links", "grupo", "canal", "comunidad"];
handler.tags = ["información", "comunidad"];
handler.command = ["links", "grupo", "canal", "comunidad", "welcome", "unirse"];
handler.limit = false;
handler.register = true;
handler.group = true;
handler.premium = false;

export default handler;