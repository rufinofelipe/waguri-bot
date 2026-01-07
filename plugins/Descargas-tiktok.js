import fetch from 'node-fetch';

var handler = async (m, { conn, args, usedPrefix, command }) => {
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
            `¡Regístrate para descargar videos de TikTok! 📱`,
            m
        );
    }

    if (!args[0]) {
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        return conn.reply(m.chat, 
            `🌸 *DESCARGADOR TIKTOK* 🌸\n\n` +
            `Por favor, ingresa un enlace de TikTok.\n\n` +
            `📝 *Ejemplo:*\n` +
            `${usedPrefix}${command} https://www.tiktok.com/@usuario/video/1234567890\n\n` +
            `🔗 *Formatos aceptados:*\n` +
            `• https://www.tiktok.com/@...\n` +
            `• https://vm.tiktok.com/...\n` +
            `• https://vt.tiktok.com/...`,
            m
        );
    }

    const tiktokUrl = validateTikTokUrl(args[0]);
    if (!tiktokUrl) {
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        return conn.reply(m.chat, 
            `❌ *URL INVÁLIDA*\n\n` +
            `La URL de TikTok no es válida. Por favor verifica el enlace.\n\n` +
            `✅ *URLs válidas:*\n` +
            `• https://www.tiktok.com/@usuario/video/...\n` +
            `• https://vm.tiktok.com/...\n` +
            `• https://vt.tiktok.com/...\n` +
            `• https://m.tiktok.com/v/...`,
            m
        );
    }

    try {
        // Enviar reacción de procesando
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
        
        const processingMsg = await conn.reply(m.chat, 
            `🔄 *DESCARGANDO VIDEO DE TIKTOK...* 🔄\n\n` +
            `🔗 *Enlace:* ${tiktokUrl}\n` +
            `👤 *Usuario:* ${user.name || conn.getName(m.sender)}\n\n` +
            `⏳ Procesando video, por favor espera...`,
            m
        );

        const result = await downloadFromMultipleAPIs(tiktokUrl);

        if (!result) {
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
                `❌ *DESCARGA FALLIDA*\n\n` +
                `No se pudo descargar el video.\n\n` +
                `💡 *Posibles causas:*\n` +
                `• El video podría ser privado\n` +
                `• El enlace no es válido\n` +
                `• Restricciones regionales\n` +
                `• El video fue eliminado\n\n` +
                `🔄 Intenta con otro enlace o más tarde.`,
                m
            );
        }

        const { videoUrl, title, author, thumbnail } = result;

        if (videoUrl) {
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
            
            // Enviar reacción de éxito
            await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
            
            const caption = `✅ *VIDEO DE TIKTOK DESCARGADO*\n\n` +
                           `👤 *Autor:* ${author || 'Desconocido'}\n` +
                           `📹 *Título:* ${title || 'Sin título'}\n` +
                           `🌸 *Usuario:* ${user.name || conn.getName(m.sender)}\n` +
                           `📱 *Descargado por waguri Bot*\n\n` +
                           `✨ ¡Disfruta del video!`;

            await conn.sendMessage(m.chat, {
                video: { url: videoUrl },
                mimetype: 'video/mp4',
                fileName: `tiktok_${Date.now()}.mp4`,
                caption: caption
            }, { quoted: m });
        } else {
            await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
            return conn.reply(m.chat, 
                `❌ *ERROR EN EL VIDEO*\n\n` +
                `No se pudo obtener el video. Intenta con otro enlace.\n\n` +
                `🔧 *Consejo:*\n` +
                `Verifica que el video sea público y esté disponible.`,
                m
            );
        }
    } catch (error) {
        console.error('Error en TikTok download:', error);
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        return conn.reply(m.chat, 
            `❌ *ERROR EN LA DESCARGA*\n\n` +
            `*Detalles:* ${error.message}\n\n` +
            `💡 *Consejos:*\n` +
            `• Verifica que el video sea público\n` +
            `• Intenta con un enlace diferente\n` +
            `• El video podría estar restringido por región\n` +
            `• Verifica tu conexión a internet\n\n` +
            `🔄 Intenta nuevamente en unos minutos.`,
            m
        );
    }
};

handler.help = ['tiktok'].map((v) => v + ' *<link>*');
handler.tags = ['descargas'];
handler.command = ['tiktok', 'tt'];
handler.group = false;
handler.register = true;

export default handler;


function validateTikTokUrl(url) {
    try {
        // Limpiar la URL
        url = url.trim().replace(/[^\x00-\x7F]/g, "");

        // Patrones de URL de TikTok
        const patterns = [
            /(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@([^\/]+)\/video\/(\d+)/,
            /(?:https?:\/\/)?vm\.tiktok\.com\/([A-Za-z0-9]+)/,
            /(?:https?:\/\/)?vt\.tiktok\.com\/([A-Za-z0-9]+)/,
            /(?:https?:\/\/)?m\.tiktok\.com\/v\/(\d+)/,
            /(?:https?:\/\/)?www\.tiktok\.com\/t\/([A-Za-z0-9]+)/
        ];

        // Verificar si coincide con algún patrón
        for (const pattern of patterns) {
            if (pattern.test(url)) {
                // Asegurarse de que tenga protocolo HTTPS
                if (!url.startsWith('http://') && !url.startsWith('https://')) {
                    url = 'https://' + url;
                }
                return url;
            }
        }

        return null;
    } catch (error) {
        console.error('Error validating TikTok URL:', error);
        return null;
    }
}


async function downloadFromMultipleAPIs(url) {
    const apis = [
        {
            name: 'TikWM',
            func: () => tiktokTikWM(url)
        },
        {
            name: 'Eliasar',
            func: () => tiktokEliasar(url)
        },
        {
            name: 'SSSTik',
            func: () => tiktokSSSTik(url)
        },
        {
            name: 'TikDown',
            func: () => tiktokTikDown(url)
        }
    ];

    for (const api of apis) {
        try {
            console.log(`🔍 Intentando con ${api.name}...`);
            const result = await api.func();

            if (result && result.videoUrl) {
                console.log(`✅ ${api.name} exitoso`);
                return result;
            }
        } catch (error) {
            console.log(`❌ ${api.name} falló: ${error.message}`);
            continue;
        }
    }

    return null;
}


async function tiktokTikWM(url) {
    try {
        const apiUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}&hd=1`;

        const response = await fetch(apiUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Referer': 'https://www.tikwm.com/',
                'Origin': 'https://www.tikwm.com'
            },
            timeout: 15000
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        if (data.code === 0 && data.data && data.data.play) {
            return {
                videoUrl: data.data.play,
                title: data.data.title || 'Sin título',
                author: data.data.author?.unique_id || 'Desconocido',
                thumbnail: data.data.cover || data.data.origin_cover
            };
        }

        throw new Error('No video data found');
    } catch (error) {
        throw new Error(`TikWM API error: ${error.message}`);
    }
}


async function tiktokEliasar(url) {
    try {
        const apiUrl = `https://eliasar-yt-api.vercel.app/api/search/tiktok?query=${encodeURIComponent(url)}`;

        const response = await fetch(apiUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 15000
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        if (data.results && data.results.video) {
            return {
                videoUrl: data.results.video,
                title: data.results.title || 'Sin título',
                author: data.results.author || 'Desconocido',
                thumbnail: data.results.thumbnail
            };
        }

        throw new Error('No video data found');
    } catch (error) {
        throw new Error(`Eliasar API error: ${error.message}`);
    }
}


async function tiktokSSSTik(url) {
    try {
        const apiUrl = `https://ssstik.io/abc?url=dl`;

        const formData = new URLSearchParams();
        formData.append('id', url);
        formData.append('locale', 'en');
        formData.append('tt', 'RFBiZ3Bi');

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'Origin': 'https://ssstik.io',
                'Referer': 'https://ssstik.io/'
            },
            body: formData.toString(),
            timeout: 15000
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const html = await response.text();

        // Extraer URL del video y título del HTML
        const videoMatch = html.match(/href="([^"]*\.mp4[^"]*)"/);
        const titleMatch = html.match(/<p class="maintext">([^<]+)</);

        if (videoMatch && videoMatch[1]) {
            return {
                videoUrl: videoMatch[1],
                title: titleMatch ? titleMatch[1] : 'Sin título',
                author: 'Desconocido',
                thumbnail: null
            };
        }

        throw new Error('No video URL found in response');
    } catch (error) {
        throw new Error(`SSSTik API error: ${error.message}`);
    }
}


async function tiktokTikDown(url) {
    try {
        const apiUrl = `https://tikdown.org/api/ajaxSearch`;

        const formData = new URLSearchParams();
        formData.append('q', url);
        formData.append('lang', 'en');

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'Origin': 'https://tikdown.org',
                'Referer': 'https://tikdown.org/'
            },
            body: formData.toString(),
            timeout: 15000
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        if (data.status === 'ok' && data.data) {
            const videoMatch = data.data.match(/href="([^"]*\.mp4[^"]*)"/);

            if (videoMatch && videoMatch[1]) {
                return {
                    videoUrl: videoMatch[1],
                    title: 'Video de TikTok',
                    author: 'Desconocido',
                    thumbnail: null
                };
            }
        }

        throw new Error('No video data found');
    } catch (error) {
        throw new Error(`TikDown API error: ${error.message}`);
    }
}