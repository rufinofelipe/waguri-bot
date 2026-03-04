// by Rufino

import fetch from 'node-fetch';
import { getBuffer } from '../lib/message.js';

async function handler(m, { text, conn, usedPrefix, command }) {

    if (!text) {
        return m.reply(`Por favor, ingresa una descripción para generar la imagen.\n> *Ejemplo:* ${usedPrefix}${command} un gato astronauta en el espacio`);
    }

    // Enviar reacción de reloj al comenzar
    try {
        await conn.sendReaction(m.chat, m.key, '⌚');
    } catch (error) {
        console.error('Error enviando reacción:', error);
    }

    // Enviar mensaje de procesamiento
    const processingMsg = await conn.sendMessage(
        m.chat,
        { text: '> *Generando tu imagen con IA, espera un momento...*' },
        { quoted: m }
    );

    try {
        const res = await fetch('https://fluximagegen.com/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                prompt: text,
                style: 'photorealism'
            })
        });

        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }

        const json = await res.json();

        if (!json.success || !json.imageUrl) {
            const reason = json.message || json.error || 'Respuesta inválida de la API';
            throw new Error(reason);
        }

        const buffer = await getBuffer(json.imageUrl);

        if (!buffer || buffer.length === 0) {
            throw new Error('No se pudo descargar la imagen generada.');
        }

        // Editar mensaje de procesamiento y enviar imagen
        await conn.sendMessage(
            m.chat,
            {
                text: '> *¡Imagen generada con éxito!* ✅',
                edit: processingMsg.key
            }
        );

        await conn.sendMessage(
            m.chat,
            {
                image: buffer,
                caption: `🎨 *IMAGEN GENERADA*\n\n📝 *Prompt:* ${text}\n🖌️ *Estilo:* Photorealism`
            },
            { quoted: m }
        );

        // Reacción de éxito
        try {
            await conn.sendReaction(m.chat, m.key, '✅');
        } catch (error) {
            console.error('Error enviando reacción de éxito:', error);
        }

    } catch (error) {
        console.error('Error en Dalle:', error);

        await conn.sendMessage(
            m.chat,
            {
                text: `❌ Error al generar la imagen: ${error.message}`,
                edit: processingMsg.key
            }
        );

        try {
            await conn.sendReaction(m.chat, m.key, '❌');
        } catch (error) {
            console.error('Error enviando reacción de error:', error);
        }
    }
}

handler.help = ["dalle <descripción>"];
handler.tags = ["ai"];
handler.command = ["dalle", "crearimagen", "genimg"];
handler.limit = true;
handler.register = true;

export default handler;