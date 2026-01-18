let handler = async (m, { conn }) => {
    if (m.key.fromMe) return
    if (!m.isGroup && !m.chat.endsWith('@s.whatsapp.net')) return

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
            return conn.reply(m.chat, respuesta, m)
        }
    }
}

handler.help = ['autoresponder']
handler.tags = ['general']
handler.command = null  // Importante: sin comando específico
handler.group = true
handler.private = true
handler.register = true

export default handler