let handler = m => m

handler.before = async function (m, { conn }) {
    if (m.key.fromMe) return
    if (!m.isGroup && !m.chat.endsWith('@s.whatsapp.net')) return
    if (m.text.length < 2) return // Ignorar mensajes muy cortos

    const texto = m.text.toLowerCase().trim()
    
    const respuestas = {
        'hola': 'Hola ¿cómo estás?',
        'buenos días': 'Buenos días',
        'buenas tardes': 'Buenas tardes',
        'buenas noches': 'Buenas noches',
        'qué tal': 'Bien ¿y tú?',
        'qué haces': 'Aquí en línea',
        'hey': '¿Qué tal?',
        'ola': 'Hola',
        'que onda': 'Todo bien'
    }

    for (const [saludo, respuesta] of Object.entries(respuestas)) {
        if (texto.includes(saludo)) {
            await conn.sendPresenceUpdate('composing', m.chat)
            await new Promise(r => setTimeout(r, 800))
            await conn.reply(m.chat, respuesta, m)
            return true // Importante: detener ejecución
        }
    }
    return null
}

export default handler