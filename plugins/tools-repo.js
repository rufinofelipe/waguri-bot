let handler = async (m, { conn }) => {
  const repoUrl = 'https://github.com/rufinofelipe/waguri-bot'
  
  // Mensaje principal con formato atractivo
  let message = `
🌟 *WAGURI BOT - REPOSITORIO OFICIAL* 🌟

📛 *Nombre:* Waguri Bot
📝 *Descripción:* Bot de WhatsApp con RPG Cyberpunk y economía virtual

═══════════════════════════

⭐ *¡REGÁLANOS UNA ESTRELLA!* ⭐
Tu apoyo es muy importante para nosotros.
Cada estrella en GitHub nos motiva a seguir mejorando el bot.

═══════════════════════════

🔗 *ENLACE AL REPOSITORIO:*
${repoUrl}

═══════════════════════════

👨‍💻 *EQUIPO DE DESARROLLO:*

👑 *Rufino* - @rufinofelipe
   Dueño y Desarrollador Principal

🚀 *DuarteXV* - @DuarteXV
   Colaborador y Desarrollador

💡 *Anderson*
   Colaborador y Tester

═══════════════════════════

🎮 *CARACTERÍSTICAS:*
• Sistema RPG Cyberpunk completo
• Economía con Waguri Coins
• Juegos y sistema de apuestas
• Sistema de trabajos y profesiones
• Banco y sistema financiero
• Tienda y sistema de inventario
• Robos, cárcel y sistema criminal
• Comandos sociales y grupales

═══════════════════════════

🛠️ *¿CÓMO APOYAR EL PROYECTO?*
1. Visita: ${repoUrl}
2. Inicia sesión en GitHub
3. Haz clic en ★ Star
4. ¡Listo! Ya nos ayudaste

═══════════════════════════

🤝 *¿QUIERES CONTRIBUIR?*
• Reporta bugs en Issues
• Sugiere nuevas funciones
• Comparte el bot con amigos
• Únete al desarrollo

═══════════════════════════

🎉 *¡GRACIAS POR TU APOYO!*
Cada estrella, cada sugerencia,
cada reporte de bug...
¡Todo ayuda a mejorar Waguri Bot!
  `.trim()
  
  await m.reply(message)
}

handler.help = ['repo','repositorio']
handler.tags = ['main']
handler.command = /^(repo|repositorio)$/i
handler.group = true
handler.register = false

export default handler