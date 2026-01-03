 //créditos By DuarteXV                     //                             import axios from 'axios'

let handler = async (m, { conn, usedPrefix, command, text }) => {
  const username = `${conn.getName(m.sender)}`

  if (!text) {
    return conn.reply(m.chat, `*[ ❁ ] Por favor, escribe tu mensaje para hablar con gemini.*`, m)
  }

  await conn.sendPresenceUpdate('composing', m.chat)

  try {
    const response = await geminiChat(text)
    await conn.reply(m.chat, response, m)
  } catch (error) {
    console.error('Error:', error)
    await conn.reply(m.chat, '*Error al conectar con la API.*', m)
  }
}

handler.help = ['gemini']
handler.tags = ['ai']
handler.register = true
handler.command = ['gemini']
export default handler

async function geminiChat(q) {
  try {
    const response = await axios.get(
      `https://api-adonix.ultraplus.click/ai/geminiact?apikey=Adofreekey&text=${encodeURIComponent(q)}&role=user`
    )
    return response.data.message
  } catch (error) {
    console.error('Error:', error)
    throw error
  }
}