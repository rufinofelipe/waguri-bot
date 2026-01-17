let handler = async (m, { conn }) => {
  // Mensaje de prueba para confirmar que el comando se ejecuta
  conn.reply(m.chat, '¡El comando !trabajar se ejecutó correctamente! 🎉\n\nSi ves esto, el handler funciona. Ahora vamos a probar más cosas.', m)

  // Segundo mensaje para confirmar que llega hasta aquí
  conn.reply(m.chat, 'Segundo mensaje: todo bien hasta aquí. 😎', m)

  // Tercer mensaje final (con variables simples para probar interpolación)
  let prueba = 123
  let texto = `Tercer mensaje: prueba = \( {prueba} \nSi ves 123, la interpolación con \) funciona.`
  conn.reply(m.chat, texto, m)
}

handler.help = ['trabajar']
handler.tags = ['economy']
handler.command = /^(trabajar|work|job)$/i
handler.group = true
handler.register = true

export default handler