let handler = async (m, { conn, usedPrefix, command, args, mentionedJid }) => {
  const user = global.db.data.users[m.sender]
  
  // Inicializar economía si no existe
  if (!user.economy) {
    user.economy = {
      waguri: 1000, // Dinero en mano
      bank: 0, // Dinero en banco
      bankLimit: 10000, // Límite inicial del banco
      lastDaily: 0,
      lastWork: 0,
      job: null,
      inventory: [],
      robberyCooldown: 0,
      inJail: false,
      jailTime: 0,
      robberySuccess: 0,
      robberyFails: 0,
      protected: false,
      protectionExpires: 0,
      transactions: []
    }
  }
  
  // Función para formatear números
  const formatNumber = (num) => new Intl.NumberFormat('es-ES').format(num)
  
  // Función para registrar transacción
  const registerTransaction = (type, amount, description) => {
    if (!user.economy.transactions) user.economy.transactions = []
    user.economy.transactions.unshift({
      type,
      amount,
      description,
      date: new Date().toISOString(),
      timestamp: Date.now()
    })
    
    // Mantener solo las últimas 50 transacciones
    if (user.economy.transactions.length > 50) {
      user.economy.transactions = user.economy.transactions.slice(0, 50)
    }
  }
  
  // COMANDO: .balance / .saldo
  if (command === 'balance' || command === 'saldo') {
    let targetUser = user
    let targetJid = m.sender
    let targetName = 'Tú'
    
    // Si mencionan a alguien, mostrar su saldo
    if (mentionedJid && mentionedJid[0]) {
      targetJid = mentionedJid[0]
      targetUser = global.db.data.users[targetJid]
      
      if (!targetUser || !targetUser.economy) {
        return m.reply('❌ Este usuario no tiene cuenta económica registrada.')
      }
      
      targetName = conn.getName(targetJid) || `@${targetJid.split('@')[0]}`
    }
    
    const cash = targetUser.economy.waguri || 0
    const bank = targetUser.economy.bank || 0
    const total = cash + bank
    const bankLimit = targetUser.economy.bankLimit || 10000
    const bankUsage = bankLimit > 0 ? Math.round((bank / bankLimit) * 100) : 0
    
    // Crear barra de uso del banco
    const barLength = 10
    const filledBlocks = Math.floor((bankUsage / 100) * barLength)
    const emptyBlocks = barLength - filledBlocks
    const bankBar = '█'.repeat(filledBlocks) + '░'.repeat(emptyBlocks)
    
    let balanceMessage = `💰 *SALDO DE ${targetName.toUpperCase()}*\n\n`
    
    if (mentionedJid && mentionedJid[0]) {
      balanceMessage += `👤 Usuario: @${targetJid.split('@')[0]}\n`
    }
    
    balanceMessage += `💵 *Efectivo:* ${formatNumber(cash)} Waguri Coins\n`
    balanceMessage += `🏦 *Banco:* ${formatNumber(bank)} Waguri Coins\n`
    balanceMessage += `📊 *Total:* ${formatNumber(total)} Waguri Coins\n\n`
    
    // Información del banco
    balanceMessage += `🏛️ *INFORMACIÓN BANCARIA*\n`
    balanceMessage += `💳 Límite del banco: ${formatNumber(bankLimit)}\n`
    balanceMessage += `📈 Uso del banco: ${bankBar} ${bankUsage}%\n`
    
    if (targetUser.economy.inJail) {
      const timeLeft = Math.ceil((targetUser.economy.jailTime - Date.now()) / 60000)
      balanceMessage += `\n🚨 *EN CÁRCEL* - ${timeLeft} minutos restantes\n`
    }
    
    if (targetUser.economy.protected && targetUser.economy.protectionExpires > Date.now()) {
      const hoursLeft = Math.ceil((targetUser.economy.protectionExpires - Date.now()) / 3600000)
      balanceMessage += `\n🛡️ *PROTEGIDO* - ${hoursLeft}h de protección\n`
    }
    
    // Mostrar el mensaje con menciones si es necesario
    const messageOptions = { quoted: m }
    if (mentionedJid && mentionedJid[0]) {
      messageOptions.mentions = [targetJid]
    }
    
    await conn.sendMessage(m.chat, {
      text: balanceMessage
    }, messageOptions)
    
    return
  }
  
  // COMANDO: .cartera
  if (command === 'cartera') {
    const cash = user.economy.waguri || 0
    const bank = user.economy.bank || 0
    const total = cash + bank
    
    // Calcular estadísticas
    const dailyIncome = user.economy.dailyIncome || 0
    const weeklyIncome = user.economy.weeklyIncome || 0
    const totalEarned = user.economy.totalEarned || total
    const totalSpent = user.economy.totalSpent || 0
    
    // Items en inventario
    const inventoryItems = user.economy.inventory || []
    const itemCount = inventoryItems.length
    
    // Robos
    const robberySuccess = user.economy.robberySuccess || 0
    const robberyFails = user.economy.robberyFails || 0
    const robberyRate = robberySuccess + robberyFails > 0 
      ? Math.round((robberySuccess / (robberySuccess + robberyFails)) * 100)
      : 0
    
    let walletMessage = `👛 *CARTERA PERSONAL*\n\n`
    walletMessage += `👤 ${conn.getName(m.sender) || 'Usuario'}\n`
    walletMessage += `🆔 @${m.sender.split('@')[0]}\n\n`
    
    walletMessage += `💰 *FONDOS*\n`
    walletMessage += `💵 Efectivo: ${formatNumber(cash)}\n`
    walletMessage += `🏦 Banco: ${formatNumber(bank)}\n`
    walletMessage += `📊 Total: ${formatNumber(total)}\n\n`
    
    walletMessage += `📈 *ESTADÍSTICAS*\n`
    walletMessage += `📦 Items: ${itemCount}\n`
    walletMessage += `🎯 Robos: ${robberySuccess}✅ ${robberyFails}❌ (${robberyRate}% éxito)\n`
    walletMessage += `💰 Ganado total: ${formatNumber(totalEarned)}\n`
    walletMessage += `💸 Gastado total: ${formatNumber(totalSpent)}\n\n`
    
    // Consejo basado en saldo
    walletMessage += `💡 *CONSEJO*\n`
    if (total < 500) {
      walletMessage += `Usa ${usedPrefix}daily para obtener dinero diario\n`
    } else if (total < 5000) {
      walletMessage += `Usa ${usedPrefix}trabajar para ganar más\n`
    } else if (bank < 1000) {
      walletMessage += `Usa ${usedPrefix}depositar para proteger tu dinero\n`
    } else {
      walletMessage += `¡Buen trabajo! Sigue acumulando riqueza\n`
    }
    
    walletMessage += `\n🔧 *COMANDOS ÚTILES:*\n`
    walletMessage += `• ${usedPrefix}depositar <cantidad>\n`
    walletMessage += `• ${usedPrefix}retirar <cantidad>\n`
    walletMessage += `• ${usedPrefix}historialeco\n`
    
    await m.reply(walletMessage)
    return
  }
  
  // COMANDO: .depositar <cantidad>
  if (command === 'depositar') {
    const amount = args[0] ? (args[0].toLowerCase() === 'all' ? user.economy.waguri : parseInt(args[0])) : 0
    
    if (!amount || isNaN(amount) || amount <= 0) {
      return m.reply(
        `🏦 *DEPOSITAR EN BANCO*\n\n` +
        `📌 Uso: ${usedPrefix}depositar <cantidad>\n` +
        `📌 Ejemplos:\n` +
        `${usedPrefix}depositar 500\n` +
        `${usedPrefix}depositar all (deposita todo)\n\n` +
        `💵 Tu efectivo: ${formatNumber(user.economy.waguri)}`
      )
    }
    
    const actualAmount = args[0].toLowerCase() === 'all' ? user.economy.waguri : amount
    
    if (actualAmount > user.economy.waguri) {
      return m.reply(
        `❌ *FONDOS INSUFICIENTES*\n\n` +
        `Quieres depositar: ${formatNumber(actualAmount)}\n` +
        `Tu efectivo: ${formatNumber(user.economy.waguri)}`
      )
    }
    
    // Verificar límite del banco
    const newBankBalance = user.economy.bank + actualAmount
    if (newBankBalance > user.economy.bankLimit) {
      const maxDeposit = user.economy.bankLimit - user.economy.bank
      return m.reply(
        `❌ *LÍMITE DEL BANCO EXCEDIDO*\n\n` +
        `Límite del banco: ${formatNumber(user.economy.bankLimit)}\n` +
        `Actualmente tienes: ${formatNumber(user.economy.bank)}\n` +
        `Puedes depositar máximo: ${formatNumber(maxDeposit)}\n\n` +
        `💡 Usa ${usedPrefix}aumentarlimite para aumentar tu límite bancario`
      )
    }
    
    // Realizar depósito
    user.economy.waguri -= actualAmount
    user.economy.bank += actualAmount
    
    // Registrar transacción
    registerTransaction('deposit', actualAmount, 'Depósito en banco')
    
    await m.reply(
      `✅ *DEPÓSITO EXITOSO*\n\n` +
      `💰 Depositaste: ${formatNumber(actualAmount)} Waguri Coins\n\n` +
      `💵 *Nuevos saldos:*\n` +
      `Efectivo: ${formatNumber(user.economy.waguri)}\n` +
      `Banco: ${formatNumber(user.economy.bank)}/${formatNumber(user.economy.bankLimit)}\n\n` +
      `🏦 Dinero seguro en el banco.`
    )
    
    return
  }
  
  // COMANDO: .retirar <cantidad>
  if (command === 'retirar') {
    const amount = args[0] ? (args[0].toLowerCase() === 'all' ? user.economy.bank : parseInt(args[0])) : 0
    
    if (!amount || isNaN(amount) || amount <= 0) {
      return m.reply(
        `🏦 *RETIRAR DEL BANCO*\n\n` +
        `📌 Uso: ${usedPrefix}retirar <cantidad>\n` +
        `📌 Ejemplos:\n` +
        `${usedPrefix}retirar 500\n` +
        `${usedPrefix}retirar all (retira todo)\n\n` +
        `🏦 Tu banco: ${formatNumber(user.economy.bank)}`
      )
    }
    
    const actualAmount = args[0].toLowerCase() === 'all' ? user.economy.bank : amount
    
    if (actualAmount > user.economy.bank) {
      return m.reply(
        `❌ *FONDOS INSUFICIENTES EN BANCO*\n\n` +
        `Quieres retirar: ${formatNumber(actualAmount)}\n` +
        `Tu banco: ${formatNumber(user.economy.bank)}`
      )
    }
    
    // Realizar retiro
    user.economy.bank -= actualAmount
    user.economy.waguri += actualAmount
    
    // Registrar transacción
    registerTransaction('withdraw', actualAmount, 'Retiro del banco')
    
    await m.reply(
      `✅ *RETIRO EXITOSO*\n\n` +
      `💰 Retiraste: ${formatNumber(actualAmount)} Waguri Coins\n\n` +
      `💵 *Nuevos saldos:*\n` +
      `Efectivo: ${formatNumber(user.economy.waguri)}\n` +
      `Banco: ${formatNumber(user.economy.bank)}/${formatNumber(user.economy.bankLimit)}\n\n` +
      `💸 Dinero disponible en efectivo.`
    )
    
    return
  }
  
  // COMANDO: .historialeco
  if (command === 'historialeco') {
    const transactions = user.economy.transactions || []
    
    if (transactions.length === 0) {
      return m.reply(
        `📊 *HISTORIAL DE TRANSACCIONES*\n\n` +
        `No hay transacciones registradas.\n` +
        `💸 Tus primeras transacciones aparecerán aquí.`
      )
    }
    
    let historyMessage = `📊 *HISTORIAL DE TRANSACCIONES*\n\n`
    historyMessage += `📈 Últimas ${Math.min(10, transactions.length)} transacciones:\n\n`
    
    const recentTransactions = transactions.slice(0, 10)
    
    recentTransactions.forEach((trans, index) => {
      const date = new Date(trans.date).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
      
      const typeEmoji = {
        'deposit': '🏦',
        'withdraw': '💸',
        'work': '💼',
        'daily': '🎁',
        'robbery': '🎯',
        'payment': '💰',
        'purchase': '🛒',
        'sale': '📦'
      }[trans.type] || '📝'
      
      const sign = trans.type === 'deposit' || trans.type === 'work' || 
                   trans.type === 'daily' || trans.type === 'robbery' || 
                   trans.type === 'payment' ? '+' : '-'
      
      historyMessage += `${index + 1}. ${typeEmoji} ${trans.description}\n`
      historyMessage += `   ${sign}${formatNumber(trans.amount)} | ${date}\n\n`
    })
    
    historyMessage += `📈 Total transacciones: ${transactions.length}\n`
    historyMessage += `💡 Usa ${usedPrefix}statscoin para más estadísticas`
    
    await m.reply(historyMessage)
    return
  }
  
  // COMANDO: .aumentarlimite
  if (command === 'aumentarlimite') {
    const currentLimit = user.economy.bankLimit || 10000
    const nextLimit = currentLimit * 2
    const upgradeCost = Math.floor(currentLimit * 0.5) // 50% del límite actual
    
    if (!args[0]) {
      return m.reply(
        `🏦 *AUMENTAR LÍMITE BANCARIO*\n\n` +
        `📊 Límite actual: ${formatNumber(currentLimit)}\n` +
        `🚀 Nuevo límite: ${formatNumber(nextLimit)}\n` +
        `💰 Costo: ${formatNumber(upgradeCost)} Waguri Coins\n\n` +
        `📌 Para confirmar:\n` +
        `${usedPrefix}aumentarlimite confirmar\n\n` +
        `💳 Tu saldo: ${formatNumber(user.economy.waguri)}`
      )
    }
    
    if (args[0].toLowerCase() !== 'confirmar') {
      return m.reply(`❌ Escribe "confirmar" para aumentar tu límite bancario.`)
    }
    
    if (user.economy.waguri < upgradeCost) {
      return m.reply(
        `❌ *FONDOS INSUFICIENTES*\n\n` +
        `Costo: ${formatNumber(upgradeCost)}\n` +
        `Tienes: ${formatNumber(user.economy.waguri)}`
      )
    }
    
    // Realizar upgrade
    user.economy.waguri -= upgradeCost
    user.economy.bankLimit = nextLimit
    
    // Registrar transacción
    registerTransaction('upgrade', upgradeCost, 'Aumentar límite bancario')
    
    await m.reply(
      `✅ *LÍMITE BANCARIO AUMENTADO*\n\n` +
      `🏦 Nuevo límite: ${formatNumber(nextLimit)}\n` +
      `💰 Costo: ${formatNumber(upgradeCost)} Waguri Coins\n\n` +
      `💵 Tu saldo: ${formatNumber(user.economy.waguri)}\n` +
      `📈 ¡Puedes guardar más dinero seguro en el banco!`
    )
    
    return
  }
  
  // COMANDO: .transferir @usuario <cantidad>
  if (command === 'transferir') {
    if (!mentionedJid || mentionedJid.length === 0 || !args[0]) {
      return m.reply(
        `💰 *TRANSFERIR DINERO*\n\n` +
        `📌 Uso: ${usedPrefix}transferir @usuario <cantidad>\n` +
        `📌 Ejemplo: ${usedPrefix}transferir @amigo 500\n\n` +
        `💵 Tu efectivo: ${formatNumber(user.economy.waguri)}\n` +
        `🏦 Tu banco: ${formatNumber(user.economy.bank)}`
      )
    }
    
    const targetJid = mentionedJid[0]
    
    if (targetJid === m.sender) {
      return m.reply('❌ No puedes transferirte a ti mismo.')
    }
    
    const amount = parseInt(args[0])
    
    if (isNaN(amount) || amount <= 0) {
      return m.reply('❌ Cantidad inválida. Debe ser un número mayor a 0.')
    }
    
    if (amount > 10000) {
      return m.reply('❌ Límite de transferencia: 10,000 Waguri Coins por operación.')
    }
    
    // Verificar si tiene suficiente dinero
    const availableMoney = user.economy.waguri + user.economy.bank
    
    if (amount > availableMoney) {
      return m.reply(
        `❌ *FONDOS INSUFICIENTES*\n\n` +
        `Quieres transferir: ${formatNumber(amount)}\n` +
        `Disponible total: ${formatNumber(availableMoney)}\n\n` +
        `💵 Efectivo: ${formatNumber(user.economy.waguri)}\n` +
        `🏦 Banco: ${formatNumber(user.economy.bank)}`
      )
    }
    
    // Prioridad: usar efectivo primero, luego banco
    let fromCash = Math.min(amount, user.economy.waguri)
    let fromBank = amount - fromCash
    
    user.economy.waguri -= fromCash
    user.economy.bank -= fromBank
    
    // Verificar usuario objetivo
    let targetUser = global.db.data.users[targetJid]
    if (!targetUser) {
      global.db.data.users[targetJid] = {}
      targetUser = global.db.data.users[targetJid]
    }
    
    if (!targetUser.economy) {
      targetUser.economy = {
        waguri: 1000,
        bank: 0,
        bankLimit: 10000,
        lastDaily: 0,
        lastWork: 0,
        job: null,
        inventory: [],
        robberyCooldown: 0,
        inJail: false,
        jailTime: 0,
        robberySuccess: 0,
        robberyFails: 0,
        protected: false,
        protectionExpires: 0,
        transactions: []
      }
    }
    
    // Transferir al objetivo
    targetUser.economy.waguri += amount
    
    // Registrar transacciones
    registerTransaction('transfer', amount, `Transferencia a @${targetJid.split('@')[0]}`)
    
    if (!targetUser.economy.transactions) targetUser.economy.transactions = []
    targetUser.economy.transactions.unshift({
      type: 'payment',
      amount: amount,
      description: `Transferencia de @${m.sender.split('@')[0]}`,
      date: new Date().toISOString(),
      timestamp: Date.now()
    })
    
    const senderName = conn.getName(m.sender) || `@${m.sender.split('@')[0]}`
    const targetName = conn.getName(targetJid) || `@${targetJid.split('@')[0]}`
    
    // Notificar al remitente
    let sourceInfo = ''
    if (fromCash > 0 && fromBank > 0) {
      sourceInfo = `(💵 ${formatNumber(fromCash)} + 🏦 ${formatNumber(fromBank)})`
    } else if (fromCash > 0) {
      sourceInfo = '(💵 de efectivo)'
    } else {
      sourceInfo = '(🏦 del banco)'
    }
    
    await m.reply(
      `✅ *TRANSFERENCIA EXITOSA*\n\n` +
      `👤 Para: ${targetName}\n` +
      `💰 Cantidad: ${formatNumber(amount)} Waguri Coins ${sourceInfo}\n\n` +
      `💵 *Tu nuevo saldo:*\n` +
      `Efectivo: ${formatNumber(user.economy.waguri)}\n` +
      `Banco: ${formatNumber(user.economy.bank)}\n\n` +
      `📧 El usuario ha sido notificado.`
    )
    
    // Notificar al receptor
    try {
      await conn.sendMessage(targetJid, {
        text: `💰 *RECIBISTE UNA TRANSFERENCIA*\n\n` +
              `👤 De: ${senderName}\n` +
              `💰 Cantidad: ${formatNumber(amount)} Waguri Coins\n\n` +
              `💵 Tu nuevo saldo: ${formatNumber(targetUser.economy.waguri)}\n\n` +
              `🎉 ¡Dinero recibido exitosamente!`
      })
    } catch (e) {
      console.log('No se pudo notificar al receptor:', e)
    }
    
    return
  }
}

handler.help = [
  'balance [@usuario]',
  'saldo [@usuario]',
  'cartera',
  'depositar <cantidad|all>',
  'retirar <cantidad|all>',
  'historialeco',
  'aumentarlimite [confirmar]',
  'transferir @usuario <cantidad>'
]

handler.tags = ['economy', 'bank']
handler.command = /^(balance|saldo|cartera|depositar|retirar|historialeco|aumentarlimite|transferir)$/i
handler.group = true
handler.register = true

export default handler