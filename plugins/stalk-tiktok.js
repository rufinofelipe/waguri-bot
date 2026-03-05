import fetch from "node-fetch"

const handler = async (m, { conn, text }) => {
  try {
    if (!text.trim()) {
      return conn.reply(
        m.chat,
        `╭─「 🎵 *TIKTOK STALK* 」\n` +
        `│\n` +
        `│ 🎵 Ingresa el usuario de\n` +
        `│    TikTok que deseas buscar~\n` +
        `│\n` +
        `│ Ejemplo: .ttstalk duarte\n` +
        `│\n` +
        `╰────────────────────`,
        m
      )
    }

    const res = await fetch(`https://starapi-rosy.vercel.app/stalk/tiktok?q=${encodeURIComponent(text.trim())}`)
    const json = await res.json()

    if (!json?.status || !json?.result) {
      throw new Error("No se encontró el perfil")
    }

    const d = json.result
    const thumb = d.avatar ? await getBuffer(d.avatar) : null

    const msg =
      `╭─「 🎵 *TIKTOK STALK* 」\n` +
      `│\n` +
      `│ 👤 *${d.name || d.username || text.trim()}*\n` +
      `│ 🔗 @${d.username || text.trim()}\n` +
      `│\n` +
      `│ 📝 *Bio:* ${d.bio || "Sin biografía"}\n` +
      `│\n` +
      `│ 📊 *Estadísticas:*\n` +
      `│ 👥 Seguidores » *${d.followers || d.stats?.followers || 0}*\n` +
      `│ 👣 Siguiendo  » *${d.following || d.stats?.following || 0}*\n` +
      `│ ❤️ Likes      » *${d.likes || d.stats?.likes || 0}*\n` +
      `│ 🎬 Videos     » *${d.videos || d.stats?.videos || 0}*\n` +
      `│\n` +
      `│ 🔗 https://tiktok.com/@${d.username || text.trim()}\n` +
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
      `╭─「 🎵 *TIKTOK STALK* 」\n` +
      `│\n` +
      `│ ❌ Ocurrió un error~\n` +
      `│ ⚠️ *${e.message}*\n` +
      `│\n` +
      `╰────────────────────`,
      m
    )
  }
}

handler.command = ['ttstalk', 'tiktokstalk', 'tiktok']
handler.help = ["ttstalk", "tiktokstalk", "tiktok"]
handler.tags = ["stalk"]

export default handler