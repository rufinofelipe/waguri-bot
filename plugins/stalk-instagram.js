import fetch from "node-fetch"

const handler = async (m, { conn, text }) => {
  try {
    if (!text.trim()) {
      return conn.reply(
        m.chat,
        `╭─「 🌸 *WAGURI BOT* 🌸 」\n` +
        `│\n` +
        `│ 📸 Ingresa el usuario de\n` +
        `│    Instagram que deseas buscar~\n` +
        `│\n` +
        `╰────────────────────`,
        m
      )
    }

    const res = await fetch(`https://starapi-rosy.vercel.app/stalk/instagram?q=${encodeURIComponent(text.trim())}`)
    const json = await res.json()

    if (!json?.status || !json?.result) {
      throw new Error("No se encontró el perfil")
    }

    const d = json.result
    const thumb = d.avatar || d.profile_pic ? (await conn.getFile(d.avatar || d.profile_pic))?.data : null

    const msg =
      `╭─「 📸 *INSTAGRAM STALK* 」\n` +
      `│\n` +
      `│ 👤 *${d.name || d.username || text.trim()}*\n` +
      `│ 🔗 @${d.username || text.trim()}\n` +
      `│\n` +
      `│ 📝 *Bio:* ${d.bio || "Sin biografía"}\n` +
      `│ 🔒 *Privado:* ${d.is_private ? "Sí" : "No"}\n` +
      `│ ✅ *Verificado:* ${d.is_verified ? "Sí" : "No"}\n` +
      `│\n` +
      `│ 📊 *Estadísticas:*\n` +
      `│ 👥 Seguidores » *${d.followers || d.stats?.followers || 0}*\n` +
      `│ 👣 Siguiendo  » *${d.following || d.stats?.following || 0}*\n` +
      `│ 📷 Posts      » *${d.posts || d.stats?.posts || 0}*\n` +
      `│\n` +
      `│ 🔗 https://instagram.com/${d.username || text.trim()}\n` +
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

handler.command = handler.help = ["instagram", "igstalk", "instastalk"]
handler.tags = ["stalk"]
handler.group = true
handler.register = true

export default handler