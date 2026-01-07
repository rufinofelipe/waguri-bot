import axios from 'axios';
const {
  proto,
  generateWAMessageFromContent,
  prepareWAMessageMedia,
  generateWAMessageContent,
  getDevice
} = (await import("@whiskeysockets/baileys")).default;

let handler = async (message, { conn, text, usedPrefix, command }) => {
  // Verificar si el usuario está registrado
  const user = global.db.data.users[message.sender];
  if (!user || !user.registered) {
    await conn.sendMessage(message.chat, { react: { text: "🔒", key: message.key } });
    return conn.reply(message.chat, 
      `🔒 *REGISTRO REQUERIDO* 🔒\n\n` +
      `Para usar este comando necesitas estar registrado.\n\n` +
      `📋 *Regístrate con:*\n` +
      `${usedPrefix}reg nombre.edad\n\n` +
      `*Ejemplo:* ${usedPrefix}reg ${conn.getName(message.sender) || 'Usuario'}.18\n\n` +
      `¡Regístrate para desbloquear todas las funciones! 🌟`,
      message
    );
  }

  // Verificar si se proporcionó texto
  if (!text) {
    await conn.sendMessage(message.chat, { react: { text: "❌", key: message.key } });
    return conn.reply(message.chat, 
      `🌸 *BÚSQUEDA TIKTOK* 🌸\n\n` +
      `Por favor, ingrese un texto para buscar en TikTok.\n\n` +
      `📝 *Uso:* ${usedPrefix + command} <texto>\n` +
      `*Ejemplo:* ${usedPrefix + command} música trending`,
      message
    );
  }

  // Función para crear mensaje de video
  async function createVideoMessage(url) {
    try {
      const { videoMessage } = await generateWAMessageContent({
        video: { url }
      }, {
        upload: conn.waUploadToServer
      });
      return videoMessage;
    } catch (error) {
      console.error('Error creando videoMessage:', error);
      return null;
    }
  }

  // Función para mezclar array
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  try {
    // Enviar reacción de "procesando"
    await conn.sendMessage(message.chat, { react: { text: "⏳", key: message.key } });
    
    // Mensaje de procesamiento
    const processingMsg = await conn.reply(message.chat, 
      `🔍 *BUSCANDO EN TIKTOK...* 🔍\n` +
      `*Búsqueda:* "${text}"\n\n` +
      `⏳ Por favor espera mientras buscamos los videos...`,
      message
    );

    // Realizar la búsqueda usando TU API ORIGINAL
    let results = [];
    let { data } = await axios.get("https://apis-starlights-team.koyeb.app/starlight/tiktoksearch?text=" + encodeURIComponent(text), {
      timeout: 30000 // 30 segundos timeout
    });
    
    if (!data || !data.data || data.data.length === 0) {
      await conn.sendMessage(message.chat, { react: { text: "❌", key: message.key } });
      return conn.reply(message.chat, 
        `😔 *NO SE ENCONTRARON RESULTADOS*\n\n` +
        `No se encontraron videos de TikTok para: "${text}"\n\n` +
        `💡 *Sugerencias:*\n` +
        `• Verifica la ortografía\n` +
        `• Intenta con términos más generales\n` +
        `• Prueba con palabras clave diferentes`,
        message
      );
    }

    let searchResults = data.data;
    
    // Validar que los resultados tengan la estructura esperada
    const validResults = searchResults.filter(result => 
      result && result.nowm && typeof result.nowm === 'string' && result.nowm.startsWith('http')
    );
    
    if (validResults.length === 0) {
      await conn.sendMessage(message.chat, { react: { text: "❌", key: message.key } });
      return conn.reply(message.chat, 
        `⚠️ *PROBLEMA CON LOS VIDEOS*\n\n` +
        `Los videos encontrados no tienen enlaces válidos.\n` +
        `Intenta con otra búsqueda.`,
        message
      );
    }
    
    shuffleArray(validResults);
    let topResults = validResults.slice(0, Math.min(7, validResults.length));

    // Preparar los resultados
    for (let i = 0; i < topResults.length; i++) {
      let result = topResults[i];
      try {
        const videoMsg = await createVideoMessage(result.nowm);
        if (videoMsg) {
          results.push({
            body: proto.Message.InteractiveMessage.Body.fromObject({ text: null }),
            footer: proto.Message.InteractiveMessage.Footer.fromObject({ 
              text: `🎬 Video ${i + 1}/${topResults.length}`
            }),
            header: proto.Message.InteractiveMessage.Header.fromObject({
              title: (result.title && result.title.length > 0) 
                ? (result.title.length > 50 ? result.title.substring(0, 50) + '...' : result.title)
                : `Video de TikTok ${i + 1}`,
              hasMediaAttachment: true,
              videoMessage: videoMsg
            }),
            nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({ 
              buttons: result.url ? [
                {
                  name: "cta_url",
                  buttonParamsJson: JSON.stringify({
                    display_text: "🔗 Ver en TikTok",
                    url: result.url,
                    merchant_url: ""
                  })
                }
              ] : []
            })
          });
        }
      } catch (error) {
        console.error(`Error procesando video ${i + 1}:`, error);
      }
    }

    if (results.length === 0) {
      await conn.sendMessage(message.chat, { react: { text: "❌", key: message.key } });
      return conn.reply(message.chat, 
        `⚠️ *NO SE PUDIERON CARGAR LOS VIDEOS*\n\n` +
        `Se encontraron resultados pero hubo un error al procesarlos.\n` +
        `Intenta nuevamente más tarde.`,
        message
      );
    }

    // Eliminar mensaje de procesamiento si existe
    if (processingMsg && processingMsg.key && processingMsg.key.id) {
      try {
        await conn.sendMessage(message.chat, { 
          delete: { 
            remoteJid: message.chat, 
            fromMe: true, 
            id: processingMsg.key.id
          } 
        });
      } catch (e) {
        console.log('No se pudo eliminar mensaje de procesamiento:', e);
      }
    }

    // Enviar reacción de éxito
    await conn.sendMessage(message.chat, { react: { text: "✅", key: message.key } });

    // Crear y enviar el carrusel de resultados
    const messageContent = generateWAMessageFromContent(message.chat, {
      viewOnceMessage: {
        message: {
          messageContextInfo: {
            deviceListMetadata: {},
            deviceListMetadataVersion: 2
          },
          interactiveMessage: proto.Message.InteractiveMessage.fromObject({
            body: proto.Message.InteractiveMessage.Body.create({
              text: `🌸 *RESULTADOS DE TIKTOK* 🌸\n\n` +
                    `🔍 *Búsqueda:* "${text}"\n` +
                    `📊 *Videos encontrados:* ${results.length}\n\n` +
                    `*Desliza para ver más videos 👉*`
            }),
            footer: proto.Message.InteractiveMessage.Footer.create({
              text: `🎬 TikTok Search • ${new Date().toLocaleDateString('es-ES')}`
            }),
            header: proto.Message.InteractiveMessage.Header.create({
              hasMediaAttachment: false
            }),
            carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({
              cards: [...results]
            })
          })
        }
      }
    }, {
      quoted: message
    });

    await conn.relayMessage(message.chat, messageContent.message, {
      messageId: messageContent.key.id
    });

    // Mensaje de éxito adicional
    await conn.reply(message.chat, 
      `✨ *BÚSQUEDA COMPLETADA* ✨\n\n` +
      `✅ Se encontraron ${results.length} videos para: "${text}"\n\n` +
      `📱 *Instrucciones:*\n` +
      `• Desliza los videos para ver más\n` +
      `• Los videos se autodestruyen después de verlos\n\n` +
      `🔍 ¿Quieres buscar algo más?`,
      message
    );

  } catch (error) {
    // Enviar reacción de error
    await conn.sendMessage(message.chat, { react: { text: "❌", key: message.key } });
    
    console.error('Error en tiktoksearch:', error);
    
    let errorMessage = `⚠️ *ERROR EN LA BÚSQUEDA*\n\n`;
    
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      errorMessage += `• No se pudo conectar con el servicio de búsqueda\n`;
    } else if (error.response?.status) {
      errorMessage += `• Error ${error.response.status} en la API\n`;
    } else if (error.message?.includes('timeout')) {
      errorMessage += `• La búsqueda tardó demasiado tiempo\n`;
    } else {
      errorMessage += `• Error: ${error.message || 'Desconocido'}\n`;
    }
    
    errorMessage += `\n💡 *Solución:*\n`;
    errorMessage += `• Verifica tu conexión a internet\n`;
    errorMessage += `• Intenta con otra búsqueda\n`;
    errorMessage += `• Espera unos minutos e intenta de nuevo\n`;
    
    await conn.reply(message.chat, errorMessage, message);
  }
};

// Configuración del comando
handler.help = ["tiktoksearch <texto>"];
handler.register = true;
handler.group = true;
handler.tags = ["buscador", "entretenimiento"];
handler.command = ["tiktoksearch", "ttss", "tiktoks", "buscatiktok"];
handler.premium = false;
handler.limit = true;
handler.cooldown = 10000; // 10 segundos de cooldown

export default handler;