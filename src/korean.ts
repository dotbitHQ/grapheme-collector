import axios from 'axios'
import * as cheerio from 'cheerio'
import GraphemeSplitter from 'grapheme-splitter'
import * as fs from 'fs/promises'

const filename = 'korean.txt'
const url = 'https://www.topikguide.com/ultimate-list-of-country-names-in-korean/'

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

    console.log('Load page:', url)
    const resq = await axios.get(url)
    const $ = cheerio.load(resq.data)

    const splitter = new GraphemeSplitter()

    console.log('Start parsing page ...')
    // Selector for https://www.topikguide.com/korean-frequency-list-top-6000-words/
    // div.tve_shortcode_rendered
    // $('section.thrv_wrapper > table tr > td:nth-child(2)').each((i, el) => {
    // Selector for https://www.topikguide.com/most-common-korean-verbs/
    // $('section.thrv_wrapper > table tr > td:nth-child(1)').each((i, el) => {
    // Selector for https://www.topikguide.com/full-list-of-korean-universities/
    $('section.thrv_wrapper > table tr > td:nth-child(3)').each((i, el) => {
    // Selector for https://en.wikipedia.org/wiki/List_of_South_Korean_surnames_by_prevalence
    // $('div.mw-parser-output > table tr > td:nth-child(2)').each((i, el) => {
        const word = $(el).text().trim()
        console.log('Found word:', word)

        const letters = splitter.splitGraphemes(word)
        console.log('Split to letters:', letters)

        for (let letter of letters) {
            // Skip empty string and letters not belong to hangul syllables.
            if (letter.trim().length <= 0 || !/[\uAC00-\uD7AF]/.test(letter)) {
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
})()
