/* Codigo hecho por @Fabri115 y mejorado por BrunoSobrino */

import { readdirSync, unlinkSync, existsSync, promises as fs, rmSync } from 'fs'
import path from 'path'

var handler = async (m, { conn, usedPrefix }) => {

  // Verificar si es el bot principal
  if (global.conn.user.jid !== conn.user.jid) {
    return conn.reply(m.chat, `⚠️ *ACCESO DENEGADO*\n\nUtiliza este comando directamente en el número principal del Bot.`, m)
  }
  
  // Variables emoji (debes definirlas en tu código global)
  const rwait = '⌛' // o el emoji que uses
  const done = '✅' // o el emoji que uses
  const sessions = 'sessions' // carpeta de sesiones
  
  await conn.reply(m.chat, `🔄 *LIMPIANDO SESIONES...*\nPor favor espera...`, m)
  m.react(rwait)

  let sessionPath = `./${sessions}/`

  try {
    // Verificar si la carpeta existe
    if (!existsSync(sessionPath)) {
      return await conn.reply(m.chat, `📁 *CARPETA NO ENCONTRADA*\n\nLa carpeta '${sessions}' no existe.`, m)
    }
    
    // Leer archivos de la carpeta
    let files = await fs.readdir(sessionPath)
    
    // Filtrar para mantener creds.json
    const filesToDelete = files.filter(file => file !== 'creds.json')
    
    if (filesToDelete.length === 0) {
      return await conn.reply(m.chat, `📂 *CARPETA VACÍA*\n\nNo hay archivos para eliminar (excepto creds.json).`, m)
    }
    
    let filesDeleted = 0
    let errors = []
    
    // Eliminar archivos uno por uno
    for (const file of filesToDelete) {
      try {
        const filePath = path.join(sessionPath, file)
        const stat = await fs.stat(filePath)
        
        if (stat.isDirectory()) {
          // Si es carpeta, eliminarla recursivamente
          await fs.rm(filePath, { recursive: true, force: true })
        } else {
          // Si es archivo, eliminarlo
          await fs.unlink(filePath)
        }
        filesDeleted++
        
      } catch (fileError) {
        errors.push(`${file}: ${fileError.message}`)
      }
    }
    
    // Enviar resultados
    m.react(done)
    
    let resultMessage = `🗑️ *LIMPIEZA COMPLETADA*\n\n`
    resultMessage += `📊 *RESULTADOS:*\n`
    resultMessage += `✅ Archivos eliminados: ${filesDeleted}\n`
    resultMessage += `📁 Total archivos: ${files.length}\n`
    resultMessage += `🔐 Creds.json: Preservado\n\n`
    
    if (errors.length > 0) {
      resultMessage += `⚠️ *ERRORES:*\n`
      resultMessage += errors.slice(0, 5).join('\n')
      if (errors.length > 5) {
        resultMessage += `\n... y ${errors.length - 5} errores más`
      }
    } else {
      resultMessage += `✨ Todos los archivos se eliminaron correctamente.`
    }
    
    await conn.reply(m.chat, resultMessage, m)
    
    // Opcional: mensaje divertido
    if (filesDeleted > 0) {
      setTimeout(() => {
        conn.reply(m.chat, `😏 *NOTA:*\nSi me ves eliminando sesiones... ¡eres bien curioso!`, m)
      }, 1000)
    }

  } catch (err) {
    console.error('❌ Error al limpiar sesiones:', err)
    
    let errorMessage = `❌ *ERROR CRÍTICO*\n\n`
    errorMessage += `No se pudo completar la limpieza:\n`
    errorMessage += `\`\`\`${err.message}\`\`\`\n\n`
    errorMessage += `📍 Ruta intentada: ${sessionPath}\n`
    errorMessage += `🔧 Verifica permisos y que la carpeta exista.`
    
    await conn.reply(m.chat, errorMessage, m)
  }

}

handler.help = ['delai', 'dsowner', 'clearallsession', 'limpiarsesiones']
handler.tags = ['owner']
handler.command = /^(delai|dsowner|clearallsession|limpiarsesiones|clearsession)$/i
handler.rowner = true
handler.botAdmin = false
handler.group = false

export default handler