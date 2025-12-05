import PhoneNumber from 'awesome-phonenumber';

let handler = async (m, { conn }) => {

    await m.react('👋');

    let ownerNumber = '573244642273';


    let vcard = `
BEGIN:VCARD
VERSION:3.0
FN:Propietario
TEL;waid=${ownerNumber}:${PhoneNumber('+' + ownerNumber).getNumber('international')}
END:VCARD`.trim();


    await conn.sendMessage(m.chat, {
        contacts: {
            displayName: 'Propietario',
            contacts: [{ vcard }]
        }
    }, { quoted: m });
}

handler.help = ["owner"];
handler.tags = ["info"];
handler.command = ['owner', 'creador', 'dueño'];

export default handler;