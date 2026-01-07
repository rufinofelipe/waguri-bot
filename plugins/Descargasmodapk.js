 import fetch from 'node-fetch'
import axios from 'axios'

var handler = async (m, { conn, usedPrefix, command, text }) => {
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
            `¡Regístrate para descargar APKs modded! 📱`,
            m
        );
    }

    if (!text) {
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        return conn.reply(m.chat, 
            `❀ *DESCARGADOR APTOIDE RÁPIDO* ❀\n\n` +
            `Por favor, ingrese el nombre de la APK para descargarlo.\n\n` +
            `📝 *Uso:* ${usedPrefix}${command} <nombre>\n` +
            `*Ejemplos:*\n` +
            `${usedPrefix}${command} WhatsApp Plus\n` +
            `${usedPrefix}${command} Spotify Premium\n` +
            `${usedPrefix}${command} YouTube ReVanced`,
            m
        )
    }
    
    try {
        // Enviar reacción de procesando
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
        
        const processingMsg = await conn.reply(m.chat, 
            `⚡ *BUSCANDO APK...* ⚡\n\n` +
            `📱 *Búsqueda:* "${text}"\n` +
            `👤 *Usuario:* ${user.name || conn.getName(m.sender)}\n\n` +
            `Usando API rápida...`,
            m
        );

        // Primero intentar con APIs externas más rápidas
        try {
            // Intento 1: API rápida alternativa
            const apkData = await searchAPKFast(text);
            
            if (!apkData || !apkData.downloadUrl) {
                throw new Error('API rápida falló');
            }

            // Eliminar mensaje de procesamiento
            if (processingMsg && processingMsg.key && processingMsg.key.id) {
                try {
                    await conn.sendMessage(m.chat, { 
                        delete: { 
                            remoteJid: m.chat, 
                            fromMe: true, 
                            id: processingMsg.key.id
                        } 
                    });
                } catch (e) {}
            }

            const txt = `*⚡ APK DESCARGADA RÁPIDAMENTE ⚡*\n\n` +
                       `≡ *Nombre:* ${apkData.name || text}\n` +
                       `≡ *Versión:* ${apkData.version || 'Última'}\n` +
                       `≡ *Tamaño:* ${apkData.size || 'Desconocido'}\n` +
                       `≡ *Usuario:* ${user.name || conn.getName(m.sender)}\n\n` +
                       `📱 *Descargado por waguri Bot*\n` +
                       `⏱️ *Tiempo de búsqueda:* ${apkData.searchTime || 'Rápido'}`;

            // Enviar reacción de éxito
            await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

            // Enviar la APK directamente desde la URL
            await conn.sendMessage(m.chat, {
                document: { 
                    url: apkData.downloadUrl 
                }, 
                fileName: `${apkData.name || text}.apk`,
                mimetype: 'application/vnd.android.package-archive',
                caption: txt
            }, { quoted: m });

            return;

        } catch (fastError) {
            console.log('API rápida falló, intentando con aptoide-scraper...');
            
            // Si falla la API rápida, intentar con aptoide-scraper (más lento pero de respaldo)
            try {
                const { search: aptoideSearch, download: aptoideDownload } = await import('aptoide-scraper')
                
                let searchA = await aptoideSearch(text)
                
                if (!searchA || searchA.length === 0) {
                    // Eliminar mensaje de procesamiento
                    if (processingMsg && processingMsg.key && processingMsg.key.id) {
                        try {
                            await conn.sendMessage(m.chat, { 
                                delete: { 
                                    remoteJid: m.chat, 
                                    fromMe: true, 
                                    id: processingMsg.key.id
                                } 
                            });
                        } catch (e) {}
                    }
                    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
                    return conn.reply(m.chat, 
                        `😔 *NO SE ENCONTRARON RESULTADOS*\n\n` +
                        `No se encontraron APKs para: "${text}"\n\n` +
                        `💡 *Intenta con:*\n` +
                        `• Nombre exacto de la app\n` +
                        `• Nombre + "mod" o "premium"\n` +
                        `• Apps populares como WhatsApp Plus`,
                        m
                    )
                }

                const data5 = await aptoideDownload(searchA[0].id)
                
                // Eliminar mensaje de procesamiento
                if (processingMsg && processingMsg.key && processingMsg.key.id) {
                    try {
                        await conn.sendMessage(m.chat, { 
                            delete: { 
                                remoteJid: m.chat, 
                                fromMe: true, 
                                id: processingMsg.key.id
                            } 
                        });
                    } catch (e) {}
                }

                const txt = `*乂 APTOIDE - DESCARGAS 乂*\n\n` +
                           `≡ *Nombre:* ${data5.name}\n` +
                           `≡ *Package:* ${data5.package}\n` +
                           `≡ *Actualización:* ${data5.lastup}\n` +
                           `≡ *Tamaño:* ${data5.size}\n` +
                           `≡ *Versión:* ${data5.version}\n` +
                           `≡ *Usuario:* ${user.name || conn.getName(m.sender)}\n\n` +
                           `📱 *Descargado por waguri Bot*`

                // Validar tamaño
                const sizeMB = parseFloat(data5.size.replace(' MB', ''))
                if (data5.size.includes('GB') || sizeMB > 200) {
                    await conn.sendMessage(m.chat, { react: { text: "⚠️", key: m.key } });
                    return await conn.reply(m.chat, 
                        `📦 *ARCHIVO GRANDE*\n\n` +
                        `"${data5.name}" pesa ${data5.size}\n\n` +
                        `📤 *Enviando igualmente... (puede tardar)*`,
                        m
                    )
                }

                // Enviar reacción de éxito
                await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

                // Enviar thumbnail si existe
                if (data5.icon) {
                    await conn.sendFile(m.chat, data5.icon, 'thumbnail.jpg', '', m)
                }

                // Enviar APK con timeout reducido
                await conn.sendMessage(m.chat, { 
                    document: { 
                        url: data5.dllink 
                    }, 
                    fileName: `${data5.name}_${data5.version}.apk`,
                    mimetype: 'application/vnd.android.package-archive',
                    caption: txt
                }, { quoted: m })

            } catch (aptoideError) {
                throw aptoideError;
            }
        }

    } catch (error) {
        // Eliminar mensaje de procesamiento si existe
        if (processingMsg && processingMsg.key && processingMsg.key.id) {
            try {
                await conn.sendMessage(m.chat, { 
                    delete: { 
                        remoteJid: m.chat, 
                        fromMe: true, 
                        id: processingMsg.key.id
                    } 
                });
            } catch (e) {}
        }
        
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        return conn.reply(m.chat, 
            `⚠︎ *ERROR EN LA DESCARGA*\n\n` +
            `No se pudo descargar la APK.\n\n` +
            `🔧 *Posibles causas:*\n` +
            `• La app no está disponible\n` +
            `• Problemas de conexión\n` +
            `• App muy pesada (>200MB)\n\n` +
            `💡 *Solución:*\n` +
            `• Intenta con otro nombre\n` +
            `• Busca apps más pequeñas\n` +
            `• Usa *${usedPrefix}report* si persiste`,
            m
        )
    }
}

// Función para búsqueda rápida de APKs
async function searchAPKFast(appName) {
    try {
        console.log(`Buscando rápidamente: ${appName}`);
        
        // Buscar en múltiples fuentes rápidas
        const sources = [
            // Fuente 1: APKPure (API pública)
            async () => {
                const searchTerm = encodeURIComponent(appName.toLowerCase().replace(/ /g, '-'));
                const url = `https://apkpure.com/search?q=${searchTerm}`;
                
                const response = await fetch(url, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    },
                    timeout: 10000
                });
                
                const html = await response.text();
                
                // Extraer primer resultado
                const match = html.match(/<a href="([^"]*)"[^>]*class="[^"]*search-title[^"]*"[^>]*>([^<]*)<\/a>/);
                if (match) {
                    return {
                        name: match[2].trim(),
                        url: `https://apkpure.com${match[1]}/download`
                    };
                }
                return null;
            },
            
            // Fuente 2: APKMirror (API alternativa)
            async () => {
                const response = await fetch(`https://www.apkmirror.com/wp-json/apkm/v1/app_exists/?pname=${encodeURIComponent(appName)}`, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    },
                    timeout: 10000
                });
                
                const data = await response.json();
                if (data.exists) {
                    return {
                        name: appName,
                        downloadUrl: `https://www.apkmirror.com/apk/${appName.toLowerCase().replace(/ /g, '-')}/`
                    };
                }
                return null;
            },
            
            // Fuente 3: Repositorio de APKs populares
            async () => {
                // Lista de APKs populares predefinidas con enlaces directos
                const popularAPKs = {
                    'whatsapp plus': {
                        name: 'WhatsApp Plus',
                        downloadUrl: 'https://www.mediafire.com/file/qxr58a8y93kri22/GBWhatsApp_v17.50.apk/file',
                        version: '17.50',
                        size: '80 MB'
                    },
                    'spotify premium': {
                        name: 'Spotify Premium',
                        downloadUrl: 'https://www.mediafire.com/file/3o7w3z0c8gq9z7n/Spotify_Premium_v8.9.20.544.apk/file',
                        version: '8.9.20.544',
                        size: '95 MB'
                    },
                    'youtube revanced': {
                        name: 'YouTube ReVanced',
                        downloadUrl: 'https://github.com/revanced/revanced-releases/releases/latest/download/app-release.apk',
                        version: 'Latest',
                        size: '50 MB'
                    }
                };
                
                const key = appName.toLowerCase();
                if (popularAPKs[key]) {
                    return popularAPKs[key];
                }
                
                // Buscar coincidencias parciales
                for (const [apkKey, apkData] of Object.entries(popularAPKs)) {
                    if (key.includes(apkKey) || apkKey.includes(key)) {
                        return apkData;
                    }
                }
                return null;
            }
        ];
        
        // Intentar cada fuente
        for (const source of sources) {
            try {
                const result = await source();
                if (result && result.downloadUrl) {
                    return {
                        ...result,
                        searchTime: 'Rápido'
                    };
                }
            } catch (e) {
                console.log(`Fuente falló: ${e.message}`);
                continue;
            }
        }
        
        throw new Error('No se encontró APK');
        
    } catch (error) {
        console.error('Error en búsqueda rápida:', error);
        throw error;
    }
}

handler.tags = ['descargas']
handler.help = ['apkmod']
handler.command = ['apk', 'modapk', 'aptoide']
handler.group = true
handler.premium = true
handler.register = true
handler.limit = true

export default handler