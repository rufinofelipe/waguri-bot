let handler = async (m, { conn, usedPrefix, command, args }) => {
  const user = global.db.data.users[m.sender]
  
  if (!user.economy) {
    user.economy = { inventory: [], waguri: 1000 }
  }
  
  const formatNumber = (num) => new Intl.NumberFormat('es-ES').format(num)
  
  if (!args[0]) {
    return m.reply(
      `🔧 *USAR ITEMS*\n\n` +
      `Uso: ${usedPrefix}usar <item>\n` +
      `Ejemplo: ${usedPrefix}usar pocion\n\n` +
      `📦 Tus items: ${user.economy.inventory?.length || 0}\n` +
      `🔧 ${usedPrefix}items - Ver tu inventario\n` +
      `🛒 ${usedPrefix}tienda - Comprar items`
    )
  }
  
  const itemId = args[0].toLowerCase()
  const inventory = user.economy.inventory || []
  
  // Verificar si tiene el item
  const itemIndex = inventory.indexOf(itemId)
  
  if (itemIndex === -1) {
    return m.reply(
      `❌ *NO TIENES ESTE ITEM*\n\n` +
      `Item: ${itemId}\n` +
      `📦 Tu inventario: ${inventory.length} items\n\n` +
      `🔧 Usa ${usedPrefix}items para ver lo que tienes.\n` +
      `🛒 Usa ${usedPrefix}tienda para comprarlo.`
    )
  }
  
  // Efectos de items
  const itemEffects = {
    'pocion': {
      name: '🍶 Poción de Vida',
      effect: () => {
        const healAmount = 50
        user.economy.waguri += healAmount
        return `❤️ Restaurado ${formatNumber(healAmount)} WC\n💳 Nuevo saldo: ${formatNumber(user.economy.waguri)}`
      }
    },
    'energia': {
      name: '⚡ Bebida Energética',
      effect: () => {
        if (!user.economy.nextWorkBonus) user.economy.nextWorkBonus = 0
        user.economy.nextWorkBonus = 0.2 // 20% bonus
        return `⚡ Próximo trabajo dará +20% dinero\n⏰ Efecto dura para un trabajo`
      }
    },
    'loteria': {
      name: '🎫 Ticket de Lotería',
      effect: () => {
        // Sistema de lotería simple
        const winChance = 0.1 // 10%
        if (Math.random() < winChance) {
          const prize = Math.floor(Math.random() * 1000) + 500
          user.economy.waguri += prize
          return `🎉 ¡GANASTE LA LOTERÍA!\n💰 Premio: ${formatNumber(prize)} WC\n💳 Nuevo saldo: ${formatNumber(user.economy.waguri)}`
        } else {
          return `❌ No ganaste esta vez.\n💡 Sigue intentando.`
        }
      }
    }
  }
  
  const itemEffect = itemEffects[itemId]
  
  if (!itemEffect) {
    return m.reply(
      `❌ *ESTE ITEM NO SE PUEDE USAR*\n\n` +
      `Item: ${itemId}\n` +
      `📝 Algunos items se activan automáticamente.\n\n` +
      `🔧 Items usables:\n` +
      Object.keys(itemEffects).map(id => `• ${id}`).join('\n')
    )
  }
  
  // Remover el item del inventario
  inventory.splice(itemIndex, 1)
  
  // Aplicar efecto
  const result = itemEffect.effect()
  
  let message = `✅ *ITEM USADO*\n\n`
  message += `🎯 ${itemEffect.name}\n\n`
  message += `✨ Efecto:\n${result}\n\n`
  message += `📦 Items restantes: ${inventory.length}`
  
  await m.reply(message)
}

handler.help = ['usar <item>', 'use']
handler.tags = ['economy']
handler.command = /^(usar|use|consumir)$/i
handler.group = true
handler.register = true

export default handler