import { setTimeout } from 'timers/promises'

let handler = async (m, { conn }) => {
  const user = global.db.data.users[m.sender]
  
  if (!user.cyberHunter) {
    user.cyberHunter = {
      rank: "Novato",
      level: 1,
      hp: 100,
      maxHp: 100,
      attack: 20,
      defense: 10,
      cyberware: 0,
      reputation: 0,
      missionsCompleted: 0,
      missionsFailed: 0,
      lastMission: 0
    }
  }
  
  // Cooldown de hackeo (30 minutos)
  const HACK_COOLDOWN = 30 * 60 * 1000
  const now = Date.now()
  
  if (!user.cyberHunter.lastHack) user.cyberHunter.lastHack = 0
  const timeLeft = user.cyberHunter.lastHack + HACK_COOLDOWN - now
  
  if (timeLeft > 0) {
    const minutes = Math.ceil(timeLeft / 60000)
    return m.reply(`🔒 Firewall activado. Espera ${minutes} minutos.`)
  }
  
  user.cyberHunter.lastHack = now
  
  // Sistemas a hackear
  const targets = [
    { name: "⚡ NeuroCorp Security", difficulty: "Media", baseReward: 300 },
    { name: "🔐 MegaBank Systems", difficulty: "Alta", baseReward: 500 },
    { name: "💊 BioTech Pharma", difficulty: "Baja", baseReward: 200 },
    { name: "🌐 Global Network Inc", difficulty: "Extrema", baseReward: 800 }
  ]
  
  const target = targets[Math.floor(Math.random() * targets.length)]
  
  let hackMessage = []
  hackMessage.push(`🖥️ *INICIANDO HACKEO* 🖥️`)
  hackMessage.push(`🎯 Objetivo: ${target.name}`)
  hackMessage.push(`⚠️ Dificultad: ${target.difficulty}`)
  hackMessage.push(``)
  
  // Simulación de hackeo
  const stages = [
    { text: "🟢 Bypass de firewall...", delay: 1000 },
    { text: "🔵 Acceso a servidor principal...", delay: 1500 },
    { text: "🟡 Descarga de datos...", delay: 2000 },
    { text: "🟠 Eliminando rastros...", delay: 1500 },
    { text: "🔴 Conexión segura establecida...", delay: 1000 }
  ]
  
  for (let stage of stages) {
    await setTimeout(stage.delay)
    hackMessage.push(stage.text)
    
    // 15% de chance de detección
    if (Math.random() < 0.15) {
      const penalty = Math.floor(Math.random() * 100) + 50
      user.credit = Math.max(0, (user.credit || 0) - penalty)
      
      hackMessage.push(`\n🚨 *¡DETECTADO POR SISTEMAS DE SEGURIDAD!*`)
      hackMessage.push(`💸 Multa de seguridad: ${penalty} créditos`)
      hackMessage.push(`🔥 Abortando operación...`)
      
      return m.reply(hackMessage.join('\n'))
    }
  }
  
  // Recompensa exitosa
  const successBonus = user.cyberHunter.level * 15
  const totalReward = target.baseReward + successBonus + Math.floor(Math.random() * 200)
  
  // Recompensa especial (5% chance)
  let specialBonus = ""
  if (Math.random() < 0.05) {
    user.cyberHunter.attack += 3
    specialBonus = "\n✨ *Bonus:* +3 ATK (Chip de hacking obtenido)"
  }
  
  user.credit = (user.credit || 0) + totalReward
  user.cyberHunter.reputation += 5
  
  hackMessage.push(``)
  hackMessage.push(`✅ *HACKEO EXITOSO*`)
  hackMessage.push(`💰 Recompensa: ${totalReward} créditos`)
  hackMessage.push(`🌟 +5 reputación`)
  hackMessage.push(specialBonus)
  hackMessage.push(``)
  hackMessage.push(`💳 Saldo actual: ${user.credit} ⚡`)
  hackMessage.push(`⏳ Próximo hackeo en 30 minutos`)
  
  await m.reply(hackMessage.join('\n'))
}

handler.help = ['hack', 'hackear']
handler.tags = ['rpg']
handler.command = /^(hack|hackear|databreach)$/i
handler.group = true
handler.register = true

export default handler