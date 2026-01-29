// By Rufino - Comando para robar dinero
let cooldownRobo = {}

let handler = async (m, { conn, usedPrefix }) => {
    let user = global.db.data.users[m.sender]
    let userId = m.sender
    
    // Cooldown de 30 minutos
    if (cooldownRobo[userId] && Date.now() - cooldownRobo[userId] < 30 * 60 * 1000) {
        let tiempo = Math.ceil((cooldownRobo[userId] + 30 * 60 * 1000 - Date.now()) / 1000)
        let minutos = Math.floor(tiempo / 60)
        let segundos = tiempo % 60
        return m.reply(`⏳ Puedes volver a robar en ${minutos}m ${segundos}s`)
    }
    
    // Verificar si hay usuario mencionado
    if (!m.mentionedJid || m.mentionedJid.length === 0) {
        return m.reply(`📍 Usa: ${usedPrefix}rob @usuario`)
    }
    
    let victima = m.mentionedJid[0]
    
    // Validaciones básicas
    if (victima === userId) return
    if (victima === conn.user.jid) return
    if (!(victima in global.db.data.users)) return
    
    let usuarioVictima = global.db.data.users[victima]
    let nombreRobador = conn.getName(userId)
    let nombreVictima = conn.getName(victima)
    
    // Verificar que tenga al menos 300 monedas
    if (!usuarioVictima.coin || usuarioVictima.coin < 300) {
        return m.reply(`❌ ${nombreVictima} no tiene suficiente dinero para robar`)
    }
    
    // Aplicar cooldown
    cooldownRobo[userId] = Date.now()
    
    // Calcular monto a robar (20-50% del efectivo)
    let porcentaje = 20 + Math.floor(Math.random() * 31) // 20-50%
    let montoRobo = Math.floor(usuarioVictima.coin * (porcentaje / 100))
    montoRobo = Math.max(1, montoRobo)
    
    // Probabilidad de éxito 50%
    let exito = Math.random() < 0.5
    
    if (exito) {
        // Robo exitoso
        let montoFinal = Math.min(montoRobo, usuarioVictima.coin)
        
        user.coin += montoFinal
        usuarioVictima.coin -= montoFinal
        
        await m.reply(`✅ Le robaste *${montoFinal} ${moneda}* a ${nombreVictima}`)
        
    } else {
        // Robo fallido
        await m.reply(`❌ Fallaste al robar a ${nombreVictima}`)
    }
}

handler.help = ['rob']
handler.tags = ['rpg']
handler.command = ['rob', 'robar']
handler.group = true
handler.register = true

export default handler