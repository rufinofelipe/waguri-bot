import fs from 'fs'
import path from 'path'

const dbPath = path.join(process.cwd(), 'database.json')

const trabajos = [
  { nombre: "limpiar casas", min: 50, max: 150 },
  { nombre: "cortar el césped del jardín", min: 60, max: 200 },
  { nombre: "pasear perros", min: 40, max: 120 },
  { nombre: "hacer entregas a domicilio", min: 80, max: 250 },
  { nombre: "trabajar como mesero en un restaurante", min: 70, max: 180 },
  { nombre: "ayudar en una mudanza", min: 100, max: 300 },
  { nombre: "lavar coches", min: 50, max: 140 },
  { nombre: "cuidar niños por unas horas", min: 60, max: 200 },
  { nombre: "vender productos en la calle", min: 30, max: 150 },
  { nombre: "hacer tareas de jardinería", min: 70, max: 220 },
  { nombre: "repartir flyers", min: 40, max: 100 },
  { nombre: "trabajar en una tienda como cajero", min: 90, max: 250 },
  { nombre: "dar clases particulares", min: 120, max: 400 },
  { nombre: "hacer trabajos de pintura", min: 150, max: 500 },
  { nombre: "recoger basura en un evento", min: 50, max: 130 },
  { nombre: "ayudar en una mudanza grande", min: 200, max: 600 },
  { nombre: "trabajar como repartidor en bicicleta", min: 80, max: 300 },
  { nombre: "hacer encuestas en la calle", min: 30, max: 90 },
  { nombre: "cuidar mascotas durante el día", min: 60, max: 180 },
  { nombre: "limpiar oficinas por la noche", min: 100, max: 280 },
  { nombre: "trabajar en un almacén cargando cajas", min: 90, max: 220 },
  { nombre: "hacer babysitting de fin de semana", min: 80, max: 250 },
  { nombre: "vender comida casera", min: 50, max: 200 },
  { nombre: "trabajar en un call center", min: 70, max: 180 },
  { nombre: "hacer fotos para redes sociales", min: 100, max: 350 },
  { nombre: "ayudar en una fiesta como mesero", min: 120, max: 300 },
  { nombre: "limpiar piscinas", min: 80, max: 250 },
  { nombre: "trabajar en construcción como ayudante", min: 150, max: 450 },
  { nombre: "hacer traducciones rápidas", min: 200, max: 600 },
  { nombre: "vender ropa usada online", min: 40, max: 150 },
  { nombre: "trabajar en un supermercado reponiendo", min: 80, max: 200 },
  { nombre: "dar paseos en bicicleta con turistas", min: 90, max: 280 },
  { nombre: "hacer manicura y pedicura", min: 60, max: 180 },
  { nombre: "trabajar como guardia de seguridad temporal", min: 100, max: 300 },
  { nombre: "ayudar en un taller mecánico", min: 120, max: 350 },
  { nombre: "hacer edición de videos cortos", min: 150, max: 500 },
  { nombre: "cuidar ancianos por unas horas", min: 70, max: 220 },
  { nombre: "trabajar en un bar como ayudante", min: 80, max: 240 },
  { nombre: "vender artesanías hechas a mano", min: 50, max: 200 },
  { nombre: "hacer limpieza profunda en casas", min: 100, max: 300 },
  { nombre: "trabajar como conductor de Uber temporal", min: 150, max: 500 },
  { nombre: "ayudar en un gimnasio como recepcionista", min: 70, max: 180 },
  { nombre: "hacer diseño gráfico básico", min: 120, max: 400 },
  { nombre: "trabajar en un mercado como cargador", min: 60, max: 150 },
  { nombre: "dar clases de música o baile", min: 100, max: 350 },
  { nombre: "hacer reparaciones menores en casas", min: 90, max: 280 },
  { nombre: "trabajar en un cine como acomodador", min: 50, max: 140 },
  { nombre: "vender helados en la calle", min: 40, max: 120 },
  { nombre: "ayudar en una granja orgánica", min: 80, max: 220 },
  { nombre: "trabajar como fotógrafo de eventos", min: 200, max: 700 },
  { nombre: "hacer programación freelance básica", min: 300, max: 1000 }
]

let handler = async (m, { conn }) => {
  let db = JSON.parse(fs.readFileSync(dbPath, 'utf-8') || '{}')
  if (!db.users) db.users = {}
  
  let user = db.users[m.sender]
  let isNew = !user

  if (!user) {
    user = db.users[m.sender] = {
      wallet: 1000,   // bono inicial solo para nuevos usuarios
      bank: 0,
      lastDaily: 0,
      lastWork: 0,
      lastRob: 0
    }
  } else {
    user.wallet = Number(user.wallet) || 0
    user.bank = Number(user.bank) || 0
  }

  const cooldown = 3600000 // 1 hora → cámbialo a 0 si quieres sin límite
  const now = Date.now()

  if (user.lastWork && now - user.lastWork < cooldown) {
    let remaining = cooldown - (now - user.lastWork)
    let minutes = Math.ceil(remaining / 60000)
    return conn.reply(m.chat, `Faltan ≈${minutes} minutos para poder trabajar otra vez.`, m)
  }

  let trabajo = trabajos[Math.floor(Math.random() * trabajos.length)]
  let ganancia = Math.floor(Math.random() * (trabajo.max - trabajo.min + 1)) + trabajo.min

  user.wallet += ganancia
  user.lastWork = now

  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2))

  let mensaje = `🌸 Trabajaste como **\( {trabajo.nombre}**\n💰 Ganaste * \){ganancia} Waguri Coins* 🪙`

  if (isNew) {
    mensaje += `\n\n¡Bienvenido! Te dimos **1000 Waguri Coins** de regalo para empezar ✨`
  }

  conn.reply(m.chat, mensaje, m)
}

handler.help = ['trabajar', 'work', 'job']
handler.tags = ['economy']
handler.command = /^(trabajar|work|job)$/i
handler.group = true
handler.register = true

export default handler