let handler = async (m, { conn, usedPrefix }) => {
  const user = global.db.data.users[m.sender]
  
  if (!user.economy) {
    user.economy = { inventory: [] }
  }
  
  const formatNumber = (num) => new Intl.NumberFormat('es-ES').format(num)
  
  // Definir información de items
  const itemInfo = {
    'pocion': { name: '🍶 Poción de Vida', desc: 'Restaura 50 WC', use: 'usar pocion' },
    'energia': { name: '⚡ Bebida Energética', desc: '+20% en trabajo', use: 'usar energia' },
    'loteria': { name: '🎫 Ticket Lotería', desc: 'Participa en lotería', use: 'usar loteria' },
    'proteccion': { name: '🛡️ Protección', desc: '24h vs robos', use: 'auto-activa' },
    'caja_fuerte': { name: '🔒 Caja Fuerte', desc: 'Guarda dinero seguro', use: 'instalada' },
    'ampliacion': { name: '📈 Ampliación', desc: 'Duplica banco', use: 'auto-activa' }
  }
  
  const inventory = user.economy.inventory || []
  
  if (inventory.length === 0) {
    return m.reply(
      `📦 *INVENTARIO VACÍO*\n\n` +
      `No tienes items en tu inventario.\n\n` +
      `🛒 Compra items en: ${usedPrefix}tienda\n` +
      `💰 Trabaja para ganar dinero: ${usedPrefix}trabajar`
    )
  }
  
  // Contar items por tipo
  const itemCounts = {}
  inventory.forEach(itemId => {
    itemCounts[itemId] = (itemCounts[itemId] || 0) + 1
  })
  
  let itemsMessage = `📦 *TU INVENTARIO*\n\n`
  itemsMessage += `🎒 Capacidad: ${inventory.length} items\n\n`
  
  Object.entries(itemCounts).forEach(([itemId, count]) => {
    const info = itemInfo[itemId] || { name: itemId, desc: 'Item desconocido', use: 'usar ' + itemId }
    
    itemsMessage += `${info.name} x${count}\n`
    itemsMessage += `   📝 ${info.desc}\n`
    itemsMessage += `   🔧 ${usedPrefix}${info.use}\n`
    
    // Mostrar valor de venta aproximado
    const sellPrices = { 'pocion': 50, 'energia': 75, 'loteria': 25, 'proteccion': 250 }
    if (sellPrices[itemId]) {
      itemsMessage += `   💰 Valor venta: ${formatNumber(sellPrices[itemId] * count)} WC\n`
    }
    
    itemsMessage += `\n`
  })
  
  // Mostrar equipo especial
  itemsMessage += `⚡ *EQUIPO ACTIVO:*\n`
  
  if (user.economy.hasSafe) {
    itemsMessage += `🔒 Caja Fuerte: Instalada\n`
    itemsMessage += `   💳 Guardado: ${formatNumber(user.economy.safeBalance || 0)} WC\n`
  }
  
  if (user.economy.protected && user.economy.protectionExpires > Date.now()) {
    const hoursLeft = Math.ceil((user.economy.protectionExpires - Date.now()) / 3600000)
    itemsMessage += `🛡️ Protección: ${hoursLeft}h restantes\n`
  }
  
  itemsMessage += `\n🔧 *COMANDOS:*\n`
  itemsMessage += `• ${usedPrefix}usar <item> - Usar item\n`
  itemsMessage += `• ${usedPrefix}vender <item> [cantidad] - Vender\n`
  itemsMessage += `• ${usedPrefix}tienda - Comprar más\n`
  
  await m.reply(itemsMessage)
}

handler.help = ['items', 'inventario', 'inventory']
handler.tags = ['economy']
handler.command = /^(items|inventario|inventory|mochila)$/i
handler.group = true
handler.register = true

export default handler