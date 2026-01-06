import fetch from 'node-fetch';

const API_KEY = 'stellar-dXXUtmL2';
const API_URL = 'https://rest.alyabotpe.xyz/dl/spotify';

async function handler(m, { text, conn }) {
    if (!text) {
        return m.reply("🌸 *𝗪𝗔𝗚𝗨𝗥𝗜 𝗕𝗢𝗧 🌸*\n\n❌ Por favor, ingresa un enlace o nombre de canción de Spotify.\n\n> *Ejemplo con enlace:* .spotify https://open.spotify.com/track/...\n> *Ejemplo con búsqueda:* .spotify Shape of You");
    }

    // Enviar reacción de reloj (⌚)
    try {
        await conn.sendReaction(m.chat, m.key, '⌚');
    } catch (error) {
        console.error('Error enviando reacción:', error);
    }

    // Mensaje de procesamiento
    const processingMsg = await conn.sendMessage(
        m.chat, 
        { 
            text: '🌸 *𝗪𝗔𝗚𝗨𝗥𝗜 𝗕𝗢𝗧 🌸*\n\n🎵 *Buscando en Spotify...*\n> Por favor, espera un momento...' 
        }, 
        { quoted: m }
    );

    try {
        // Verificar si es un enlace o búsqueda por texto
        let apiUrl;
        if (text.includes('open.spotify.com') || text.includes('spotify:')) {
            // Es un enlace de Spotify
            if (!text.match(/open\.spotify\.com\/(track|album|playlist)/)) {
                throw new Error('❌ Enlace no válido. Solo se aceptan:\n• Canciones (track)\n• Álbumes (album)\n• Playlists (playlist)');
            }
            apiUrl = `${API_URL}?url=${encodeURIComponent(text)}&apikey=${API_KEY}`;
        } else {
            // Es una búsqueda por texto
            apiUrl = `${API_URL}?query=${encodeURIComponent(text)}&apikey=${API_KEY}`;
        }

        console.log('URL de la API Spotify:', apiUrl);
        
        const res = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json'
            }
        });
        
        if (!res.ok) {
            throw new Error(`❌ Error de conexión: ${res.status} - ${res.statusText}`);
        }
        
        const data = await res.json();
        
        // Verificar si la API devolvió un error
        if (data.status === false || data.error) {
            throw new Error(data.message || data.error || '❌ Error desconocido de la API');
        }
        
        console.log('Respuesta de Spotify API:', JSON.stringify(data, null, 2));
        
        // Manejar diferentes tipos de respuesta
        if (data.result) {
            // Resultado único (una canción)
            await handleSingleResult(data.result, m, conn, processingMsg);
        } else if (data.results && Array.isArray(data.results)) {
            // Múltiples resultados (búsqueda)
            await handleMultipleResults(data.results, m, conn, processingMsg);
        } else if (data.songs && Array.isArray(data.songs)) {
            // Lista de canciones (álbum/playlist)
            await handleSongList(data, m, conn, processingMsg);
        } else {
            throw new Error('❌ Formato de respuesta no reconocido');
        }
        
        // Reacción de éxito
        try {
            await conn.sendReaction(m.chat, m.key, '✅');
        } catch (error) {
            console.error('Error enviando reacción de éxito:', error);
        }

    } catch (error) {
        console.error('Error en Spotify Downloader:', error);
        
        // Mensaje de error
        await conn.sendMessage(
            m.chat,
            { 
                text: `🌸 *𝗪𝗔𝗚𝗨𝗥𝗜 𝗕𝗢𝗧 🌸*\n\n❌ *Error al procesar la solicitud*\n\n` +
                      `> *Detalles:* ${error.message}\n\n` +
                      `*Posibles soluciones:*\n` +
                      `• Verifica que el enlace sea válido\n` +
                      `• Intenta con el nombre de la canción\n` +
                      `• Asegúrate que sea una canción pública\n` +
                      `• Espera unos minutos e intenta de nuevo`
            }
        );
        
        // Reacción de error
        try {
            await conn.sendReaction(m.chat, m.key, '❌');
        } catch (reactionError) {
            console.error('Error enviando reacción de error:', reactionError);
        }
        
        // Actualizar mensaje de procesamiento
        await conn.sendMessage(
            m.chat,
            { 
                text: "❌ Error en la descarga",
                edit: processingMsg.key 
            }
        );
    }
}

// Función para manejar un solo resultado (una canción)
async function handleSingleResult(song, m, conn, processingMsg) {
    const title = song.title || 'Canción desconocida';
    const artist = song.artist || 'Artista desconocido';
    const album = song.album || 'Álbum desconocido';
    const duration = formatDuration(song.duration) || 'Desconocida';
    const thumbnail = song.thumbnail || song.cover || null;
    const downloadUrl = song.url || song.downloadUrl || song.audio || null;
    
    if (!downloadUrl) {
        throw new Error('❌ No se encontró enlace de descarga');
    }
    
    // Enviar información de la canción
    const songInfo = `🌸 *𝗪𝗔𝗚𝗨𝗥𝗜 𝗕𝗢𝗧 🌸*\n\n` +
                    `🎵 *INFORMACIÓN DE LA CANCIÓN*\n\n` +
                    `📌 *Título:* ${title}\n` +
                    `👤 *Artista:* ${artist}\n` +
                    `💿 *Álbum:* ${album}\n` +
                    `⏱️ *Duración:* ${duration}\n\n` +
                    `⬇️ *Descargando...*`;
    
    await conn.sendMessage(
        m.chat,
        { 
            text: songInfo,
            edit: processingMsg.key 
        }
    );
    
    // Enviar el audio
    await conn.sendMessage(
        m.chat,
        {
            audio: { url: downloadUrl },
            mimetype: 'audio/mpeg',
            fileName: `${artist} - ${title}.mp3`.replace(/[<>:"/\\|?*]+/g, ''),
            ptt: false
        },
        { quoted: m }
    );
}

// Función para manejar múltiples resultados (búsqueda)
async function handleMultipleResults(results, m, conn, processingMsg) {
    if (results.length === 0) {
        throw new Error('❌ No se encontraron resultados para tu búsqueda');
    }
    
    // Mostrar lista de resultados (máximo 10)
    const maxResults = Math.min(results.length, 10);
    let resultList = `🌸 *𝗪𝗔𝗚𝗨𝗥𝗜 𝗕𝗢𝗧 🌸*\n\n` +
                    `🔍 *RESULTADOS DE BÚSQUEDA*\n\n`;
    
    results.slice(0, maxResults).forEach((song, index) => {
        const title = song.title || 'Sin título';
        const artist = song.artist || 'Artista desconocido';
        const duration = formatDuration(song.duration) || '--:--';
        
        resultList += `${index + 1}. *${title}*\n   👤 ${artist}\n   ⏱️ ${duration}\n\n`;
    });
    
    resultList += `\n*Envía el número de la canción que deseas descargar (ej: 1)*`;
    
    await conn.sendMessage(
        m.chat,
        { 
            text: resultList,
            edit: processingMsg.key 
        }
    );
    
    // Guardar resultados para selección
    const resultsKey = `spotify_results_${m.chat}_${m.sender}`;
    // Aquí deberías implementar un sistema para guardar los resultados temporalmente
    // y manejar la selección del usuario
    
    // Para simplificar, solo descargamos la primera canción
    if (results[0].url) {
        await conn.sendMessage(
            m.chat,
            {
                text: `📥 *Descargando la primera canción...*`
            }
        );
        
        await handleSingleResult(results[0], m, conn, processingMsg);
    }
}

// Función para manejar listas de canciones (álbumes/playlists)
async function handleSongList(data, m, conn, processingMsg) {
    const songs = data.songs || [];
    const title = data.title || 'Lista de canciones';
    const total = songs.length;
    
    if (total === 0) {
        throw new Error('❌ No se encontraron canciones en esta lista');
    }
    
    // Mostrar información de la lista
    const listInfo = `🌸 *𝗪𝗔𝗚𝗨𝗥𝗜 𝗕𝗢𝗧 🌸*\n\n` +
                    `📚 *${title.toUpperCase()}*\n` +
                    `🎵 *Canciones encontradas:* ${total}\n\n` +
                    `📥 *Descargando la primera canción...*`;
    
    await conn.sendMessage(
        m.chat,
        { 
            text: listInfo,
            edit: processingMsg.key 
        }
    );
    
    // Descargar la primera canción
    if (songs[0] && songs[0].url) {
        await handleSingleResult(songs[0], m, conn, processingMsg);
        
        // Si hay más canciones, ofrecer descargar más
        if (total > 1) {
            await conn.sendMessage(
                m.chat,
                {
                    text: `*¿Deseas descargar más canciones de esta lista?*\n\n` +
                          `*Usa:* .spotify [número]\n` +
                          `*Ejemplo:* .spotify 2 (para la segunda canción)`
                },
                { quoted: m }
            );
        }
    }
}

// Función para formatear duración (segundos a mm:ss)
function formatDuration(seconds) {
    if (!seconds) return null;
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

handler.help = ["spotify <enlace o búsqueda>"];
handler.tags = ["descargas", "música"];
handler.command = ["spotify", "spoti", "sp"];
handler.limit = true;
handler.register = true;
handler.group = true;
handler.premium = false;

export default handler;