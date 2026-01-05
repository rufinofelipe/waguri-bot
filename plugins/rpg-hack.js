let handler = async (m, { conn, usedPrefix }) => {
  const user = global.db.data.users[m.sender]
  
  if (!user.cyberHunter) {
    return m.reply('❌ Primero debes registrar un perfil con /cazar')
  }
  
  // Cooldown de hackeo (30 minutos)
  const HACK_COOLDOWN = 30 * 60 * 1000
  const now = Date.now()
  
  if (!user.lastHack) user.lastHack = 0
  const timeLeft = user.lastHack + HACK_COOLDOWN - now
  
  if (timeLeft > 0) {
    const minutes = Math.ceil(timeLeft / 60000)
    return m.reply(`🔒 Firewall activado. Espera ${minutes} minutos.`)
  }
  
  user.lastHack = now
  
  // Sistema de hackeo con minijuego
  const targetCorporations = [
    { name: "⚡ NeuroCorp Security", difficulty: "Media", baseReward: 300 },
    { name: "🔐 MegaBank Systems", difficulty: "Alta", baseReward: 500 },
    { name: "💊 BioTech Pharma", difficulty: "Baja", baseReward: 200 },
    { name: "🌐 Global Network Inc", difficulty: "Extrema", baseReward: 800 }
  ]
  
  const target = targetCorporations[Math.floor(Math.random() * targetCorporations.length)]
  
  let hackMessage = []
  hackMessage.push(`🖥️ *INICIANDO HACKEO* 🖥️`)
  hackMessage.push(`🎯 Objetivo: ${target.name}`)
  hackMessage.push(`⚠️ Dificultad: ${target.difficulty}`)
  hackMessage.push(``)
  
  // Minijuego de hackeo (simulado)
  const hackStages = [
    "🟢 Bypass de firewall...",
    "🔵 Acceso a servidor principal...",
    "🟡 Descarga de datos...",
    "🟠 Eliminando rastros...",
    "🔴 Conexión segura establecida..."
  ]
  
  for (let i = 0; i < hackStages.length; i++) {
    await setTimeout(1000)
    hackMessage.push(hackStages[i])
    
    // 10% de chance de detección en cada etapa
    if (Math.random() < 0.1) {
      const detectionLoss = Math.floor(Math.random() * 100) + 50
      user.credit = Math.max(0, (user.credit || 0) - detectionLoss)
      
      hackMessage.push(`🚨 ¡DETECTADO!`)
      hackMessage.push(`💸 Multa: ${detectionLoss} créditos`)
      hackMessage.push(`🔥 Abortando operación...`)
      
      await m.reply(hackMessage.join('\n'))
      return
    }
  }
  
  // Recompensa exitosa
  const successBonus = user.cyberHunter.level * 10
  const totalReward = target.baseReward + successBonus + Math.floor(Math.random() * 200)
  
  // Recompensas especiales (raras)
  let specialReward = ""
  if (Math.random() < 0.05) {
    user.cyberHunter.attack += 5
    specialReward = "\n✨ +5 ATK permanente (Chip de hacking obtenido)"
  }
  
  user.credit = (user.credit || 0) + totalReward
  user.cyberHunter.reputation += 10
  
  hackMessage.push(``)
  hackMessage.push(`✅ *HACKEO EXITOSO*`)
  hackMessage.push(`💰 Recompensa: ${totalReward} créditos`)
  hackMessage.push(`🌟 +10 reputación`)
  hackMessage.push(specialReward)
  hackMessage.push(``)
  hackMessage.push(`💳 Saldo actual: ${user.credit} ⚡`)
  hackMessage.push(`⏳ Próximo hackeo en 30 minutos`)
  
  await m.reply(hackMessage.join('\n'))
}

handler.help = ['hack', 'hackear', 'databreach']
handler.tags = ['rpg', 'cyberpunk']
handler.command = ['hack', 'hackear']
handler.cooldown = 1800000 // 30 minutos

export default handler