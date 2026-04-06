// código creado por Rufino

const CLANES = {
  gojo: { nombre: "Clan Gojo", emoji: "🔵" },
  zenin: { nombre: "Clan Zenin", emoji: "🔴" },
  independiente: { nombre: "Independiente", emoji: "🟡" }
}

const getGrado = (nivel) => {
  if (nivel >= 30) return "⬛ Grado Especial"
  if (nivel >= 20) return "🟥 Grado 1"
  if (nivel >= 12) return "🟧 Grado 2"
  if (nivel >= 6)  return "🟨 Grado 3"
  return                   "⬜ Grado 4"
}

const xpParaNivel = (nivel) => nivel * 100

const handler = async (m, { conn, mentionedJid }) => {
  try {
    const target = mentionedJid && mentionedJid[0] ? mentionedJid[0] : m.sender
    const user = global.db.data.users[target]
    const esPropio = target === m.sender

    if (!user || !user.jjk) {
      return conn.reply(
        m.chat,
        `╭─「 ⚡ *JUJUTSU KAISEN* 」\n` +
        `│\n` +
        `│ ❌ ${esPropio ? "Aún no tienes personaje~" : "Ese hechicero no existe~"}\n` +
        `│ 💬 Usa *.crear* para comenzar\n` +
        `│\n` +
        `╰────────────────────`,
        m
      )
    }

    const jjk = user.jjk
    const clan = CLANES[jjk.clan]
    const grado = getGrado(jjk.nivel)
    const xpNecesaria = xpParaNivel(jjk.nivel)
    const progreso = Math.min(Math.floor((jjk.xp / xpNecesaria) * 10), 10)
    const barraXP = "█".repeat(progreso) + "░".repeat(10 - progreso)
    const tecnicasTexto = jjk.tecnicas.map(t => `│    • ${t}`).join("\n")
    const misionesTotal = jjk.misionesCompletadas ? jjk.misionesCompletadas.length : 0
    const nombre = esPropio ? "Tu ficha" : `Ficha de @${target.split("@")[0]}`

    return conn.reply(
      m.chat,
      `╭─「 ⚡ *JUJUTSU KAISEN* 」\n` +
      `│\n` +
      `│ ${clan.emoji} *${nombre}*\n` +
      `│\n` +
      `│ 🏯 *Clan:* ${clan.nombre}\n` +
      `│ 🏅 *Grado:* ${grado}\n` +
      `│ 📊 *Nivel:* ${jjk.nivel}\n` +
      `│\n` +
      `│ ✨ *XP:* ${jjk.xp} / ${xpNecesaria}\n` +
      `│ [${barraXP}]\n` +
      `│\n` +
      `│ 💜 *Poder Maldito:* ${jjk.poderMaldito}\n` +
      (jjk.poderIlimitado ? `│ 👑 *PODER ILIMITADO ACTIVO*\n│\n` : `│\n`) +
      `│ ⚔️ *Técnicas (${jjk.tecnicas.length}):*\n` +
      `${tecnicasTexto}\n` +
      `│\n` +
      `│ 📜 *Misiones completadas:* ${misionesTotal}/20\n` +
      `│\n` +
      `│ 💬 *.mision* — Ir a combatir\n` +
      `│ 🏆 *.jjktop* — Ver ranking\n` +
      `│\n` +
      `╰────────────────────`,
      m
    )

  } catch (e) {
    conn.reply(
      m.chat,
      `╭─「 🌸 *WAGURI BOT* 🌸 」\n│\n│ ❌ Ocurrió un error~\n│ ⚠️ *${e.message}*\n│\n╰────────────────────`,
      m
    )
  }
}

handler.command = handler.help = ["jjkperfil", "hechicero", "jjkp"]
handler.tags = ["jjk"]
handler.group = true
handler.register = true

export default handler
