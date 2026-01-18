// eliminarsub.js - Elimina del grupo Y del servidor (sesión real)

import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs/promises'
import path from 'path'

const execAsync = promisify(exec)

let handler = async (m, { conn, text, usedPrefix, command, isOwner }) => {
  if (!isOwner) return m.reply('❌ Solo owner.')

  if (!text) {
    return m.reply(
      `*🔥 ELIMINAR SUB-BOT COMPLETAMENTE*\n\n` +
      `🔹 ${usedPrefix}eliminarsub @tag - Eliminar del grupo y servidor\n` +
      `🔹 ${usedPrefix}eliminarsub listar - Ver miembros\n` +
      `🔹 ${usedPrefix}eliminarsub todos - Eliminar todos\n\n` +
      `⚠️ *ELIMINA:* Del grupo + Detiene proceso + Borra sesión`
    )
  }

  // Función para eliminar sesión del servidor
  const eliminarDelServidor = async (numero) => {
    try {
      const sessionPath = `./sessions/${numero}`
      const sessionPath2 = `./MysticSession/${numero}`
      const sessionPath3 = `./session/${numero}`
      
      // 1. DETENER PROCESO DEL SUB-BOT
      try {
        // Para PM2
        await execAsync(`pm2 stop ${numero} 2>/dev/null || true`)
        await execAsync(`pm2 delete ${numero} 2>/dev/null || true`)
        
        // Para procesos node directos
        await execAsync(`pkill -f "${numero}" 2>/dev/null || true`)
        await execAsync(`kill $(lsof -t -i:${numero}) 2>/dev/null || true`)
      } catch (e) {}

      // 2. ELIMINAR ARCHIVOS DE SESIÓN
      const carpetasSesion = [sessionPath, sessionPath2, sessionPath3]
      
      for (let carpeta of carpetasSesion) {
        try {
          await fs.access(carpeta)
          await fs.rm(carpeta, { recursive: true, force: true })
          console.log(`✅ Sesión eliminada: ${carpeta}`)
        } catch (e) {}
      }

      // 3. ELIMINAR DE BASE DE DATOS SI EXISTE
      try {
        const dbPath = './database.json'
        if (await fs.access(dbPath).then(() => true).catch(() => false)) {
          const db = JSON.parse(await fs.readFile(dbPath, 'utf8'))
          if (db.users && db.users[`${numero}@s.whatsapp.net`]) {
            delete db.users[`${numero}@s.whatsapp.net`]
            await fs.writeFile(dbPath, JSON.stringify(db, null, 2))
          }
        }
      } catch (e) {}

      return true
    } catch (error) {
      console.error('Error eliminando del servidor:', error)
      return false
    }
  }

  // COMANDO: listar
  if (text.toLowerCase() === 'listar') {
    try {
      const group = await conn.groupMetadata(m.chat)
      const participantes = group.participants
      
      let mensaje = `📋 *MIEMBROS (${participantes.length})*\n\n`
      let i = 1
      
      participantes.forEach(p => {
        const nombre = p.name || p.notify || 'Sin nombre'
        const numero = p.id.split('@')[0]
        const esBot = p.id === conn.user.id
        const esOwner = p.id === m.sender
        
        mensaje += `${i}. ${esBot ? '🤖 ' : ''}${esOwner ? '👑 ' : ''}*${nombre}*\n`
        mensaje += `   📱 ${numero}\n`
        if (!esBot && !esOwner) {
          mensaje += `   🔥 ${usedPrefix}eliminarsub ${numero}\n`
        }
        mensaje += `   👤 ${p.admin ? 'Admin' : 'Miembro'}\n\n`
        i++
      })
      
      m.reply(mensaje)
    } catch (e) {
      m.reply('❌ Error al listar')
    }
    return
  }

  // COMANDO: todos
  if (text.toLowerCase() === 'todos') {
    try {
      const group = await conn.groupMetadata(m.chat)
      const participantes = group.participants
      
      // Filtrar solo posibles sub-bots
      const posiblesSubs = participantes.filter(p => {
        if (p.id === conn.user.id) return false
        if (p.id === m.sender) return false
        
        const num = p.id.split('@')[0]
        const nombre = p.name || p.notify || ''
        
        // Detectar sub-bots por patrones
        return (
          nombre.includes('Bot') || 
          nombre.includes('Sub') || 
          nombre.includes('Clone') ||
          /^\d+$/.test(nombre) ||
          nombre.length < 3 ||
          num.startsWith('1') ||
          num.length > 12
        )
      })

      if (posiblesSubs.length === 0) {
        return m.reply('❌ No hay sub-bots detectados')
      }

      m.reply(`⚠️ *ELIMINAR ${posiblesSubs.length} SUB-BOTS*\n\n¿Continuar? Responde *"sí"*`)

      // Esperar confirmación
      const confirm = await conn.waitForMessage(
        m.chat,
        msg => msg.sender === m.sender && 
               (msg.text?.toLowerCase() === 'sí' || msg.text?.toLowerCase() === 'si'),
        { timeout: 15000 }
      )

      if (!confirm) return m.reply('❌ Cancelado')

      let eliminadosGrupo = 0
      let eliminadosServidor = 0
      let resultados = []

      for (let sub of posiblesSubs) {
        try {
          const num = sub.id.split('@')[0]
          const nombre = sub.name || sub.notify || num
          
          // 1. Eliminar del grupo
          await conn.groupParticipantsUpdate(m.chat, [sub.id], 'remove')
          eliminadosGrupo++
          
          // 2. Eliminar del servidor
          const servidorEliminado = await eliminarDelServidor(num)
          if (servidorEliminado) eliminadosServidor++
          
          resultados.push(`${servidorEliminado ? '✅' : '⚠️'} ${nombre}`)
          
          // Esperar entre eliminaciones
          await new Promise(r => setTimeout(r, 2000))
          
        } catch (e) {
          resultados.push(`❌ Error`)
        }
      }

      m.reply(
        `🔥 *ELIMINACIÓN COMPLETADA*\n\n` +
        `✅ Del grupo: ${eliminadosGrupo}\n` +
        `✅ Del servidor: ${eliminadosServidor}\n` +
        `🤖 Total: ${posiblesSubs.length}\n\n` +
        `📋 Resultados:\n${resultados.slice(0, 10).join('\n')}` +
        (resultados.length > 10 ? `\n... y ${resultados.length - 10} más` : '')
      )

    } catch (error) {
      m.reply(`❌ Error: ${error.message}`)
    }
    return
  }

  // COMANDO: eliminar por @tag o número
  try {
    let targetJid = ''
    
    if (m.quoted) {
      targetJid = m.quoted.sender
    } else if (m.mentionedJid && m.mentionedJid.length > 0) {
      targetJid = m.mentionedJid[0]
    } else if (text.includes('@')) {
      targetJid = text.includes('s.whatsapp.net') ? text : text + '@s.whatsapp.net'
    } else {
      const soloNum = text.replace(/\D/g, '')
      if (soloNum.length >= 10) {
        targetJid = soloNum + '@s.whatsapp.net'
      } else {
        return m.reply('❌ Usa: @tag o número')
      }
    }

    // Verificar
    if (targetJid === conn.user.id) return m.reply('❌ No soy un sub-bot')
    if (targetJid === m.sender) return m.reply('❌ No puedes eliminarte')

    const group = await conn.groupMetadata(m.chat)
    const participantes = group.participants
    const usuario = participantes.find(p => p.id === targetJid)
    
    if (!usuario) return m.reply('❌ No está en el grupo')

    const num = targetJid.split('@')[0]
    const nombre = usuario.name || usuario.notify || num

    // Preguntar confirmación
    m.reply(
      `⚠️ *¿ELIMINAR A ${nombre}?*\n\n` +
      `Se eliminará:\n` +
      `1. Del grupo actual\n` +
      `2. Del servidor (sesión)\n\n` +
      `Responde *"sí"* para confirmar`
    )

    const confirm = await conn.waitForMessage(
      m.chat,
      msg => msg.sender === m.sender && 
             (msg.text?.toLowerCase() === 'sí' || msg.text?.toLowerCase() === 'si'),
      { timeout: 15000 }
    )

    if (!confirm) return m.reply('❌ Cancelado')

    // 1. ELIMINAR DEL GRUPO
    await conn.groupParticipantsUpdate(m.chat, [targetJid], 'remove')
    
    // 2. ELIMINAR DEL SERVIDOR
    const servidorEliminado = await eliminarDelServidor(num)

    m.reply(
      `🔥 *SUB-BOT ELIMINADO COMPLETAMENTE*\n\n` +
      `📛 *Nombre:* ${nombre}\n` +
      `📱 *Número:* ${num}\n` +
      `✅ *Grupo:* Eliminado\n` +
      `${servidorEliminado ? '✅' : '⚠️'} *Servidor:* ${servidorEliminado ? 'Sesión eliminada' : 'No se pudo eliminar sesión'}\n\n` +
      `📍 El sub-bot ha dejado de funcionar.`
    )

  } catch (error) {
    m.reply(`❌ Error: ${error.message}`)
  }
}

// Configuración
handler.help = ['eliminarsub @tag']
handler.tags = ['owner']
handler.command = /^(eliminarsub|killbot|destruir)$/i
handler.group = true
handler.botAdmin = true
handler.admin = true
handler.owner = true

export default handler