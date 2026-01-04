let handler = async (m, { conn }) => {
  let who;


  if (m.mentionedJid && m.mentionedJid[0]) {
    who = m.mentionedJid[0];
  }

  else if (m.quoted && m.quoted.sender) {
    who = m.quoted.sender;
  }

  else if (m.fromMe) {
    who = conn.user.jid;
  }

  else {
    who = m.sender;
  }

  try {

    let avatarUrl = await conn.profilePictureUrl(who, 'image').catch(() => 'https://telegra.ph/file/24fa902ead26340f3df2c.png');


    let apiUrl = `https://some-random-api.com/canvas/overlay/gay?avatar=${encodeURIComponent(avatarUrl)}`;


    await conn.sendFile(m.chat, apiUrl, 'gay.png', '*¿Quién quiere violar a este gay?* 🏳️‍🌈', m);

  } catch (err) {
    console.error('Error en comando gay:', err);


    if (err.message.includes('profilePictureUrl')) {
      m.reply('⚠️ No se pudo obtener la foto de perfil del usuario.');
    } else if (err.message.includes('sendFile')) {
      m.reply('⚠️ Error al generar o enviar la imagen.');
    } else {
      m.reply('⚠️ Hubo un error al procesar tu solicitud. Intenta de nuevo.');
    }
  }
};

handler.help = ['gay *@user*'];
handler.tags = ['fun'];
handler.command = /^(gey)$/i;

export default handler;
