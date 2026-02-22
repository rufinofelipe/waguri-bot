const axios = require("axios");

// En tu manejador de mensajes principal
async function handleMessage(sock, msg) {
  const body = msg.message?.conversation || 
                msg.message?.extendedTextMessage?.text || "";

  if (!body.startsWith(".img ")) return;

  const prompt = body.slice(5).trim();
  const from = msg.key.remoteJid;

  if (!prompt) {
    await sock.sendMessage(from, { text: "⚠️ Escribe una descripción. Ejemplo: `.img un gato astronauta`" });
    return;
  }

  // Mensaje de espera
  await sock.sendMessage(from, { text: "🎨 Generando imagen, espera un momento..." });

  try {
    const response = await axios.get("https://api.evogb.org/ai/nanobanana", {
      params: {
        key: "evogb-3Tjfq4Rj",
        method: "url",         // Generación desde prompt (sin imagen base)
        prompt: prompt,
      },
      timeout: 30000
    });

    const data = response.data;

    // Ajusta según la estructura real que devuelve la API
    const imageUrl = data?.result?.url || data?.url || data?.image;

    if (!imageUrl) {
      await sock.sendMessage(from, { text: "❌ No se pudo obtener la imagen." });
      return;
    }

    // Descargar la imagen como buffer
    const imageResponse = await axios.get(imageUrl, { responseType: "arraybuffer" });
    const imageBuffer = Buffer.from(imageResponse.data);

    // Enviar la imagen
    await sock.sendMessage(from, {
      image: imageBuffer,
      caption: `🖼️ *${prompt}*`,
    }, { quoted: msg });

  } catch (error) {
    console.error("Error al generar imagen:", error.message);
    await sock.sendMessage(from, { text: "❌ Ocurrió un error al generar la imagen." });
  }
}