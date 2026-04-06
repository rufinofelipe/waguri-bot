// código creado por Rufino

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

const PROB_ILIMITADO = 0.001

const handler = async (m, { conn }) => {
  try {
    const user = global.db.data.users[m.sender]

    if (user.jjk) {
      return conn.reply(
        m.chat,
        `╭─「 ⚡ *JUJUTSU KAISEN* 」\n│\n│ ⚠️ Ya tienes un personaje creado~\n│ 🔎 Usa *.jjkperfil* para verlo\n│\n╰────────────────────`,
        m
      )
    }

    user.jjkCreando = { paso: "clan" }

    // Lista interactiva para elegir clan
    await conn.sendMessage(m.chat, {
      listMessage: {
        title: "⚡ JUJUTSU KAISEN — Crear Personaje",
        description: "Bienvenido al mundo de los Hechiceros Malditos.\n\n⚠️ Esta elección es *permanente*.",
        footerText: "Waguri Bot 🌸",
        buttonText: "Ver Clanes",
        listType: 1,
        sections: [
          {
            title: "Elige tu Clan",
            rows: [
              {
                title: "🔵 Clan Gojo",
                description: "Los 6 Ojos + El Infinito desde el nacimiento",
                rowId: "clan_gojo"
              },
              {
                title: "🔴 Clan Zenin",
                description: "Técnica de las 10 Sombras. Honor y fuerza",
                rowId: "clan_zenin"
              },
              {
                title: "🟡 Independiente",
                description: "Sin linaje. Forja tu propio camino",
                rowId: "clan_independiente"
              }
            ]
          }
        ]
      }
    }, { quoted: m })

  } catch (e) {
    conn.reply(
      m.chat,
      `╭─「 🌸 *WAGURI BOT* 🌸 」\n│\n│ ❌ Ocurrió un error~\n│ ⚠️ *${e.message}*\n│\n╰────────────────────`,
      m
    )
  }
}

// Captura la selección de la lista y también respuestas de texto
handler.all = async function (m, { conn }) {
  try {
    if (!m.isGroup) return
    const user = global.db.data.users[m.sender]
    if (!user || !user.jjkCreando) return

    const paso = user.jjkCreando.paso

    // Detectar selección de lista interactiva
    const listaSeleccion = m.message?.listResponseMessage?.singleSelectReply?.selectedRowId
    const textoRespuesta = (m.text || "").trim().toLowerCase()
    const respuesta = listaSeleccion || textoRespuesta

    if (!respuesta) return

    // ── Paso 1: Elegir clan ───────────────────────────
    if (paso === "clan") {
      let clanKey = null

      if (respuesta === "clan_gojo" || respuesta === "gojo" || respuesta === "1") clanKey = "gojo"
      else if (respuesta === "clan_zenin" || respuesta === "zenin" || respuesta === "2") clanKey = "zenin"
      else if (respuesta === "clan_independiente" || respuesta === "independiente" || respuesta === "3") clanKey = "independiente"

      if (!clanKey) return

      user.jjkCreando.clan = clanKey
      const clan = CLANES[clanKey]

      if (clanKey === "gojo" || clanKey === "zenin") {
        user.jjkCreando.paso = "confirmar"

        return conn.reply(
          m.chat,
          `╭─「 ⚡ *JUJUTSU KAISEN* 」\n` +
          `│\n` +
          `│ ${clan.emoji} *${clan.nombre} seleccionado*\n` +
          `│\n` +
          `│ ✨ *Técnicas iniciales:*\n` +
          `${clan.tecnicaBase.map(t => `│    • ${t}`).join("\n")}\n` +
          `│\n` +
          `│ 💜 *Poder Maldito inicial:* ${clan.poderInicial}\n` +
          `│\n` +
          `│ ¿Confirmas? Responde *si* o *no*\n` +
          `│\n` +
          `╰────────────────────`,
          m
        )
      }

      if (clanKey === "independiente") {
        user.jjkCreando.paso = "tecnica"

        // Lista para elegir técnica
        await conn.sendMessage(m.chat, {
          listMessage: {
            title: "🟡 Independiente — Elige tu técnica",
            description: "Además tendrás *Refuerzo Maldito* de base.",
            footerText: "Waguri Bot 🌸",
            buttonText: "Ver Técnicas",
            listType: 1,
            sections: [
              {
                title: "Técnicas disponibles",
                rows: TECNICAS_INDEPENDIENTE.map((t, i) => ({
                  title: t,
                  description: "Técnica inicial",
                  rowId: `tecnica_${i}`
                }))
              }
            ]
          }
        }, { quoted: m })
      }
    }

    // ── Paso 2: Elegir técnica (Independiente) ────────
    if (paso === "tecnica") {
      let idx = null

      if (respuesta.startsWith("tecnica_")) {
        idx = parseInt(respuesta.replace("tecnica_", ""))
      } else {
        idx = parseInt(respuesta) - 1
      }

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
        `│ 💜 *Poder Maldito inicial:* 100\n` +
        `│\n` +
        `│ ¿Confirmas? Responde *si* o *no*\n` +
        `│\n` +
        `╰────────────────────`,
        m
      )
    }

    // ── Paso 3: Confirmación ──────────────────────────
    if (paso === "confirmar") {
      if (respuesta === "no") {
        delete user.jjkCreando
        return conn.reply(
          m.chat,
          `╭─「 ⚡ *JUJUTSU KAISEN* 」\n│\n│ 🔄 Creación cancelada~\n│ Usa *.crear* para empezar de nuevo\n│\n╰────────────────────`,
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

      // Anuncio poder ilimitado
      if (esPoderilimitado) {
        await conn.sendMessage(m.chat, {
          text:
            `╭─「 ⚡ *¡ACONTECIMIENTO HISTÓRICO!* 」\n│\n│ 👑 *@${m.sender.split("@")[0]}*\n│    ha nacido con\n│ ✨ *PODER MALDITO ILIMITADO* ✨\n│\n│ 🌌 Puede usar *TODAS* las técnicas\n│    desde el nivel 1.\n│\n│ ⚠️ Solo puede existir *UNO*.\n│\n╰────────────────────`,
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
