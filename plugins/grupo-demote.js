// ༻✦༺ ༻✧༺ ༻✦༺ ༻⸙͎۪۫༺ ༻✦༺ ༻✧༺ ༻✦༺
//  Flor Noble - Código de la Casa Waguri  
// ༻✦༺ ༻✧༺ ༻✦༺ ༻⸙͎۪۫༺ ༻✦༺ ༻✧༺ ༻✦༺

const handler = async (m, { conn }) => {
  try {
    let texto = await m.mentionedJid
    let who = texto.length > 0 ? texto[0] : (m.quoted ? await m.quoted.sender : false)
    
    if (!who) return m.reply('*🌸❀* Menciona a un miembro del jardín para revocar sus *pétalos de autoridad*');

    const groupMetadata = await conn.groupMetadata(m.chat);
    const participant = groupMetadata.participants.find(participant => participant.jid === who);

    if (!participant || !participant.admin) {
      return conn.reply(m.chat, `❀ *@${who.split('@')[0]}* no posee los pétalos de administrador en este jardín!`, m, { mentions: [who] });
    }

    if (who === groupMetadata.owner) {
      return m.reply('🌷 El dueño del jardín siempre mantendrá sus pétalos dorados');
    }

    if (who === conn.user.jid) {
      return m.reply('✨ Mis pétalos de administrador son necesarios para cuidar este jardín');
    }

    await conn.groupParticipantsUpdate(m.chat, [who], 'demote');
    await conn.reply(m.chat, `*@${who.split('@')[0]}* ha perdido sus pétalos de autoridad en el jardín`, m, { mentions: [who] });
  } catch (e) {
    await m.reply(`🌺 Un viento inesperado ha impedido esta acción`);
  }
};

handler.help = ['demote'];
handler.tags = ['grupo'];
handler.command = ['demote'];
handler.admin = true;
handler.botAdmin = true;

export default handler;

// ༻✦༺ ༻✧༺ ༻✦༺ ༻⸙͎۪۫༺ ༻✦༺ ༻✧༺ ༻✦༺
//   Que la elegancia florezca en cada línea
// ༻✦༺ ༻✧༺ ༻✦༺ ༻⸙͎۪۫༺ ༻✦༺ ༻✧༺ ༻✦༺
