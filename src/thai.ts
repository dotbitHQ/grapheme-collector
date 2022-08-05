import axios from 'axios'
import * as cheerio from 'cheerio'
import GraphemeSplitter from 'grapheme-splitter'
import * as fs from 'fs/promises'

const filename = 'thai.txt'
const thaiSymbols = ['ฯ', 'ฯลฯ', 'ๆ', '๏', '๚', '๛', '┼', '฿']
const thaiCodePoints = /^[\u0E00-\u0E7F]*$/gu

const pages = [
    { selector: 'table tr > td:nth-child(2)', url: 'http://www.sealang.net/thai/vocabulary/search.pl?list=Thai+AWL+secondary&query=&level=&relation=orHarder' },
    { selector: 'table tr > td:nth-child(2)', url: 'http://www.sealang.net/thai/vocabulary/search.pl?list=Thai+AWL+main&query=&level=&relation=orHarder' },
    { selector: 'table tr > td:nth-child(2)', url: 'http://www.sealang.net/thai/vocabulary/search.pl?list=AUA+Chapter+{{page}}&query=&level=&relation=orHarder' },
    { selector: 'table.wikitable tr > td:nth-child(2)', url: 'https://en.wikipedia.org/wiki/List_of_municipalities_in_Thailand'},
    { selector: 'table.has-background tr > td:nth-child(1)', url: 'https://ling-app.com/th/names-in-thai/'},
]

;(async () => {
    console.log('Load character set file:', filename)
    let data: string
    try {
        data = await fs.readFile(`output/${filename}`, 'utf-8')
    } catch (_) {
        console.error("Can't load character set file, initialize with empty data.")
        data = ''
    }
    let existLetters: string[] = []
    if (data.length > 0) {
        existLetters = data.split('\n')
    }

    let newLettersCount = 0
    // The i should be adjust manually to cope with occasional failsures of requests.
    for (let i = 1; i <= 1; i++) {
        // const page = i.toString().padStart(2, '0')
        // const url = pages[0].url.replace('{{page}}', page)
        const url = pages[4].url

        console.log(`Load page ${i}: ${url}`)
        let $: cheerio.CheerioAPI
        try {
            const resq = await axios.get(url, { timeout: 20 * 1000 })
            $ = cheerio.load(resq.data)
        } catch (e) {
            console.error(`Failed to load page ${i}: ${url}`)
            process.exit(1)
        }

        const splitter = new GraphemeSplitter()

        console.log('Start parsing page ...')
        $(pages[4].selector).each((i, el) => {
            if (i === 0) {
                return
            }

            const word = $(el).text().trim()
            console.log('Found word:', word)

            const letters = splitter.splitGraphemes(word)
            console.log('Split to letters:', letters)

            for (let letter of letters) {
                if (letter.trim().length <= 0 || thaiSymbols.includes(letter) || !thaiCodePoints.test(letter)) {
                    continue
                }

                if (!existLetters.includes(letter)) {
                    console.log('New letter found:', letter)
                    newLettersCount++
                    existLetters.push(letter)
                }
            }
        })

        console.log('New letters found:', newLettersCount)
        await fs.writeFile(`output/${filename}`, existLetters.join('\n'), 'utf8')

        await sleep(20 * 1000)
    }
})()

function sleep(ms: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    })
}
