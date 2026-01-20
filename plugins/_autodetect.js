import chalk from 'chalk'
import fetch from 'node-fetch'
import ws from 'ws'
let WAMessageStubType = (await import('@whiskeysockets/baileys')).default
import { readdirSync, unlinkSync, existsSync, promises as fs, rmSync } from 'fs'
import path from 'path'

let handler = m => m
handler.before = async function (m, { conn, participants, groupMetadata }) {
if (!m.messageStubType || !m.isGroup) return
const fkontak = { "key": { "participants":"0@s.whatsapp.net", "remoteJid": "status@broadcast", "fromMe": false, "id": "Halo" }, "message": { "contactMessage": { "vcard": `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD` }}, "participant": "0@s.whatsapp.net"}  
let chat = global.db.data.chats[m.chat]
let usuario = `@${m.sender.split`@`[0]}`
let pp = await conn.profilePictureUrl(m.chat, 'image').catch(_ => null) || 'https://files.catbox.moe/92bez6.jpeg'

if (!m.messageStubParameters || !Array.isArray(m.messageStubParameters)) {
  return
}

let nombre, foto, edit, newlink, status, admingp, noadmingp
nombre = `⚽ ${usuario} Ha cambiado el nombre del equipo.\n\n> 🏃‍♂️ Ahora el equipo se llama:\n> *${m.messageStubParameters[0] || 'Sin nombre'}*.`
foto = `⚽ Se ha cambiado la imagen del equipo.\n\n> 🔥 Acción realizada por:\n> » ${usuario}`
edit = `⚽ ${usuario} Ha permitido que ${m.messageStubParameters[0] == 'on' ? 'solo capitanes' : 'todos'} puedan configurar el equipo.`
newlink = `⚽ El enlace del equipo ha sido restablecido.\n\n> ⚽ Acción realizada por:\n> » ${usuario}`
status = `⚽ El equipo ha sido ${m.messageStubParameters[0] == 'on' ? '*cerrado*' : '*abierto*'} Por ${usuario}\n\n> 🔥 Ahora ${m.messageStubParameters[0] == 'on' ? '*solo capitanes*' : '*todos*'} pueden enviar mensajes.`
admingp = `⚽ @${m.messageStubParameters[0] && m.messageStubParameters[0].split ? m.messageStubParameters[0].split`@`[0] : 'jugador'} Ahora es capitán del equipo.\n\n> 🏃‍♂️ Acción realizada por:\n> » ${usuario}`
noadmingp = `⚽ @${m.messageStubParameters[0] && m.messageStubParameters[0].split ? m.messageStubParameters[0].split`@`[0] : 'jugador'} Deja de ser capitán del equipo.\n\n> 🔥 Acción realizada por:\n> » ${usuario}`

if (chat.detect && m.messageStubType == 2) {
const uniqid = (m.isGroup ? m.chat : m.sender)
const sessionPath = './Sessions/'
for (const file of await fs.readdir(sessionPath)) {
if (file.includes(uniqid)) {
await fs.unlink(path.join(sessionPath, file))
console.log(`${chalk.yellow.bold('[ Archivo Eliminado ]')} ${chalk.greenBright(`'${file}'`)}\n` +
`${chalk.blue('(Session PreKey)')} ${chalk.redBright('que provoca el "undefined" en el chat')}`
)}}

} else if (chat.detect && m.messageStubType == 21) {
await this.sendMessage(m.chat, { text: nombre, mentions: [m.sender] }, { quoted: fkontak })  
} else if (chat.detect && m.messageStubType == 22) {
await this.sendMessage(m.chat, { image: { url: pp }, caption: foto, mentions: [m.sender] }, { quoted: fkontak })
} else if (chat.detect && m.messageStubType == 23) {
await this.sendMessage(m.chat, { text: newlink, mentions: [m.sender] }, { quoted: fkontak })
} else if (chat.detect && m.messageStubType == 25) {
await this.sendMessage(m.chat, { text: edit, mentions: [m.sender] }, { quoted: fkontak })  
} else if (chat.detect && m.messageStubType == 26) {
await this.sendMessage(m.chat, { text: status, mentions: [m.sender] }, { quoted: fkontak })  
} else if (chat.detect && m.messageStubType == 29) {
if (m.messageStubParameters[0]) {
await this.sendMessage(m.chat, { text: admingp, mentions: [`${m.sender}`,`${m.messageStubParameters[0]}`] }, { quoted: fkontak })
}
} else if (chat.detect && m.messageStubType == 30) {
if (m.messageStubParameters[0]) {
await this.sendMessage(m.chat, { text: noadmingp, mentions: [`${m.sender}`,`${m.messageStubParameters[0]}`] }, { quoted: fkontak })
}
} else {
if (m.messageStubType == 2) return
console.log({messageStubType: m.messageStubType,
messageStubParameters: m.messageStubParameters,
type: WAMessageStubType[m.messageStubType], 
})
}}
export default handler