let handler = async (m, { conn, usedPrefix, args }) => {
  const user = global.db.data.users[m.sender]
  
  if (!user.cyberHunter || !user.cyberHunter.inventory) {
    return m.reply('❌ Primero usa /cazar para crear tu perfil')
  }
  
  if (!args[0]) {
    return m.reply(
      `📌 Usa: ${usedPrefix}equipar <item>\n` +
      `📋 Ejemplo: ${usedPrefix}equipar basic_armor\n\n` +
      `🎒 Items equipables:\n` +
      `• basic_armor - 🛡️ Armadura Básica (+5 DEF)\n` +
      `• cyber_eye - 👁️ Ojo Cibernético (+5% crítico)\n` +
      `• neural_chip - 💾 Chip Neural (+10% EXP)`
    )
  }
  
  const itemId = args[0].toLowerCase()
  const inventory = user.cyberHunter.inventory
  
  // Buscar el item
  const item = inventory.find(item => item.id === itemId)
  
  if (!item) {
    return m.reply(`❌ No tienes "${itemId}" en tu inventario.`)
  }
  
  // Verificar si es equipable
  if (item.type !== 'equipment') {
    return m.reply(`❌ "${item.name}" no es equipable.\nSolo puedes equipar items tipo equipo.`)
  }
  
  // Determinar tipo de slot
  let slotType = ''
  if (itemId.includes('armor')) slotType = 'armor'
  else if (itemId.includes('weapon')) slotType = 'weapon'
  else if (itemId.includes('eye') || itemId.includes('implant')) slotType = 'implant'
  else slotType = 'accessory'
  
  // Verificar si ya tiene algo equipado en ese slot
  const currentEquipped = user.cyberHunter.equipped[slotType]
  if (currentEquipped) {
    return m.reply(
      `⚠️ Ya tienes un item equipado en el slot ${slotType}.\n` +
      `Usa ${usedPrefix}desequipar ${currentEquipped} primero.`
    )
  }
  
  // Equipar el item
  user.cyberHunter.equipped[slotType] = itemId
  
  await m.reply(
    `✅ *ITEM EQUIPADO*\n\n` +
    `🎯 Item: ${item.name}\n` +
    `📌 Slot: ${slotType}\n` +
    `⚡ Efecto: ${getItemEffect(itemId)}\n\n` +
    `🔧 Item equipado correctamente.`
  )
  
  function getItemEffect(id) {
    const effects = {
      'basic_armor': '+5 DEF',
      'cyber_eye': '+5% chance de crítico',
      'neural_chip': '+10% Cyberware obtenido',
      'stealth_module': '+15% chance de escape'
    }
    return effects[id] || 'Efecto especial'
  }
}

handler.help = ['equipar', 'equip', 'wear']
handler.tags = ['rpg']
handler.command = /^(equipar|equip|wear|poner)$/i
handler.group = true
handler.register = true

export default handler