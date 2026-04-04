// ╭─「 ⚡ JJK SYSTEM — WAGURI BOT 」
// │  jjk-crear.js
// │  Creación única de personaje Jujutsu Kaisen
// ╰────────────────────────────────────────────

const CLANES = {
  gojo: {
    nombre: "Clan Gojo",
    emoji: "🔵",
    descripcion: "Naces bendecido con los 6 Ojos y El Infinito. El hechicero más poderoso.",
    tecnicaBase: ["Infinito", "6 Ojos (Pasiva)"],
    especial: true // clan con poder automático
  },
  zenin: {
    nombre: "Clan Zenin",
    emoji: "🔴",
    descripcion: "Portadores de la Técnica de las 10 Sombras. Honor y fuerza ante todo.",
    tecnicaBase: ["Técnica de las 10 Sombras", "Shikigami: Div. Perros"],
    especial: false
  },
  independiente: {
    nombre: "Independiente",
    emoji: "🟡",
    descripcion: "Sin linaje. Sin privilegios. Solo tu voluntad y energía maldita.",
    tecnicaBase: ["Refuerzo Maldito"],
    especial: false
  }
}

const TECNICAS_INDEPENDIENTE = [
  "Llama Sangrienta",
  "Resonancia Maldita",
  "Transformación Maldita",
  "Discurso Maldito",
  "Marioneta Maldita"
]

// Probabilidad de nacer con Poder Ilimitado (1 en 1000)
const PROB_ILIMITADO = 0.001

const handler = async (m, { conn }) => {
  try {
    const user = global.db.data.users[m.sender]

    // ── Ya tiene personaje ──────────────────────────
    if (user.jjk) {
      return conn.reply(
        m.chat,
        `╭─「 ⚡ *JUJUTSU KAISEN* 」\n` +
        `│\n` +
        `│ ⚠️ Ya tienes un personaje creado~\n` +
        `│ 🔎 Usa *.jjkperfil* para verlo\n` +
        `│\n` +
        `╰────────────────────`,
        m
      )
    }

    // ── Estado: eligiendo clan ──────────────────────
    if (!user.jjkCreando) {
      user.jjkCreando = { paso: "clan" }

      return conn.reply(
        m.chat,
        `╭─「 ⚡ *JUJUTSU KAISEN* 」\n` +
        `│\n` +
        `│ 🌸 Bienvenido al mundo de los\n` +
        `│    *Hechiceros Malditos*~\n` +
        `│\n` +
        `│ ⚠️ *Esta elección es permanente.*\n` +
        `│    No podrás cambiarla.\n` +
        `│\n` +
        `│ ═══ Elige tu *Clan* ═══\n` +
        `│\n` +
        `│ 🔵 *1.* Clan Gojo\n` +
        `│    Los 6 Ojos + El Infinito\n` +
        `│\n` +
        `│ 🔴 *2.* Clan Zenin\n` +
        `│    Técnica de las 10 Sombras\n` +
        `│\n` +
        `│ 🟡 *3.* Independiente\n` +
        `│    Forja tu propio camino\n` +
        `│\n` +
        `│ 💬 Responde con *1*, *2* o *3*\n` +
        `│\n` +
        `╰────────────────────`,
        m
      )
    }

    const paso = user.jjkCreando.paso
    const respuesta = m.text.trim()

    // ── Paso 1: Elegir clan ─────────────────────────
    if (paso === "clan") {
      const opciones = { "1": "gojo", "2": "zenin", "3": "independiente" }
      const clanKey = opciones[respuesta]

      if (!clanKey) {
        return conn.reply(
          m.chat,
          `╭─「 ⚡ *JUJUTSU KAISEN* 」\n` +
          `│\n` +
          `│ ❌ Responde solo con *1*, *2* o *3*~\n` +
          `│\n` +
          `╰────────────────────`,
          m
        )
      }

      user.jjkCreando.clan = clanKey

      // ── Clan Gojo: directo, sin elegir técnica ──
      if (clanKey === "gojo") {
        user.jjkCreando.paso = "confirmar"

        return conn.reply(
          m.chat,
          `╭─「 ⚡ *JUJUTSU KAISEN* 」\n` +
          `│\n` +
          `│ 🔵 *Clan Gojo seleccionado*\n` +
          `│\n` +
          `│ 👁️ Los *6 Ojos* han despertado\n` +
          `│    en ti desde el nacimiento.\n` +
          `│\n` +
          `│ ✨ Técnicas iniciales:\n` +
          `│    • El Infinito\n` +
          `│    • 6 Ojos (Pasiva)\n` +
          `│\n` +
          `│ ¿Confirmas tu elección?\n` +
          `│ Responde *si* o *no*\n` +
          `│\n` +
          `╰────────────────────`,
          m
        )
      }

      // ── Clan Zenin: directo, sin elegir técnica ──
      if (clanKey === "zenin") {
        user.jjkCreando.paso = "confirmar"

        return conn.reply(
          m.chat,
          `╭─「 ⚡ *JUJUTSU KAISEN* 」\n` +
          `│\n` +
          `│ 🔴 *Clan Zenin seleccionado*\n` +
          `│\n` +
          `│ 🐾 La *Técnica de las 10 Sombras*\n` +
          `│    fluye por tu sangre.\n` +
          `│\n` +
          `│ ✨ Técnicas iniciales:\n` +
          `│    • Técnica de las 10 Sombras\n` +
          `│    • Shikigami: Div. Perros\n` +
          `│\n` +
          `│ ¿Confirmas tu elección?\n` +
          `│ Responde *si* o *no*\n` +
          `│\n` +
          `╰────────────────────`,
          m
        )
      }

      // ── Independiente: elegir técnica inicial ──
      if (clanKey === "independiente") {
        user.jjkCreando.paso = "tecnica"

        const lista = TECNICAS_INDEPENDIENTE
          .map((t, i) => `│ ${i + 1}. ${t}`)
          .join("\n")

        return conn.reply(
          m.chat,
          `╭─「 ⚡ *JUJUTSU KAISEN* 」\n` +
          `│\n` +
          `│ 🟡 *Independiente seleccionado*\n` +
          `│\n` +
          `│ 💪 Sin linaje. Solo tu fuerza.\n` +
          `│    Elige tu *técnica inicial*:\n` +
          `│\n` +
          `│ *(Además tendrás Refuerzo Maldito)*\n` +
          `│\n` +
          `${lista}\n` +
          `│\n` +
          `│ 💬 Responde con el número\n` +
          `│\n` +
          `╰────────────────────`,
          m
        )
      }
    }

    // ── Paso 2: Elegir técnica (solo Independiente) ─
    if (paso === "tecnica") {
      const idx = parseInt(respuesta) - 1
      if (isNaN(idx) || idx < 0 || idx >= TECNICAS_INDEPENDIENTE.length) {
        return conn.reply(
          m.chat,
          `╭─「 ⚡ *JUJUTSU KAISEN* 」\n` +
          `│\n` +
          `│ ❌ Elige un número válido del 1 al ${TECNICAS_INDEPENDIENTE.length}\n` +
          `│\n` +
          `╰────────────────────`,
          m
        )
      }

      const tecnicaElegida = TECNICAS_INDEPENDIENTE[idx]
      user.jjkCreando.tecnicaElegida = tecnicaElegida
      user.jjkCreando.paso = "confirmar"

      return conn.reply(
        m.chat,
        `╭─「 ⚡ *JUJUTSU KAISEN* 」\n` +
        `│\n` +
        `│ 🟡 *Independiente*\n` +
        `│\n` +
        `│ ✨ Técnicas iniciales:\n` +
        `│    • Refuerzo Maldito\n` +
        `│    • ${tecnicaElegida}\n` +
        `│\n` +
        `│ ¿Confirmas tu elección?\n` +
        `│ Responde *si* o *no*\n` +
        `│\n` +
        `╰────────────────────`,
        m
      )
    }

    // ── Paso 3: Confirmación final ──────────────────
    if (paso === "confirmar") {
      if (respuesta.toLowerCase() === "no") {
        delete user.jjkCreando
        return conn.reply(
          m.chat,
          `╭─「 ⚡ *JUJUTSU KAISEN* 」\n` +
          `│\n` +
          `│ 🔄 Creación cancelada~\n` +
          `│ Usa *.crear* para empezar de nuevo\n` +
          `│\n` +
          `╰────────────────────`,
          m
        )
      }

      if (respuesta.toLowerCase() !== "si") {
        return conn.reply(
          m.chat,
          `╭─「 ⚡ *JUJUTSU KAISEN* 」\n` +
          `│\n` +
          `│ ❌ Responde *si* o *no*~\n` +
          `│\n` +
          `╰────────────────────`,
          m
        )
      }

      // ── Construir personaje ──────────────────────
      const clanKey = user.jjkCreando.clan
      const clan = CLANES[clanKey]
      let tecnicas = [...clan.tecnicaBase]
      let esPoderilimitado = false

      // Verificar si aplica poder ilimitado
      if (clanKey === "independiente") {
        // Revisar si ya existe alguien con poder ilimitado
        const yaExiste = Object.values(global.db.data.users).some(
          u => u.jjk && u.jjk.poderIlimitado
        )

        if (!yaExiste && Math.random() < PROB_ILIMITADO) {
          esPoderilimitado = true
          // Desbloquea TODAS las técnicas
          tecnicas = [
            "Refuerzo Maldito", "Llama Sangrienta", "Resonancia Maldita",
            "Transformación Maldita", "Discurso Maldito", "Marioneta Maldita",
            "Infinito", "6 Ojos (Pasiva)", "Técnica Azul", "Técnica Roja",
            "Técnica Púrpura", "Técnica de las 10 Sombras", "Shikigami: Div. Perros",
            "Shikigami: Toad", "Shikigami: Gran Serpiente", "Shikigami: Nue",
            "Shikigami: Elefante", "Shikigami: Mahoraga",
            "Infinito Dominio — Vacío Ilusorio", "Guarida del Perro", "Expansión de Dominio propia"
          ]
        } else {
          if (user.jjkCreando.tecnicaElegida) {
            tecnicas.push(user.jjkCreando.tecnicaElegida)
          }
        }
      }

      // Guardar personaje en la base de datos
      user.jjk = {
        clan: clanKey,
        nivel: 1,
        xp: 0,
        poderMaldito: clanKey === "gojo" ? 150 : clanKey === "zenin" ? 120 : 100,
        tecnicas: tecnicas,
        misionActual: null,
        misionesCompletadas: [],
        poderIlimitado: esPoderilimitado,
        creadoEn: Date.now()
      }

      delete user.jjkCreando

      // ── Anuncio especial si es poder ilimitado ──
      if (esPoderilimitado) {
        await conn.sendMessage(m.chat, {
          text:
            `╭─「 ⚡ *¡ACONTECIMIENTO HISTÓRICO!* 」\n` +
            `│\n` +
            `│ 👑 *@${m.sender.split("@")[0]}*\n` +
            `│    ha nacido con\n` +
            `│    *✨ PODER MALDITO ILIMITADO ✨*\n` +
            `│\n` +
            `│ 🌌 Este hechicero puede usar\n` +
            `│    *TODAS* las técnicas desde\n` +
            `│    el nivel 1.\n` +
            `│\n` +
            `│ ⚠️ Solo puede existir *UNO*.\n` +
            `│    Y ya está entre nosotros.\n` +
            `│\n` +
            `╰────────────────────`,
          mentions: [m.sender]
        })
      }

      // ── Mensaje de bienvenida ───────────────────
      const tecnicasTexto = tecnicas.map(t => `│    • ${t}`).join("\n")

      return conn.reply(
        m.chat,
        `╭─「 ⚡ *JUJUTSU KAISEN* 」\n` +
        `│\n` +
        `│ ${clan.emoji} *¡Personaje creado!*\n` +
        `│\n` +
        `│ 🏯 *Clan:* ${clan.nombre}\n` +
        `│ 📊 *Nivel:* 1\n` +
        `│ ✨ *XP:* 0\n` +
        `│ 💜 *Poder Maldito:* ${user.jjk.poderMaldito}\n` +
        `│\n` +
        `│ ⚔️ *Técnicas:*\n` +
        `${tecnicasTexto}\n` +
        `│\n` +
        `│ 🌸 ${clan.descripcion}\n` +
        `│\n` +
        `│ 💬 Usa *.jjkperfil* para ver\n` +
        `│    tu ficha completa~\n` +
        `│ ⚔️ Usa *.mision* para comenzar\n` +
        `│\n` +
        `╰────────────────────`,
        m
      )
    }

  } catch (e) {
    conn.reply(
      m.chat,
      `╭─「 🌸 *WAGURI BOT* 🌸 」\n` +
      `│\n` +
      `│ ❌ Ocurrió un error~\n` +
      `│ ⚠️ *${e.message}*\n` +
      `│\n` +
      `╰────────────────────`,
      m
    )
  }
}

handler.command = handler.help = ["crear"]
handler.tags = ["jjk"]
handler.group = true
handler.register = true

export default handler
