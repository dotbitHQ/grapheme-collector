/**
 * Source:
 *
 * https://data.go.th/dataset
 * https://www.arts.chula.ac.th/ling/tnc/searchtnc/
 */

import GraphemeSplitter from 'grapheme-splitter'
import * as fs from 'fs/promises'

const filename = 'thai.txt'
const thaiSymbols = ['ฯ', 'ฯลฯ', 'ๆ', '๏', '๚', '๛', '┼', '฿']
const thaiCodePoints = /^[\u0E00-\u0E7F]*$/gu

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

    // const wordListDir = 'thai-wordlist'
    // let wordListFiles = []
    // try {
    //     wordListFiles = await fs.readdir(wordListDir)
    // } catch (_) {
    //     console.error(`Can't ready ${wordListDir}.`)
    //     process.exit(1)
    // }

    let wordListFiles = ['201705_2gram.txt']
    for (const wordListFile of wordListFiles) {
        let wordList: string[] = []
        try {
            const data = await fs.readFile(`thai-wordlist/${wordListFile}`, 'utf-8')
            wordList = data.split('\n')
        } catch (_) {
            console.error("Can't load character set file, initialize with empty data.")
            process.exit(1)
        }

        const splitter = new GraphemeSplitter()

        console.log('Start parsing word list ...')
        wordList.forEach((word, i) => {
            const letters = splitter.splitGraphemes(word)

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
    }

    console.log('New letters found:', newLettersCount)
    await fs.writeFile(`output/${filename}`, existLetters.join('\n'), 'utf8')
})()
