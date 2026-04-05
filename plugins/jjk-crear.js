//código creado por Rufino 
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
    poderInicial: 150
  },
  zenin: {
    nombre: "Clan Zenin",
    emoji: "🔴",
    descripcion: "Portadores de la Técnica de las 10 Sombras. Honor y fuerza ante todo.",
    tecnicaBase: ["Técnica de las 10 Sombras", "Shikigami: Div. Perros"],
    poderInicial: 120
  },
  independiente: {
    nombre: "Independiente",
    emoji: "🟡",
    descripcion: "Sin linaje. Sin privilegios. Solo tu voluntad y energía maldita.",
    tecnicaBase: ["Refuerzo Maldito"],
    poderInicial: 100
  }
}

const TECNICAS_INDEPENDIENTE = [
  "Llama Sangrienta",
  "Resonancia Maldita",
  "Transformación Maldita",
  "Discurso Maldito",
  "Marioneta Maldita"
]

const PROB_ILIMITADO = 0.001 // 1 en 1000

const handler = async (m, { conn }) => {
  try {
    const user = global.db.data.users[m.sender]

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
      `│ ══ Elige tu *Clan* ══\n` +
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

// ── Captura respuestas sin prefijo ────────────────────────
handler.all = async function (m, { conn }) {
  try {
    if (!m.isGroup) return
    const user = global.db.data.users[m.sender]
    if (!user || !user.jjkCreando) return

    const paso = user.jjkCreando.paso
    const respuesta = (m.text || "").trim().toLowerCase()

    // ── Paso 1: Elegir clan ───────────────────────────
    if (paso === "clan") {
      const opciones = { "1": "gojo", "2": "zenin", "3": "independiente" }
      const clanKey = opciones[respuesta]
      if (!clanKey) return

      user.jjkCreando.clan = clanKey

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
          `│ ✨ *Técnicas iniciales:*\n` +
          `│    • Infinito\n` +
          `│    • 6 Ojos (Pasiva)\n` +
          `│\n` +
          `│ ¿Confirmas? Responde *si* o *no*\n` +
          `│\n` +
          `╰────────────────────`,
          m
        )
      }

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
          `│ ✨ *Técnicas iniciales:*\n` +
          `│    • Técnica de las 10 Sombras\n` +
          `│    • Shikigami: Div. Perros\n` +
          `│\n` +
          `│ ¿Confirmas? Responde *si* o *no*\n` +
          `│\n` +
          `╰────────────────────`,
          m
        )
      }

      if (clanKey === "independiente") {
        user.jjkCreando.paso = "tecnica"
        const lista = TECNICAS_INDEPENDIENTE
          .map((t, i) => `│ *${i + 1}.* ${t}`)
          .join("\n")

        return conn.reply(
          m.chat,
          `╭─「 ⚡ *JUJUTSU KAISEN* 」\n` +
          `│\n` +
          `│ 🟡 *Independiente seleccionado*\n` +
          `│\n` +
          `│ 💪 Sin linaje. Solo tu fuerza.\n` +
          `│\n` +
          `│ ⚔️ Elige tu *técnica inicial:*\n` +
          `│ *(además tendrás Refuerzo Maldito)*\n` +
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

    // ── Paso 2: Elegir técnica (Independiente) ────────
    if (paso === "tecnica") {
      const idx = parseInt(respuesta) - 1
      if (isNaN(idx) || idx < 0 || idx >= TECNICAS_INDEPENDIENTE.length) return

      const tecnicaElegida = TECNICAS_INDEPENDIENTE[idx]
      user.jjkCreando.tecnicaElegida = tecnicaElegida
      user.jjkCreando.paso = "confirmar"

      return conn.reply(
        m.chat,
        `╭─「 ⚡ *JUJUTSU KAISEN* 」\n` +
        `│\n` +
        `│ 🟡 *Independiente*\n` +
        `│\n` +
        `│ ✨ *Técnicas iniciales:*\n` +
        `│    • Refuerzo Maldito\n` +
        `│    • ${tecnicaElegida}\n` +
        `│\n` +
        `│ ¿Confirmas? Responde *si* o *no*\n` +
        `│\n` +
        `╰────────────────────`,
        m
      )
    }

    // ── Paso 3: Confirmación final ────────────────────
    if (paso === "confirmar") {
      if (respuesta === "no") {
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

      if (respuesta !== "si") return

      const clanKey = user.jjkCreando.clan
      const clan = CLANES[clanKey]
      let tecnicas = [...clan.tecnicaBase]
      let esPoderilimitado = false

      if (clanKey === "independiente") {
        const yaExiste = Object.values(global.db.data.users).some(
          u => u.jjk && u.jjk.poderIlimitado
        )
        if (!yaExiste && Math.random() < PROB_ILIMITADO) {
          esPoderilimitado = true
          tecnicas = [
            "Refuerzo Maldito", "Llama Sangrienta", "Resonancia Maldita",
            "Transformación Maldita", "Discurso Maldito", "Marioneta Maldita",
            "Infinito", "6 Ojos (Pasiva)", "Técnica Azul", "Técnica Roja",
            "Técnica Púrpura", "Técnica de las 10 Sombras",
            "Shikigami: Div. Perros", "Shikigami: Toad",
            "Shikigami: Gran Serpiente", "Shikigami: Nue",
            "Shikigami: Elefante", "Shikigami: Mahoraga",
            "Infinito Dominio — Vacío Ilusorio",
            "Guarida del Perro", "Expansión de Dominio propia"
          ]
        } else {
          if (user.jjkCreando.tecnicaElegida) {
            tecnicas.push(user.jjkCreando.tecnicaElegida)
          }
        }
      }

      user.jjk = {
        clan: clanKey,
        nivel: 1,
        xp: 0,
        poderMaldito: clan.poderInicial,
        tecnicas,
        misionActual: null,
        misionesCompletadas: [],
        poderIlimitado: esPoderilimitado,
        creadoEn: Date.now()
      }

      delete user.jjkCreando

      if (esPoderilimitado) {
        await conn.sendMessage(m.chat, {
          text:
            `╭─「 ⚡ *¡ACONTECIMIENTO HISTÓRICO!* 」\n` +
            `│\n` +
            `│ 👑 *@${m.sender.split("@")[0]}*\n` +
            `│    ha nacido con\n` +
            `│ ✨ *PODER MALDITO ILIMITADO* ✨\n` +
            `│\n` +
            `│ 🌌 Puede usar *TODAS* las técnicas\n` +
            `│    desde el nivel 1.\n` +
            `│\n` +
            `│ ⚠️ Solo puede existir *UNO*.\n` +
            `│    Y ya está entre nosotros.\n` +
            `│\n` +
            `╰────────────────────`,
          mentions: [m.sender]
        })
      }

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
        `│ 💜 *Poder Maldito:* ${clan.poderInicial}\n` +
        `│\n` +
        `│ ⚔️ *Técnicas:*\n` +
        `${tecnicasTexto}\n` +
        `│\n` +
        `│ 🌸 ${clan.descripcion}\n` +
        `│\n` +
        `│ 💬 *.jjkperfil* — Ver tu ficha\n` +
        `│ ⚔️ *.mision* — Comenzar misión\n` +
        `│\n` +
        `╰────────────────────`,
        m
      )
    }

  } catch (e) {
    console.error(e)
  }
}

handler.command = handler.help = ["crear"]
handler.tags = ["jjk"]
handler.group = true
handler.register = true

export default handler
