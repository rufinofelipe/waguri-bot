let handler = async (m, { conn, usedPrefix }) => {
  const user = global.db.data.users[m.sender]
  
  // Asegurar que exista la estructura cyberHunter
  if (!user.cyberHunter) {
    user.cyberHunter = {
      rank: "Novato",
      level: 1,
      hp: 100,
      maxHp: 100,
      attack: 20,
      defense: 10,
      cyberware: 0,
      credits: 0,
      reputation: 0,
      missionsCompleted: 0,
      missionsFailed: 0,
      lastMission: 0
    }
  }
  
  // Calcular tiempo restante para próxima misión
  const now = Date.now()
  const lastMissionTime = user.cyberHunter.lastMission || 0
  const cooldown = 300000 // 5 minutos en milisegundos
  const nextMissionTime = lastMissionTime + cooldown
  const remainingTime = nextMissionTime - now
  
  let cooldownText = "🟢 LISTO"
  if (remainingTime > 0) {
    const minutes = Math.ceil(remainingTime / 1000 / 60)
    cooldownText = `⏳ ${minutes} min`
  }
  
  // Calcular porcentaje de progreso de nivel
  const cyberwareNeeded = user.cyberHunter.level * 100
  const progressPercentage = Math.min(100, Math.floor((user.cyberHunter.cyberware / cyberwareNeeded) * 100))
  
  // Crear barra de progreso visual
  const progressBarLength = 10
  const filledBlocks = Math.floor((progressPercentage / 100) * progressBarLength)
  const emptyBlocks = progressBarLength - filledBlocks
  const progressBar = '█'.repeat(filledBlocks) + '░'.repeat(emptyBlocks)
  
  // Determinar el siguiente rango
  const ranks = ["Novato", "Operativo", "Experto", "Élite", "Legendario", "Mítico"]
  const currentRankIndex = ranks.indexOf(user.cyberHunter.rank)
  const nextRank = currentRankIndex < ranks.length - 1 ? ranks[currentRankIndex + 1] : "MAX"
  
  // Crear el mensaje del perfil
  let profileMessage = []
  
  profileMessage.push(`⚡ *PERFIL DE CAZADOR CYBERPUNK* ⚡`)
  profileMessage.push(`👤 *ID:* @${m.sender.split('@')[0]}`)
  profileMessage.push(``)
  
  profileMessage.push(`🏆 *INFORMACIÓN DE RANGO*`)
  profileMessage.push(`🎖️ Rango Actual: *${user.cyberHunter.rank}*`)
  if (nextRank !== "MAX") {
    profileMessage.push(`🚀 Próximo Rango: *${nextRank}* (Nivel ${user.cyberHunter.level + 1})`)
  }
  profileMessage.push(`📊 Nivel: *${user.cyberHunter.level}*`)
  profileMessage.push(``)
  
  profileMessage.push(`💾 *CYBERWARE Y PROGRESO*`)
  profileMessage.push(`⚙️ Cyberware: *${user.cyberHunter.cyberware}/${cyberwareNeeded}*`)
  profileMessage.push(`📈 ${progressBar} ${progressPercentage}%`)
  profileMessage.push(``)
  
  profileMessage.push(`💰 *ECONOMÍA DIGITAL*`)
  profileMessage.push(`💳 Créditos: *${user.credit || 0}* ⚡`)
  profileMessage.push(`🌟 Reputación: *${user.cyberHunter.reputation}* estrellas`)
  profileMessage.push(``)
  
  profileMessage.push(`❤️ *ESTADÍSTICAS DE COMBATE*`)
  profileMessage.push(`🩸 HP: *${user.cyberHunter.hp}/${user.cyberHunter.maxHp}*`)
  profileMessage.push(`⚔️ Ataque: *${user.cyberHunter.attack}*`)
  profileMessage.push(`🛡️ Defensa: *${user.cyberHunter.defense}*`)
  profileMessage.push(``)
  
  profileMessage.push(`📊 *HISTORIAL DE MISIONES*`)
  profileMessage.push(`✅ Completadas: *${user.cyberHunter.missionsCompleted}*`)
  profileMessage.push(`❌ Fallidas: *${user.cyberHunter.missionsFailed}*`)
  const successRate = user.cyberHunter.missionsCompleted + user.cyberHunter.missionsFailed > 0 
    ? Math.round((user.cyberHunter.missionsCompleted / (user.cyberHunter.missionsCompleted + user.cyberHunter.missionsFailed)) * 100)
    : 0
  profileMessage.push(`📈 Tasa de éxito: *${successRate}%*`)
  profileMessage.push(``)
  
  profileMessage.push(`⏰ *DISPONIBILIDAD*`)
  profileMessage.push(`🎯 Próxima misión: ${cooldownText}`)
  if (remainingTime > 0) {
    const mins = Math.floor(remainingTime / 1000 / 60)
    const secs = Math.floor((remainingTime / 1000) % 60)
    profileMessage.push(`⏱️ Tiempo restante: ${mins}m ${secs}s`)
  }
  profileMessage.push(``)
  
  profileMessage.push(`🔧 *COMANDOS DISPONIBLES*`)
  profileMessage.push(`• ${usedPrefix}cazar - Iniciar nueva misión`)
  profileMessage.push(`• ${usedPrefix}perfil - Ver este perfil`)
  profileMessage.push(`• ${usedPrefix}tienda - Comprar mejoras (próximamente)`)
  
  // Enviar el mensaje
  await conn.sendMessage(m.chat, {
    text: profileMessage.join('\n'),
    mentions: [m.sender]
  }, { quoted: m })
}

handler.help = ['perfil', 'profile', 'stats', 'estadisticas']
handler.tags = ['rpg']
handler.command = /^(perfil|profile|stats|estadisticas|cyberstats)$/i
handler.group = true
handler.register = true

export default handler