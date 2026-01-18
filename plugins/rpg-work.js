let cooldowns = {}

let handler = async (m, { conn, isPrems }) => {
let user = global.db.data.users[m.sender]
let tiempo = 5 * 60
if (cooldowns[m.sender] && Date.now() - cooldowns[m.sender] < tiempo * 1000) {
const tiempo2 = segundosAHMS(Math.ceil((cooldowns[m.sender] + tiempo * 1000 - Date.now()) / 1000))
conn.reply(m.chat, `⚽️ Necesitas descansar... ⚽️\n\n✨ Debes esperar *${tiempo2}* para trabajar de nuevo ✨`, m, global.rcanal)
return
}
let rsl = Math.floor(Math.random() * 500)
cooldowns[m.sender] = Date.now()
await conn.reply(m.chat, ` ${pickRandom(trabajo)} *${toNum(rsl)}* ( *${rsl}* ) ${moneda} `, m, global.rcanal)
user.coin += rsl
}

handler.help = ['trabajar']
handler.tags = ['economy']
handler.command = ['w','work','chambear','chamba', 'trabajar']
handler.group = true;
handler.register = true;

export default handler

function toNum(number) {
if (number >= 1000 && number < 1000000) {
return (number / 1000).toFixed(1) + 'k'
} else if (number >= 1000000) {
return (number / 1000000).toFixed(1) + 'M'
} else if (number <= -1000 && number > -1000000) {
return (number / 1000).toFixed(1) + 'k'
} else if (number <= -1000000) {
return (number / 1000000).toFixed(1) + 'M'
} else {
return number.toString()}}

function segundosAHMS(segundos) {
let minutos = Math.floor((segundos % 3600) / 60)
let segundosRestantes = segundos % 60
return `${minutos} minutos y ${segundosRestantes} segundos`
}

function pickRandom(list) {
return list[Math.floor(list.length * Math.random())];
}

const trabajo = [
   "💼 Trabajaste en una oficina y ganaste",
   "🏪 Atendiste en un supermercado y obtuviste",
   "🚗 Fuiste conductor de Uber y recibiste",
   "👷 Ayudaste en construcción y ganaste",
   "👨‍🍳 Cocinas en un restaurante y obtuviste",
   "🧹 Limpia casas y recibiste",
   "📦 Carga cajas en almacén y ganaste",
   "🌿 Trabaja en el campo y obtuviste",
   "🐕 Pasea perros y recibiste",
   "📚 Enseña clases y ganaste",
   "💻 Programa sitios web y obtuviste",
   "🎨 Pinta cuadros y recibiste",
   "🍕 Reparte pizza y ganaste",
   "🛒 Vende productos y obtuviste",
   "🚚 Descarga camiones y recibiste",
   "📊 Ingresa datos y ganaste",
   "☕ Sirve café y obtuviste",
   "📷 Toma fotos y recibiste",
   "✍️ Escribe artículos y ganaste",
   "🧪 Experimenta en laboratorio y obtuviste",
   "🎬 Actúa en película y recibiste",
   "🗳️ Haz encuestas y ganaste",
   "🔧 Repara autos y obtuviste",
   "🎵 Toca música y recibiste",
   "🏢 Vigila edificio y ganaste"
]