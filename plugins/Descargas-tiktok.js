import fetch from 'node-fetch';

var handler = async (m, { conn, args, usedPrefix, command }) => {
    if (!args[0]) {
        return conn.reply(m.chat, `🌸 Por favor, ingresa un enlace de TikTok.\n\n📝 *Ejemplo:* ${usedPrefix}${command} https://www.tiktok.com/@usuario/video/1234567890`, m);
    }


    const tiktokUrl = validateTikTokUrl(args[0]);
    if (!tiktokUrl) {
        return conn.reply(m.chat, `❌ URL de TikTok inválida. Por favor verifica el enlace.\n\n✅ *URLs válidas:*\n• https://www.tiktok.com/@usuario/video/...\n• https://vm.tiktok.com/...\n• https://vt.tiktok.com/...`, m);
    }

    try {
        await conn.reply(m.chat, `🔄 Descargando video de TikTok... Por favor espera.`, m);


        const result = await downloadFromMultipleAPIs(tiktokUrl);

        if (!result) {
            return conn.reply(m.chat, `❌ No se pudo descargar el video. El enlace podría ser privado o no válido.`, m);
        }

        const { videoUrl, title, author, thumbnail } = result;

        if (videoUrl) {
        const caption = `✅ *Video de TikTok descargado*\n\n` +
                          `👤 *Autor:* ${author || 'Desconocido'}\n` +
                          `📹 *Título:* ${title || 'Sin título'}\n\n` +
                          `🌸 *Descargado por waguri Bot*`;

            await conn.sendMessage(m.chat, {
                video: { url: videoUrl },
                mimetype: 'video/mp4',
                fileName: 'tiktok.mp4',
                caption: caption
            }, { quoted: m });
        } else {
            return conn.reply(m.chat, `❌ No se pudo obtener el video. Intenta con otro enlace.`, m);
        }
    } catch (error) {
        console.error('Error en TikTok download:', error);
        return conn.reply(m.chat, `❌ Error al procesar la descarga: ${error.message}\n\n💡 *Consejos:*\n• Verifica que el video sea público\n• Intenta con un enlace diferente\n• El video podría estar restringido por región`, m);
    }
};

handler.help = ['tiktok'].map((v) => v + ' *<link>*');
handler.tags = ['descargas'];
handler.command = ['tiktok', 'tt'];
handler.group = false;

export default handler;


function validateTikTokUrl(url) {
    try {

        url = url.trim().replace(/[^\x00-\x7F]/g, "");


        const patterns = [
            /(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@([^\/]+)\/video\/(\d+)/,
            /(?:https?:\/\/)?vm\.tiktok\.com\/([A-Za-z0-9]+)/,
            /(?:https?:\/\/)?vt\.tiktok\.com\/([A-Za-z0-9]+)/,
            /(?:https?:\/\/)?m\.tiktok\.com\/v\/(\d+)/,
            /(?:https?:\/\/)?www\.tiktok\.com\/t\/([A-Za-z0-9]+)/
        ];


        for (const pattern of patterns) {
            if (pattern.test(url)) {

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
