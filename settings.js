import { watchFile, unwatchFile } from 'fs' 
import chalk from 'chalk'
import { fileURLToPath } from 'url'
import fs from 'fs'
import cheerio from 'cheerio'
import fetch from 'node-fetch'
import axios from 'axios'
import moment from 'moment-timezone' 

//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*


global.botNumber = '' 

//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

global.owner = [
// <-- Número @s.whatsapp.net -->
['573244642273', 'DuarteXV', true],
['240222646582', 'Rufino ✝️', true],
['51933000214', 'Rufino ✝️', true],

  
// <-- Número @lid -->
  ['', '210200699113555', true]
];

//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

global.mods = []
global.suittag = ['240222646582'] 
global.prems = []

//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

global.libreria = 'Baileys'
global.baileys = 'V 6.7.17' 
global.vs = '2.2.5'
global.nameqr = '🌷 Waguri-Bot-MD 🌷'
global.namebot = 'W A G U R I B O T'
global.sessions = 'Sessions'
global.jadi = 'JadiBots' 


//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

global.packname = 'Waguri-Bot-MD'
global.botname = '⟡ 𝐖𝐚𝐠𝐮𝐫𝐢 𝐁𝐨𝐭 ⟡'
global.wm = '💗𝕎𝕒𝕘𝕦𝕣𝕚 𝔹𝕠𝕥💗'
global.author = '© Rufino'
global.dev = '© 🄿🄾🅆🄴🅁🄴🄳 Rufino'
global.textbot = 'Soy Waguri Bot 🌸, un alma amable y serena. Mi lenguaje es floral y poético, y estoy aquí para guiarte con dulzura y un toque de magia en cada comando.'
global.etiqueta = 'Waguri-Bot-MD'

//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

global.moneda = 'Waguricoins'
global.welcom1 = '! Bienvenido a este jardin! 🌷 \n✨ Soy Waguri Bot✨ \n🌷 Edita este mensaje con setwelcome 🌸'
global.welcom2 ='Waguri Bot te despide con calma,Que tu camino florezca en sabiduría. 🌸! \n🌸 Edita este mensaje con setbye 🌸'
global.banner = 'https://files.catbox.moe/sc0huv.jpg'
global.avatar = 'https://files.catbox.moe/i5vw5o.jpg'

global.api = {
  url: 'https://api.stellarwa.xyz',
  key: 'Angelithixyz'
}

global.playlistApiKey = 'f9e54e5c6amsh8b4dfc0bfb94abap19bab2jsne8b65338207e'


global.apikey = 'adonix-key'
global.APIKeys = {
  'https://api.xteam.xyz': 'YOUR_XTEAM_KEY',
  'https://api.lolhuman.xyz': 'API_KEY',
  'https://api.betabotz.eu.org': 'API_KEY',
  'https://mayapi.ooguy.com': 'may-f53d1d49'
}

global.APIs = {
  ryzen: 'https://api.ryzendesu.vip',
  xteam: 'https://api.xteam.xyz',
  lol: 'https://api.lolhuman.xyz',
  delirius: 'https://delirius-apiofc.vercel.app',
  siputzx: 'https://api.siputzx.my.id',
  mayapi: 'https://mayapi.ooguy.com'
}

//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

global.gp1 = 'https://chat.whatsapp.com/FrED40x2QDt2YWNL3Kqt7g'
global.comunidad1 = 'https://chat.whatsapp.com/KMaADSQKeVhEciKrUFxTdn'
global.channel = 'https://whatsapp.com/channel/0029Vb6stJ2HwXb40WXDyn1U'
global.channel2 = 'https://whatsapp.com/channel/0029Vb6stJ2HwXb40WXDyn1U'
global.md = 'https://github.com/rufinofelipe/waguri-bot'
global.correo = 'rufinofelipe495@gmail.com' 

//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*


global.rcanal = { 
  contextInfo: { 
    isForwarded: true, 
    forwardedNewsletterMessageInfo: { 
      newsletterJid: "120363350523130615@newsletter", 
      serverMessageId: 100, 
      newsletterName: "🌸WAGURI-BOT-MD"
    }
  }
}


global.redes = 'https://whatsapp.com/channel/0029Vb6stJ2HwXb40WXDyn1U'
global.dev = '© 🄿🄾🅆🄴🅁🄴🄳 Rufino '
global.emoji = '💗'
global.emoji2 = '🌸'
global.emoji3 = '🌷'

//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

global.catalogo = 'mienlace'
global.estilo = { key: {  fromMe: false, participant: `0@s.whatsapp.net`, ...(false ? { remoteJid: "5219992095479-1625305606@g.us" } : {}) }, message: { orderMessage: { itemCount : -999999, status: 1, surface : 1, message: packname, orderTitle: 'Bang', thumbnail: catalogo, sellerJid: '0@s.whatsapp.net'}}}
global.ch = {
ch1: '120363420979328566@newsletter',
}
global.multiplier = 60

//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

global.cheerio = cheerio
global.fs = fs
global.fetch = fetch
global.axios = axios
global.moment = moment

global.opts = {
  ...global.opts,
  autoread: true,  
  queque: false 
}

//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
  unwatchFile(file)
  console.log(chalk.redBright("Update 'settings.js'"))
  import(`${file}?update=${Date.now()}`)
})