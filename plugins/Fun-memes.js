import hispamemes from 'hispamemes'

let handler = async (m, { conn, usedPrefix, command }) => {
    // Tu lista de memes
    const memesList = [
        'https://cdn.hostrta.win/fl/ddmc.jpg',
        'https://cdn.hostrta.win/fl/lmzb.jpg',
        'https://cdn.hostrta.win/fl/esrf.jpg',
        'https://cdn.hostrta.win/fl/00p5.jpg',
        'https://cdn.hostrta.win/fl/bdog.jpg',
        'https://cdn.hostrta.win/fl/ik2o.jpg',
        'https://cdn.hostrta.win/fl/e7is.jpg',
        'https://cdn.hostrta.win/fl/9q4i.jpg',
        'cdn.hostrta.win/fl/o1dz.jpg',
        'https://cdn.hostrta.win/fl/hj4s.jpg',
        'https://cdn.hostrta.win/fl/cqck.jpg',
        'https://cdn.hostrta.win/fl/97u6.jpg'
    ]
    
    // Seleccionar un meme aleatorio
    const randomIndex = Math.floor(Math.random() * memesList.length)
    const memeUrl = memesList[randomIndex]
    
    // Enviar el meme
    conn.sendFile(m.chat, memeUrl, 'meme.jpg', `😂 | ¡Meme aleatorio!`, m)
    m.react('🌸')
}

handler.help = ['meme']
handler.tags = ['fun']
handler.command = ['meme', 'memes']
handler.coin = 1
handler.group = true;
handler.register = true

export default handler