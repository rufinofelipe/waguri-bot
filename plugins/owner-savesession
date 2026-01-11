// savesession.js - Solo owner
import fs from 'fs'

let handler = async (m, { conn, isOwner }) => {
  if (!isOwner) return
  
  try {
    const sessionFile = './session.json'
    const state = {
      creds: conn.authState.creds,
      keys: conn.authState.keys
    }
    
    fs.writeFileSync(sessionFile, JSON.stringify(state, null, 2))
    
    const fileSize = (fs.statSync(sessionFile).size / 1024).toFixed(2)
    
    await m.reply(`
✅ *SESIÓN GUARDADA*
📁 Archivo: session.json
📊 Tamaño: ${fileSize} KB
📍 Ruta: ${process.cwd()}/session.json
💡 Reinicia sin QR con esta sesión
    `)
    
  } catch (error) {
    await m.reply(`❌ Error: ${error.message}`)
  }
}

handler.help = ['savesession']
handler.tags = ['owner']
handler.command = /^(savesession|guardsession|backupsession)$/i
handler.owner = true
export default handler