import axios from 'axios'
import * as cheerio from 'cheerio'
import GraphemeSplitter from 'grapheme-splitter'
import * as fs from 'fs/promises'

const filename = 'vietnamese.txt'
const url = 'https://en.wiktionary.org/wiki/Wiktionary:Frequency_lists/Vietnamese_syllables'
const upperCaseAndDigit = '0123456789AĂÂẢẤBCDĐEÊGHIÍJKLMNOÔƠỞPQRSTUƯVXYÝ'

;(async () => {
    console.log('Load character set file:', filename)
    let data: string
    try {
        data = await fs.readFile(filename, 'utf-8')
    } catch (_) {
        console.error("Can't load character set file, initialize with empty data.")
        data = ''
    }
    let existLetters: string[] = []
    if (data.length > 0) {
        existLetters = data.split('\n')
    }

    let newLettersCount = 0

    console.log('Load page:', url)
    const resq = await axios.get(url)
    const $ = cheerio.load(resq.data)

    const splitter = new GraphemeSplitter()

    console.log('Start parsing page ...')
    $('div.mw-parser-output li a').each((i, el) => {
        const word = $(el).text().trim()
        console.log('Found word:', word)

        const letters = splitter.splitGraphemes(word)
        console.log('Split to letters:', letters)

        for (let letter of letters) {
            if (letter.trim().length <= 0 || upperCaseAndDigit.includes(letter)) {
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
    await fs.writeFile(`outputs/${filename}`, existLetters.join('\n'), 'utf8')
})()
