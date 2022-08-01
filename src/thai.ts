import axios from 'axios'
import * as cheerio from 'cheerio'
import GraphemeSplitter from 'grapheme-splitter'
import * as fs from 'fs/promises'

const filename = 'thai.txt'

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
        const page = i.toString().padStart(2, '0')
        const url = `http://www.sealang.net/thai/vocabulary/search.pl?list=Thai+AWL+secondary&query=&level=&relation=orHarder`
        // const url = `http://www.sealang.net/thai/vocabulary/search.pl?list=Thai+AWL+main&query=&level=&relation=orHarder`
        // const url = `http://www.sealang.net/thai/vocabulary/search.pl?list=AUA+Chapter+${page}&query=&level=&relation=orHarder`

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
        $('table tr > td:nth-child(2)').each((i, el) => {
            if (i === 0) {
                return
            }

            const word = $(el).text().trim()
            console.log('Found word:', word)

            const letters = splitter.splitGraphemes(word)
            console.log('Split to letters:', letters)

            for (let letter of letters) {
                if (letter.trim().length <= 0) {
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
