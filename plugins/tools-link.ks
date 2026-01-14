// by Rufino 
async function handler(m, { conn }) {
    const communityLink = 'https://chat.whatsapp.com/LRQrf8vv50BDtwN8JWfhrX';
    const channelLink = 'https://whatsapp.com/channel/0029VbBUHyQCsU9IpJ0oIO2i';
    
    const message = `🌸 *𝗪𝗔𝗚𝗨𝗥𝗜 𝗕𝗢𝗧 🌸*\n\n` +
                   `🔗 *ENLACES DE LA COMUNIDAD*\n\n` +
                   `📱 *Grupo de WhatsApp:*\n` +
                   `\`\`\`${communityLink}\`\`\`\n\n` +
                   `📢 *Canal Oficial:*\n` +
                   `\`\`\`${channelLink}\`\`\`\n\n` +
                   `*¡Únete a nuestras comunidades!* 🎉`;
    
    await conn.sendMessage(m.chat, { text: message, quoted: m });
}

handler.help = ["links"];
handler.tags = ["info"];
handler.command = ["links", "grupo", "canal"];
handler.limit = false;
handler.register = true;
handler.group = true;

export default handler;