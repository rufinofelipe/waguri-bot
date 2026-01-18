let handler = async (m, { conn }) => {
    // Solo responde en chats privados o grupos (puedes quitar uno si quieres)
    if (!m.isGroup && !m.chat.endsWith('@s.whatsapp.net')) return

    // Ignorar mensajes del propio bot
    if (m.key.fromMe) return

    const texto = m.text.toLowerCase().trim()

    // Lista de saludos y respuestas (puedes añadir más)
    const saludos = {
        'hola': '¡Holaaa! ¿Qué tal? 😏',
        'buenos días': '¡Buenos días, guapo/a! 🌞 ¿Cómo amaneciste?',
        'buenas tardes': '¡Buenas tardes! ☀️ ¿Ya comiste o sigues en ayunas? 😜',
        'buenas noches': '¡Buenas noches! 🌙 ¿Ya te vas a dormir o me vas a extrañar? 😘',
        'qué tal': 'Todo bien por aquí 🔥 ¿Y tú qué tal, rico/a? 😉',
        'qué haces': 'Aquí esperando que me escribas 😏 ¿Y tú qué haces, travieso/a?',
        'hey': '¡Heyy! ¿Me extrañabas? 😈',
        'ola': '¡Ola ke ase! 😂 ¿Qué pasa, crack?',
        'que onda': '¡Qué ondaaa! ¿Todo chido o qué pedo? 😎'
    }

    // Comprobar si el mensaje coincide con alguna clave
    for (let saludo in saludos) {
        if (texto.includes(saludo)) {
            // Pequeño delay para que parezca más natural (opcional)
            await conn.sendPresenceUpdate('composing', m.chat)
            await new Promise(r => setTimeout(r, 800 + Math.random() * 600))

            return conn.reply(m.chat, saludos[saludo], m)
        }
    }
}

handler.help = 'responder'
handler.comand = 'hola'
handler.group = true
handler.private = true  // Responde tanto en grupos como en privado

export default handler