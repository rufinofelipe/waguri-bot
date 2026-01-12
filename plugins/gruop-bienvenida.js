import fs from 'fs'
import { WAMessageStubType } from '@whiskeysockets/baileys'

// Configuración global para reutilización
const DEFAULT_PROFILE_PIC = 'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1745522645448.jpeg'

// Función mejorada para obtener la fecha formateada
const obtenerFecha = () => {
    return new Date().toLocaleDateString("es-ES", {
        timeZone: "America/Mexico_City",
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

// Función para limpiar archivos temporales
const limpiarArchivo = (ruta) => {
    try {
        if (fs.existsSync(ruta)) {
            fs.unlinkSync(ruta)
        }
    } catch (error) {
        console.error('Error al limpiar archivo:', error)
    }
}

// Función para procesar plantillas con variables
const procesarPlantilla = (plantilla, variables) => {
    let resultado = plantilla
    for (const [clave, valor] of Object.entries(variables)) {
        const regex = new RegExp(`{${clave}}`, 'g')
        resultado = resultado.replace(regex, valor)
    }
    return resultado
}

async function generarBienvenida({ conn, userId, groupMetadata, chat }) {
    try {
        const username = `@${userId.split('@')[0]}`
        
        // Obtener foto de perfil con manejo de errores
        let pp
        try {
            pp = await conn.profilePictureUrl(userId, 'image')
        } catch (error) {
            console.log(`No se pudo obtener la foto de perfil de ${userId}:`, error.message)
            pp = DEFAULT_PROFILE_PIC
        }
        
        const fecha = obtenerFecha()
        const groupSize = groupMetadata.participants?.length + 1 || 1
        const desc = groupMetadata.desc?.toString()?.trim() || 'Sin descripción'
        
        // Plantilla por defecto más completa
        const plantillaDefault = `¡Bienvenid@ {usuario} al grupo *{grupo}*! 🎉

👥 *Ahora somos:* ${groupSize} miembros
📅 *Fecha:* ${fecha}

💬 *Mensaje personalizado:*
{mensajePersonalizado}

¡Esperamos que disfrutes tu estadía! 😊
Para ver los comandos disponibles usa: #help`
        
        // Procesar mensaje personalizado o usar plantilla
        const mensajePersonalizado = chat.sWelcome?.trim() || '¡Bienvenid@! No olvides leer las reglas del grupo.'
        const mensajeProcesado = procesarPlantilla(chat.sWelcome || plantillaDefault, {
            usuario: username,
            grupo: groupMetadata.subject,
            desc: desc,
            fecha: fecha,
            miembros: groupSize,
            mensajePersonalizado: mensajePersonalizado
        })
        
        const caption = `🎊 *BIENVENID@ AL GRUPO* 🎊

👤 *Usuario:* ${username}
🏷️ *Grupo:* ${groupMetadata.subject}
👥 *Miembros:* ${groupSize}
📅 *Fecha y hora:* ${fecha}

💬 *Mensaje:*
${mensajePersonalizado}

¡Disfruta tu estadía en el grupo! ✨
Para ayuda escribe: #help`

        return {
            pp,
            caption,
            mentions: [userId],
            username,
            groupSize,
            fecha
        }
    } catch (error) {
        console.error('Error en generarBienvenida:', error)
        // Retornar valores por defecto en caso de error
        return {
            pp: DEFAULT_PROFILE_PIC,
            caption: `¡Bienvenid@ al grupo ${groupMetadata?.subject || 'desconocido'}! 🎉`,
            mentions: [userId]
        }
    }
}

async function generarDespedida({ conn, userId, groupMetadata, chat }) {
    try {
        const username = `@${userId.split('@')[0]}`
        
        // Obtener foto de perfil con manejo de errores
        let pp
        try {
            pp = await conn.profilePictureUrl(userId, 'image')
        } catch (error) {
            console.log(`No se pudo obtener la foto de perfil de ${userId}:`, error.message)
            pp = DEFAULT_PROFILE_PIC
        }
        
        const fecha = obtenerFecha()
        const groupSize = Math.max((groupMetadata.participants?.length || 1) - 1, 0)
        const desc = groupMetadata.desc?.toString()?.trim() || 'Sin descripción'
        
        // Plantilla por defecto
        const plantillaDefault = `Lamentamos tu partida {usuario} del grupo *{grupo}* 😔

👥 *Ahora somos:* ${groupSize} miembros
📅 *Fecha:* ${fecha}

¡Te esperamos pronto! 👋`
        
        // Procesar mensaje personalizado
        const mensajePersonalizado = chat.sBye?.trim() || 'Esperamos verte nuevamente pronto.'
        const mensajeProcesado = procesarPlantilla(chat.sBye || plantillaDefault, {
            usuario: username,
            grupo: groupMetadata.subject,
            desc: desc,
            fecha: fecha,
            miembros: groupSize,
            mensajePersonalizado: mensajePersonalizado
        })
        
        const caption = `👋 *ADIÓS DEL GRUPO* 👋

👤 *Usuario que se va:* ${username}
🏷️ *Grupo:* ${groupMetadata.subject}
👥 *Miembros restantes:* ${groupSize}
📅 *Fecha y hora:* ${fecha}

💬 *Mensaje:*
${mensajePersonalizado}

¡Te esperamos pronto! 🫶`

        return {
            pp,
            caption,
            mentions: [userId],
            username,
            groupSize,
            fecha
        }
    } catch (error) {
        console.error('Error en generarDespedida:', error)
        return {
            pp: DEFAULT_PROFILE_PIC,
            caption: `Adiós del grupo ${groupMetadata?.subject || 'desconocido'} 👋`,
            mentions: [userId]
        }
    }
}

let handler = m => m

handler.before = async function (m, { conn, participants, groupMetadata }) {
    try {
        // Validaciones iniciales
        if (!m.messageStubType || !m.isGroup) return true
        
        // Verificar si este bot es el bot primario configurado
        const chatConfig = global.db.data.chats[m.chat]
        const primaryBot = chatConfig?.primaryBot
        if (primaryBot && conn.user.jid !== primaryBot) return true
        
        // Verificar parámetros necesarios
        if (!m.messageStubParameters || !m.messageStubParameters[0]) {
            console.log('No hay parámetros en el stub')
            return true
        }
        
        const userId = m.messageStubParameters[0]
        
        // Manejar entrada de usuarios
        if (chatConfig?.welcome && m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD) {
            console.log(`Nuevo usuario detectado: ${userId} en grupo ${m.chat}`)
            
            // Pequeño delay para asegurar que el usuario ya esté en el grupo
            await new Promise(resolve => setTimeout(resolve, 1000))
            
            const datosBienvenida = await generarBienvenida({
                conn,
                userId,
                groupMetadata,
                chat: chatConfig
            })
            
            // Configurar menciones correctamente
            const mensajeConfig = {
                image: { url: datosBienvenida.pp },
                caption: datosBienvenida.caption,
                mentions: datosBienvenida.mentions,
                contextInfo: {
                    mentionedJid: datosBienvenida.mentions
                }
            }
            
            await conn.sendMessage(m.chat, mensajeConfig, { quoted: null })
            
            // Limpiar si hay archivo temporal
            if (datosBienvenida.pp && datosBienvenida.pp.startsWith('/tmp/')) {
                limpiarArchivo(datosBienvenida.pp)
            }
        }
        
        // Manejar salida de usuarios
        if (chatConfig?.welcome && (
            m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_REMOVE ||
            m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_LEAVE
        )) {
            console.log(`Usuario saliendo: ${userId} del grupo ${m.chat}`)
            
            const datosDespedida = await generarDespedida({
                conn,
                userId,
                groupMetadata,
                chat: chatConfig
            })
            
            // Configurar menciones correctamente
            const mensajeConfig = {
                image: { url: datosDespedida.pp },
                caption: datosDespedida.caption,
                mentions: datosDespedida.mentions,
                contextInfo: {
                    mentionedJid: datosDespedida.mentions
                }
            }
            
            await conn.sendMessage(m.chat, mensajeConfig, { quoted: null })
            
            // Limpiar si hay archivo temporal
            if (datosDespedida.pp && datosDespedida.pp.startsWith('/tmp/')) {
                limpiarArchivo(datosDespedida.pp)
            }
        }
        
        return true
    } catch (error) {
        console.error('Error en handler.before:', error)
        return true
    }
}

export { generarBienvenida, generarDespedida, procesarPlantilla }
export default handler