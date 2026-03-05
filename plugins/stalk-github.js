import fetch from "node-fetch"

const handler = async (m, { conn, text }) => {
  try {
    if (!text.trim()) {
      return conn.reply(
        m.chat,
        `╭─「 🌸 *WAGURI BOT* 🌸 」\n` +
        `│\n` +
        `│ 🐙 Ingresa el usuario de\n` +
        `│    GitHub que deseas buscar~\n` +
        `│\n` +
        `╰────────────────────`,
        m
      )
    }

    const res = await fetch(`https://starapi-rosy.vercel.app/stalk/github?q=${encodeURIComponent(text.trim())}`)
    const json = await res.json()

    if (!json?.status || !json?.result) {
      throw new Error("No se encontró el perfil")
    }

    const d = json.result
    const thumb = d.avatar ? (await conn.getFile(d.avatar))?.data : null

    const msg =
      `╭─「 🐙 *GITHUB STALK* 」\n` +
      `│\n` +
      `│ 👤 *${d.name || d.username}*\n` +
      `│ 🔗 @${d.username}\n` +
      `│\n` +
      `│ 📝 *Bio:* ${d.bio || "Sin biografía"}\n` +
      `│ 🏢 *Empresa:* ${d.company || "No disponible"}\n` +
      `│ 📍 *Ubicación:* ${d.location || "No disponible"}\n` +
      `│ 🌐 *Blog:* ${d.blog || "No disponible"}\n` +
      `│\n` +
      `│ 📊 *Estadísticas:*\n` +
      `│ 👥 Seguidores » *${d.stats?.followers || 0}*\n` +
      `│ 👣 Siguiendo  » *${d.stats?.following || 0}*\n` +
      `│ 📦 Repos      » *${d.stats?.public_repos || 0}*\n` +
      `│ ⭐ Estrellas  » *${d.stats?.total_stars || 0}*\n` +
      `│\n` +
      `│ 🗂️ *Top Repos:*\n` +
      (d.top_repos?.slice(0, 3).map(r =>
        `│ • *${r.name}* ⭐${r.stars}\n│   ${r.description || "Sin descripción"}`
      ).join('\n') || '│ Sin repositorios') +
      `\n│\n` +
      `│ 🔗 ${d.profile_url}\n` +
      `│\n` +
      `╰────────────────────`

    if (thumb) {
      await conn.sendMessage(
        m.chat,
        {
          image: thumb,
          caption: msg
        },
        { quoted: m }
      )
    } else {
      await conn.reply(m.chat, msg, m)
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

handler.command = handler.help = ["github", "githubstalk", "ghstalk"]
handler.tags = ["stalk"]
handler.group = true
handler.register = true

export default handler