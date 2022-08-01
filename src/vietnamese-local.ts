import GraphemeSplitter from 'grapheme-splitter'
import * as fs from 'fs/promises'

const filename = 'vietnamese.txt'
const upperCaseAndDigit = '0123456789AÁĂÂẢẤBCDĐEÊỂỀFGHIÍJKLMNOÔƠỞÒPQRSTUƯVWXYÝZ'
const symbols = '[]{}()<>,.=+-*/%&|^~!@#$%^`?_:;\'\"'

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

    let wordList: string[] = []
    const wordListFile = 'vietnamese-wordlist/Viet74K.txt'
    try {
        const data = await fs.readFile(wordListFile, 'utf-8')
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
            if (letter.trim().length <= 0 || upperCaseAndDigit.includes(letter) || symbols.includes(letter)) {
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
