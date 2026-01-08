import fs from 'fs'
import path from 'path'

// Archivo de registro para tracking
const logFolder = './kicklogs'
if (!fs.existsSync(logFolder)) {
    fs.mkdirSync(logFolder, { recursive: true })
}

function getLogFilePath(groupId) {
    return path.join(logFolder, `${groupId}.json`)
}

let handler = async (m, { conn, usedPrefix, command }) => {
    // Verificar si el usuario está registrado
    const user = global.db.data.users[m.sender];
    if (!user || !user.registered) {
        await conn.sendMessage(m.chat, { react: { text: "🔒", key: m.key } });
        return conn.reply(m.chat, 
            `🔒 *REGISTRO REQUERIDO* 🔒\n\n` +
            `Para usar el comando *${command}* necesitas estar registrado.\n\n` +
            `📋 *Regístrate con:*\n` +
            `${usedPrefix}reg nombre.edad\n\n` +
            `*Ejemplo:* ${usedPrefix}reg ${conn.getName(m.sender) || 'Usuario'}.18\n\n` +
            `¡Esta función requiere verificación especial! ⚠️`,
            m
        );
    }

    // Verificar si es propietario del bot o superusuario
    const isOwner = global.owner.includes(m.sender.replace(/[^0-9]/g, '') + '@s.whatsapp.net')
    if (!isOwner) {
        return conn.reply(m.chat, 
            `⚠️ *ACCESO RESTRINGIDO*\n\n` +
            `Este comando solo puede ser usado por el propietario del bot.\n\n` +
            `🔐 Función de alto riesgo para administración exclusiva.`,
            m
        )
    }

    // Verificar si está en un grupo
    if (!m.isGroup) {
        return conn.reply(m.chat, 
            `❌ *SOLO EN GRUPOS*\n\n` +
            `Este comando solo funciona en grupos de WhatsApp.\n\n` +
            `📌 Únete o crea un grupo para usar esta función.`,
            m
        )
    }

    // Verificar si es administrador del grupo
    let groupMetadata
    try {
        groupMetadata = await conn.groupMetadata(m.chat)
    } catch (error) {
        return conn.reply(m.chat, 
            `❌ *ERROR AL OBTENER INFORMACIÓN*\n\n` +
            `No se pudo obtener la información del grupo.\n\n` +
            `🔧 Verifica que el bot tenga permisos de administrador.`,
            m
        )
    }

    const participants = groupMetadata.participants
    const sender = participants.find(p => p.id === m.sender)
    
    if (!sender || !sender.admin) {
        return conn.reply(m.chat, 
            `⚠️ *PERMISOS INSUFICIENTES*\n\n` +
            `Necesitas ser administrador del grupo para usar este comando.\n\n` +
            `👑 Solo administradores pueden eliminar miembros.`,
            m
        )
    }

    // Verificar si el bot es administrador
    const botParticipant = participants.find(p => p.id === conn.user.jid)
    if (!botParticipant || !botParticipant.admin) {
        return conn.reply(m.chat, 
            `🤖 *BOT NO ES ADMIN*\n\n` +
            `El bot necesita ser administrador para eliminar miembros.\n\n` +
            `⚙️ Concede permisos de administrador al bot primero.`,
            m
        )
    }

    // Solicitar confirmación
    const args = m.text.split(' ')
    if (args.length < 2 || args[1].toLowerCase() !== 'confirmar') {
        const memberCount = participants.length
        const adminCount = participants.filter(p => p.admin).length
        
        return conn.reply(m.chat, 
            `⚠️⚠️⚠️ *ADVERTENCIA CRÍTICA* ⚠️⚠️⚠️\n\n` +
            `Estás a punto de eliminar a *TODOS* los miembros del grupo.\n\n` +
            `📊 *Estadísticas del grupo:*\n` +
            `• Miembros totales: ${memberCount}\n` +
            `• Administradores: ${adminCount}\n` +
            `• No administradores: ${memberCount - adminCount}\n\n` +
            `🚨 *CONSECUENCIAS:*\n` +
            `• Todos los miembros serán eliminados\n` +
            `• Solo quedarán los administradores\n` +
            `• Esta acción NO se puede deshacer\n\n` +
            `✅ *Para confirmar esta acción peligrosa, escribe:*\n` +
            `${usedPrefix}${command} confirmar\n\n` +
            `❌ *Para cancelar, ignora este mensaje*`,
            m
        )
    }

    try {
        // Enviar reacción de procesando
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
        
        const warningMsg = await conn.reply(m.chat, 
            `🚨 *INICIANDO ELIMINACIÓN MASIVA* 🚨\n\n` +
            `⚠️ *Advertencia final:* Esta acción eliminará a todos los miembros no administradores.\n\n` +
            `⏳ Procesando lista de miembros...`,
            m
        )

        // Filtrar miembros (no eliminar administradores)
        const nonAdminMembers = participants
            .filter(p => !p.admin && p.id !== conn.user.jid)
            .map(p => p.id)
        
        const totalToRemove = nonAdminMembers.length
        
        if (totalToRemove === 0) {
            await conn.sendMessage(m.chat, { react: { text: "ℹ️", key: m.key } });
            return conn.reply(m.chat, 
                `ℹ️ *NO HAY MIEMBROS PARA ELIMINAR*\n\n` +
                `Todos los miembros del grupo son administradores.\n\n` +
                `👑 No se puede eliminar a otros administradores.`,
                m
            )
        }

        // Crear registro
        const logData = {
            groupId: m.chat,
            groupName: groupMetadata.subject,
            remover: m.sender,
            removerName: conn.getName(m.sender),
            date: new Date().toISOString(),
            totalMembers: participants.length,
            removedCount: totalToRemove,
            remainingAdmins: participants.filter(p => p.admin).length,
            removedMembers: nonAdminMembers.map(id => ({
                id: id,
                name: conn.getName(id) || 'Desconocido'
            }))
        }
        
        // Guardar registro
        fs.writeFileSync(getLogFilePath(m.chat), JSON.stringify(logData, null, 2))

        // Actualizar mensaje
        await conn.sendMessage(m.chat, {
            text: `🚨 *ELIMINACIÓN EN PROGRESO* 🚨\n\n` +
                 `📊 *Estadísticas:*\n` +
                 `• Miembros a eliminar: ${totalToRemove}\n` +
                 `• Administradores que permanecen: ${participants.filter(p => p.admin).length}\n\n` +
                 `⏳ Eliminando miembros...\n` +
                 `🔄 Progreso: 0/${totalToRemove}`,
            edit: warningMsg.key
        })

        // Contadores
        let successCount = 0
        let failCount = 0
        const failedMembers = []

        // Eliminar miembros en lotes para no saturar
        for (let i = 0; i < nonAdminMembers.length; i++) {
            const memberId = nonAdminMembers[i]
            const memberName = conn.getName(memberId) || 'Miembro'
            
            try {
                // Pequeña pausa para evitar límites de WhatsApp
                if (i > 0 && i % 5 === 0) {
                    await new Promise(resolve => setTimeout(resolve, 2000))
                    
                    // Actualizar progreso
                    await conn.sendMessage(m.chat, {
                        text: `🚨 *ELIMINACIÓN EN PROGRESO* 🚨\n\n` +
                             `📊 *Estadísticas:*\n` +
                             `• Miembros a eliminar: ${totalToRemove}\n` +
                             `• Eliminados exitosamente: ${successCount}\n` +
                             `• Fallos: ${failCount}\n\n` +
                             `⏳ Progreso: ${i + 1}/${totalToRemove}`,
                        edit: warningMsg.key
                    })
                }
                
                // Eliminar miembro
                await conn.groupParticipantsUpdate(m.chat, [memberId], 'remove')
                successCount++
                
            } catch (memberError) {
                console.error(`Error eliminando ${memberName}:`, memberError)
                failCount++
                failedMembers.push({
                    id: memberId,
                    name: memberName,
                    error: memberError.message
                })
                
                // Continuar con los siguientes miembros
                continue
            }
        }

        // Actualizar log con resultados
        logData.successCount = successCount
        logData.failCount = failCount
        logData.failedMembers = failedMembers
        logData.completionDate = new Date().toISOString()
        fs.writeFileSync(getLogFilePath(m.chat), JSON.stringify(logData, null, 2))

        // Enviar reacción de finalización
        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

        // Mensaje de resumen
        const summaryMessage = `✅ *ELIMINACIÓN MASIVA COMPLETADA* ✅\n\n` +
                              `📊 *RESULTADOS FINALES:*\n\n` +
                              `• Miembros procesados: ${totalToRemove}\n` +
                              `• ✅ Eliminados exitosamente: ${successCount}\n` +
                              `• ❌ Fallos: ${failCount}\n` +
                              `• 👑 Administradores restantes: ${participants.filter(p => p.admin).length}\n\n` +
                              `📅 *Fecha:* ${new Date().toLocaleString()}\n` +
                              `👤 *Ejecutado por:* ${conn.getName(m.sender)}\n\n`
        
        if (failCount > 0) {
            await conn.reply(m.chat, 
                summaryMessage +
                `⚠️ *MIEMBROS NO ELIMINADOS:*\n` +
                failedMembers.map((m, idx) => `${idx + 1}. ${m.name}`).join('\n') + '\n\n' +
                `🔧 *Posibles causas:*\n` +
                `• El miembro ya abandonó el grupo\n` +
                `• Problemas de conexión\n` +
                `• Límites de WhatsApp`,
                m
            )
        } else {
            await conn.reply(m.chat, summaryMessage, m)
        }

        // Enviar mensaje al grupo sobre lo sucedido
        await conn.sendMessage(m.chat, {
            text: `👋 *NOTIFICACIÓN AL GRUPO*\n\n` +
                 `Se ha realizado una limpieza masiva de miembros.\n\n` +
                 `ℹ️ Si recibiste este mensaje, eres administrador del grupo.\n` +
                 `🌸 El grupo ha sido limpiado exitosamente.`,
            mentions: participants.filter(p => p.admin).map(p => p.id)
        })

    } catch (error) {
        console.error('Error en eliminación masiva:', error)
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        return conn.reply(m.chat, 
            `❌ *ERROR CRÍTICO*\n\n` +
            `Ocurrió un error durante la eliminación masiva.\n\n` +
            `*Detalles:* ${error.message}\n\n` +
            `🔧 *Posibles causas:*\n` +
            `• El bot perdió permisos de administrador\n` +
            `• Problemas de conexión con WhatsApp\n` +
            `• Límites de la API alcanzados\n\n` +
            `⚠️ La operación fue interrumpida.`,
            m
        )
    }
}

// Comando para ver logs
handler.verlogs = async (m, { conn, usedPrefix, command }) => {
    const user = global.db.data.users[m.sender];
    if (!user || !user.registered) {
        await conn.sendMessage(m.chat, { react: { text: "🔒", key: m.key } });
        return conn.reply(m.chat, 
            `🔒 *REGISTRO REQUERIDO* 🔒\n\n` +
            `Para usar el comando *${command}* necesitas estar registrado.`,
            m
        )
    }

    const isOwner = global.owner.includes(m.sender.replace(/[^0-9]/g, '') + '@s.whatsapp.net')
    if (!isOwner) {
        return conn.reply(m.chat, 
            `⚠️ *ACCESO RESTRINGIDO*\n\n` +
            `Solo el propietario puede ver los logs.`,
            m
        )
    }

    const logPath = getLogFilePath(m.chat)
    if (!fs.existsSync(logPath)) {
        return conn.reply(m.chat, 
            `📁 *NO HAY REGISTROS*\n\n` +
            `No se encontraron logs de eliminación para este grupo.`,
            m
        )
    }

    try {
        const logData = JSON.parse(fs.readFileSync(logPath, 'utf-8'))
        const logText = `📊 *REGISTRO DE ELIMINACIÓN MASIVA*\n\n` +
                       `• *Grupo:* ${logData.groupName || 'Desconocido'}\n` +
                       `• *Fecha:* ${new Date(logData.date).toLocaleString()}\n` +
                       `• *Ejecutado por:* ${logData.removerName}\n` +
                       `• *Miembros totales:* ${logData.totalMembers}\n` +
                       `• *Eliminados exitosos:* ${logData.successCount || 0}\n` +
                       `• *Fallos:* ${logData.failCount || 0}\n\n`
        
        await conn.reply(m.chat, logText, m)
        
        // Si hay miembros eliminados, mostrar lista
        if (logData.removedMembers && logData.removedMembers.length > 0) {
            const memberList = logData.removedMembers
                .slice(0, 20) // Limitar a 20 para no saturar
                .map((m, idx) => `${idx + 1}. ${m.name}`)
                .join('\n')
            
            await conn.reply(m.chat, 
                `👥 *MIEMBROS ELIMINADOS:*\n${memberList}\n\n` +
                `📄 Mostrando ${Math.min(20, logData.removedMembers.length)} de ${logData.removedMembers.length} miembros`,
                m
            )
        }
        
    } catch (error) {
        return conn.reply(m.chat, 
            `❌ *ERROR AL LEER LOG*\n\n` +
            `No se pudo leer el archivo de registro.\n\n` +
            `*Error:* ${error.message}`,
            m
        )
    }
}

handler.help = ['kickall']
handler.tags = ['admin']
handler.command = ['kickall', 'eliminartodos']
handler.group = true
handler.admin = true
handler.botAdmin = true
handler.owner = true
handler.register = true

export default handler