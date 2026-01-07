import fs from 'fs'
import path from 'path'

// Configuración de carpetas
const welcomeFolder = './welcomes'
if (!fs.existsSync(welcomeFolder)) {
    fs.mkdirSync(welcomeFolder, { recursive: true })
}

function getGroupFilePath(groupId) {
    return path.join(welcomeFolder, `${groupId}.json`)
}

let handler = async (m, { conn, usedPrefix, command }) => {
    // Verificar si el usuario está registrado y es administrador
    const user = global.db.data.users[m.sender];
    if (!user || !user.registered) {
        await conn.sendMessage(m.chat, { react: { text: "🔒", key: m.key } });
        return conn.reply(m.chat, 
            `🔒 *REGISTRO REQUERIDO* 🔒\n\n` +
            `Para usar el comando *${command}* necesitas estar registrado.\n\n` +
            `📋 *Regístrate con:*\n` +
            `${usedPrefix}reg nombre.edad\n\n` +
            `*Ejemplo:* ${usedPrefix}reg ${conn.getName(m.sender) || 'Usuario'}.18\n\n` +
            `¡Regístrate para configurar el bot! 🤖`,
            m
        );
    }

    // Verificar si es administrador del grupo
    const participants = await conn.groupMetadata(m.chat).then(m => m.participants)
    const sender = participants.find(p => p.id === m.sender)
    if (!sender.admin) {
        return conn.reply(m.chat, 
            `⚠️ *PERMISO DENEGADO*\n\n` +
            `Solo los administradores pueden configurar las bienvenidas.\n\n` +
            `👑 Pide a un administrador que configure las bienvenidas.`,
            m
        )
    }

    const args = m.text.split(' ')
    const subcommand = args[1]?.toLowerCase()
    
    if (!subcommand) {
        return conn.reply(m.chat, 
            `🌸 *CONFIGURACIÓN DE BIENVENIDAS* 🌸\n\n` +
            `Configura mensajes de bienvenida para nuevos miembros.\n\n` +
            `📋 *Comandos disponibles:*\n` +
            `• ${usedPrefix}${command} on - Activar bienvenidas\n` +
            `• ${usedPrefix}${command} off - Desactivar bienvenidas\n` +
            `• ${usedPrefix}${command} text <mensaje> - Cambiar mensaje\n` +
            `• ${usedPrefix}${command} image <url> - Cambiar imagen\n` +
            `• ${usedPrefix}${command} preview - Ver vista previa\n` +
            `• ${usedPrefix}${command} status - Ver configuración\n\n` +
            `📝 *Variables disponibles:*\n` +
            `• @user - Nombre del usuario\n` +
            `• @group - Nombre del grupo\n` +
            `• @total - Total de miembros\n` +
            `• @mention - Mencionar al usuario\n\n` +
            `*Ejemplo:*\n` +
            `${usedPrefix}${command} text ¡Hola @user! Bienvenid@ a @group 🌸`,
            m
        )
    }

    const filePath = getGroupFilePath(m.chat)
    let config = { enabled: true, message: '', image: '' }
    
    if (fs.existsSync(filePath)) {
        config = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    }

    switch (subcommand) {
        case 'on':
            config.enabled = true
            fs.writeFileSync(filePath, JSON.stringify(config, null, 2))
            await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
            return conn.reply(m.chat, 
                `✅ *BIENVENIDAS ACTIVADAS*\n\n` +
                `Las bienvenidas están ahora activadas en este grupo.\n` +
                `Los nuevos miembros recibirán un mensaje de bienvenida.`,
                m
            )

        case 'off':
            config.enabled = false
            fs.writeFileSync(filePath, JSON.stringify(config, null, 2))
            await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
            return conn.reply(m.chat, 
                `✅ *BIENVENIDAS DESACTIVADAS*\n\n` +
                `Las bienvenidas están ahora desactivadas en este grupo.\n` +
                `Los nuevos miembros no recibirán mensaje de bienvenida.`,
                m
            )

        case 'text':
            if (!args.slice(2).join(' ')) {
                return conn.reply(m.chat, 
                    `❌ *FALTA TEXTO*\n\n` +
                    `Por favor, proporciona el mensaje de bienvenida.\n\n` +
                    `*Uso:* ${usedPrefix}${command} text <mensaje>\n` +
                    `*Ejemplo:* ${usedPrefix}${command} text ¡Hola @user! Bienvenid@ 🌸`,
                    m
                )
            }
            config.message = args.slice(2).join(' ')
            fs.writeFileSync(filePath, JSON.stringify(config, null, 2))
            await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
            return conn.reply(m.chat, 
                `✅ *TEXTO CONFIGURADO*\n\n` +
                `Mensaje de bienvenida actualizado:\n\n` +
                `"${config.message}"`,
                m
            )

        case 'image':
            if (!args[2]) {
                return conn.reply(m.chat, 
                    `❌ *FALTA URL*\n\n` +
                    `Por favor, proporciona la URL de la imagen.\n\n` +
                    `*Uso:* ${usedPrefix}${command} image <url>\n` +
                    `*Ejemplo:* ${usedPrefix}${command} image https://ejemplo.com/imagen.jpg`,
                    m
                )
            }
            config.image = args[2]
            fs.writeFileSync(filePath, JSON.stringify(config, null, 2))
            await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
            return conn.reply(m.chat, 
                `✅ *IMAGEN CONFIGURADA*\n\n` +
                `Imagen de bienvenida actualizada.\n\n` +
                `URL: ${config.image}`,
                m
            )

        case 'preview':
            if (!config.message && !config.image) {
                return conn.reply(m.chat, 
                    `⚠️ *SIN CONFIGURACIÓN*\n\n` +
                    `No hay configuración de bienvenida establecida.\n` +
                    `Usa *${usedPrefix}${command} text* y *${usedPrefix}${command} image* para configurar.`,
                    m
                )
            }
            
            const groupName = (await conn.groupMetadata(m.chat)).subject
            const userName = conn.getName(m.sender)
            const totalMembers = (await conn.groupMetadata(m.chat)).participants.length
            
            let previewMessage = config.message
                .replace(/@user/g, userName)
                .replace(/@group/g, groupName)
                .replace(/@total/g, totalMembers)
                .replace(/@mention/g, `@${m.sender.split('@')[0]}`)
            
            if (config.image) {
                try {
                    await conn.sendMessage(m.chat, {
                        image: { url: config.image },
                        caption: previewMessage,
                        mentions: [m.sender]
                    }, { quoted: m })
                } catch (e) {
                    await conn.reply(m.chat, 
                        `📝 *VISTA PREVIA*\n\n` +
                        `${previewMessage}\n\n` +
                        `⚠️ *Nota:* No se pudo cargar la imagen configurada.`,
                        m
                    )
                }
            } else {
                await conn.reply(m.chat, 
                    `📝 *VISTA PREVIA*\n\n` +
                    `${previewMessage}`,
                    m
                )
            }
            break

        case 'status':
            const statusText = config.enabled ? '✅ Activado' : '❌ Desactivado'
            return conn.reply(m.chat, 
                `📊 *ESTADO DE BIENVENIDAS*\n\n` +
                `• *Estado:* ${statusText}\n` +
                `• *Mensaje:* ${config.message || 'No configurado'}\n` +
                `• *Imagen:* ${config.image ? '✅ Configurada' : '❌ No configurada'}\n` +
                `• *Grupo:* ${(await conn.groupMetadata(m.chat)).subject}\n\n` +
                `⚙️ *Usa ${usedPrefix}${command} para ver opciones de configuración*`,
                m
            )

        default:
            return conn.reply(m.chat, 
                `❌ *COMANDO NO RECONOCIDO*\n\n` +
                `Comando "${subcommand}" no válido.\n\n` +
                `Usa *${usedPrefix}${command}* para ver todas las opciones.`,
                m
            )
    }
}

// Handler para eventos de nuevos miembros
export const welcomeHandler = async (m, { conn }) => {
    if (!m.message?.participants || !Array.isArray(m.message.participants)) return
    
    const filePath = getGroupFilePath(m.chat)
    if (!fs.existsSync(filePath)) return
    
    const config = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    if (!config.enabled) return
    
    const groupMetadata = await conn.groupMetadata(m.chat)
    const groupName = groupMetadata.subject
    const totalMembers = groupMetadata.participants.length
    
    for (const participant of m.message.participants) {
        const userName = conn.getName(participant)
        const userId = participant
        
        let welcomeMessage = config.message || 
            `🌸 *¡BIENVENID@ AL GRUPO!* 🌸\n\n` +
            `¡Hola @user! 👋\n` +
            `Te damos la bienvenida a *@group* 🌸\n\n` +
            `📊 *Miembros totales:* @total\n\n` +
            `✨ *¡Disfruta de tu estadía!*\n` +
            `🌸 *waguri Bot*`
        
        welcomeMessage = welcomeMessage
            .replace(/@user/g, userName)
            .replace(/@group/g, groupName)
            .replace(/@total/g, totalMembers)
            .replace(/@mention/g, `@${userId.split('@')[0]}`)
        
        // Enviar mensaje de bienvenida
        try {
            if (config.image) {
                await conn.sendMessage(m.chat, {
                    image: { url: config.image },
                    caption: welcomeMessage,
                    mentions: [userId]
                })
            } else {
                await conn.sendMessage(m.chat, {
                    text: welcomeMessage,
                    mentions: [userId]
                })
            }
            
            // Enviar sticker opcional (puedes cambiar el URL)
            await conn.sendMessage(m.chat, {
                sticker: { url: 'https://raw.githubusercontent.com/WhatsApp/stickers/main/Default/Hello/Hello_1.webp' }
            }, { quoted: null })
            
        } catch (error) {
            console.error('Error enviando bienvenida:', error)
        }
    }
}

handler.help = ['welcome']
handler.tags = ['group']
handler.command = ['welcome', 'bienvenida']
handler.group = true
handler.admin = true
handler.register = true

export default handler