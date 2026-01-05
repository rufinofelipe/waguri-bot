let handler = async (m, { conn, usedPrefix, command, args }) => {
  const user = global.db.data.users[m.sender]
  
  if (!user.economy) initEconomy(user)
  
  const formatNumber = (num) => new Intl.NumberFormat('es-ES').format(num)
  
  // Verificar si está en la cárcel
  if (user.economy.inJail) {
    const timeLeft = Math.ceil((user.economy.jailTime - Date.now()) / 60000)
    return m.reply(`🚨 Estás en la cárcel (${timeLeft}min restantes). No puedes apostar.`)
  }
  
  // Mostrar menú del casino
  if (!args[0]) {
    return m.reply(
      `🎰 *CASINO WAGURI*\n\n` +
      `💰 Tu saldo: ${formatNumber(user.economy.waguri)} WC\n\n` +
      `🎮 *JUEGOS DISPONIBLES:*\n` +
      `🎯 ${usedPrefix}coinflip <cantidad> - Cara o cruz\n` +
      `🎲 ${usedPrefix}dado <cantidad> <número> - Apostar a dado\n` +
      `🔄 ${usedPrefix}ruleta <color/número> <cantidad> - Ruleta\n` +
      `🃏 ${usedPrefix}blackjack <cantidad> - Blackjack\n\n` +
      `📌 *EJEMPLOS:*\n` +
      `${usedPrefix}coinflip 100\n` +
      `${usedPrefix}dado 200 5\n` +
      `${usedPrefix}ruleta rojo 300\n\n` +
      `⚠️ *ADVERTENCIA:* Las apuestas pueden resultar en pérdidas.`
    )
  }
  
  // Verificar comando específico
  const game = args[0].toLowerCase()
  const amount = parseInt(args[1])
  
  if (isNaN(amount) || amount <= 0) {
    return m.reply('❌ Especifica una cantidad válida para apostar.')
  }
  
  if (amount > user.economy.waguri) {
    return m.reply(
      `❌ *FONDOS INSUFICIENTES*\n\n` +
      `Quieres apostar: ${formatNumber(amount)} WC\n` +
      `Tienes: ${formatNumber(user.economy.waguri)} WC`
    )
  }
  
  if (amount > 5000) {
    return m.reply('❌ Límite de apuesta: 5,000 WC por juego.')
  }
  
  // Juego: Cara o Cruz
  if (game === 'coinflip') {
    const choice = args[2] ? args[2].toLowerCase() : ''
    const validChoices = ['cara', 'cruz', 'head', 'tail']
    
    if (!choice || !validChoices.includes(choice)) {
      return m.reply(
        `🎯 *COINFLIP - Cara o Cruz*\n\n` +
        `Uso: ${usedPrefix}coinflip <cantidad> <cara/cruz>\n` +
        `Ejemplo: ${usedPrefix}coinflip 100 cara\n\n` +
        `💰 Multiplicador: x2 si aciertas`
      )
    }
    
    const result = Math.random() < 0.5 ? 'cara' : 'cruz'
    const win = choice === result
    
    if (win) {
      const winAmount = amount * 2
      user.economy.waguri += winAmount
      
      await m.reply(
        `💰 *¡GANASTE!*\n\n` +
        `🎯 Elegiste: ${choice}\n` +
        `🪙 Resultado: ${result}\n\n` +
        `✅ Ganaste: ${formatNumber(winAmount)} WC\n` +
        `💳 Nuevo saldo: ${formatNumber(user.economy.waguri)} WC`
      )
    } else {
      user.economy.waguri -= amount
      
      await m.reply(
        `❌ *PERDISTE*\n\n` +
        `🎯 Elegiste: ${choice}\n` +
        `🪙 Resultado: ${result}\n\n` +
        `💸 Perdiste: ${formatNumber(amount)} WC\n` +
        `💳 Nuevo saldo: ${formatNumber(user.economy.waguri)} WC`
      )
    }
    
    return
  }
  
  // Juego: Dados
  if (game === 'dado') {
    const number = parseInt(args[2])
    
    if (!number || number < 1 || number > 6) {
      return m.reply(
        `🎲 *JUEGO DE DADOS*\n\n` +
        `Uso: ${usedPrefix}dado <cantidad> <número 1-6>\n` +
        `Ejemplo: ${usedPrefix}dado 100 3\n\n` +
        `💰 Multiplicador: x6 si aciertas`
      )
    }
    
    const diceRoll = Math.floor(Math.random() * 6) + 1
    const win = diceRoll === number
    
    if (win) {
      const winAmount = amount * 6
      user.economy.waguri += winAmount
      
      await m.reply(
        `💰 *¡GANASTE!*\n\n` +
        `🎯 Apostaste al: ${number}\n` +
        `🎲 Dado cayó en: ${diceRoll}\n\n` +
        `✅ Ganaste: ${formatNumber(winAmount)} WC\n` +
        `💳 Nuevo saldo: ${formatNumber(user.economy.waguri)} WC`
      )
    } else {
      user.economy.waguri -= amount
      
      await m.reply(
        `❌ *PERDISTE*\n\n` +
        `🎯 Apostaste al: ${number}\n` +
        `🎲 Dado cayó en: ${diceRoll}\n\n` +
        `💸 Perdiste: ${formatNumber(amount)} WC\n` +
        `💳 Nuevo saldo: ${formatNumber(user.economy.waguri)} WC`
      )
    }
    
    return
  }
  
  // Juego: Ruleta
  if (game === 'ruleta') {
    const bet = args[2]
    
    if (!bet) {
      return m.reply(
        `🔄 *RULETA*\n\n` +
        `*Apuestas disponibles:*\n` +
        `🔴 rojo - x2\n` +
        `⚫ negro - x2\n` +
        `🟢 verde - x14\n` +
        `1-36 (número) - x36\n\n` +
        `Uso: ${usedPrefix}ruleta <apuesta> <cantidad>\n` +
        `Ejemplos:\n` +
        `${usedPrefix}ruleta rojo 100\n` +
        `${usedPrefix}ruleta 7 50\n` +
        `${usedPrefix}ruleta verde 30`
      )
    }
    
    // Generar número de ruleta 0-36
    const rouletteNumber = Math.floor(Math.random() * 37)
    
    // Determinar color
    let color = 'verde' // 0
    if (rouletteNumber >= 1 && rouletteNumber <= 10) {
      color = (rouletteNumber % 2 === 0) ? 'negro' : 'rojo'
    } else if (rouletteNumber >= 11 && rouletteNumber <= 18) {
      color = (rouletteNumber % 2 === 0) ? 'rojo' : 'negro'
    } else if (rouletteNumber >= 19 && rouletteNumber <= 28) {
      color = (rouletteNumber % 2 === 0) ? 'negro' : 'rojo'
    } else if (rouletteNumber >= 29 && rouletteNumber <= 36) {
      color = (rouletteNumber % 2 === 0) ? 'rojo' : 'negro'
    }
    
    let win = false
    let multiplier = 1
    
    // Verificar apuesta
    if (bet === 'rojo' || bet === 'negro') {
      win = color === bet
      multiplier = 2
    } else if (bet === 'verde') {
      win = rouletteNumber === 0
      multiplier = 14
    } else {
      const betNumber = parseInt(bet)
      if (!isNaN(betNumber) && betNumber >= 0 && betNumber <= 36) {
        win = rouletteNumber === betNumber
        multiplier = 36
      } else {
        return m.reply('❌ Apuesta inválida. Usa: rojo, negro, verde o un número 0-36.')
      }
    }
    
    if (win) {
      const winAmount = amount * multiplier
      user.economy.waguri += winAmount
      
      await m.reply(
        `💰 *¡GANASTE!*\n\n` +
        `🎯 Apostaste: ${bet}\n` +
        `🔄 Ruleta: ${rouletteNumber} (${color})\n\n` +
        `✅ Ganaste: ${formatNumber(winAmount)} WC\n` +
        `💳 Nuevo saldo: ${formatNumber(user.economy.waguri)} WC`
      )
    } else {
      user.economy.waguri -= amount
      
      await m.reply(
        `❌ *PERDISTE*\n\n` +
        `🎯 Apostaste: ${bet}\n` +
        `🔄 Ruleta: ${rouletteNumber} (${color})\n\n` +
        `💸 Perdiste: ${formatNumber(amount)} WC\n` +
        `💳 Nuevo saldo: ${formatNumber(user.economy.waguri)} WC`
      )
    }
    
    return
  }
  
  // Si no reconoce el juego
  return m.reply(
    `❌ Juego no reconocido.\n\n` +
    `🎮 Juegos disponibles:\n` +
    `• ${usedPrefix}coinflip\n` +
    `• ${usedPrefix}dado\n` +
    `• ${usedPrefix}ruleta`
  )
}

function initEconomy(user) {
  user.economy = {
    waguri: 1000,
    inJail: false,
    jailTime: 0
  }
}

handler.help = ['casino', 'apostar', 'coinflip <cantidad> <cara/cruz>', 'dado <cantidad> <número>', 'ruleta <apuesta> <cantidad>']
handler.tags = ['economy', 'games']
handler.command = /^(casino|apostar|coinflip|dado|ruleta|blackjack)$/i
handler.group = true
handler.register = true

export default handler