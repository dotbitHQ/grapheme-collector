const uts46 = require('idna-uts46-hx')
const puppeteer = require('puppeteer')
const { exit } = require('process')
const fs = require('fs/promises')
const path = require('path')

const filename = 'output/vietnamese.txt'

function rename(oldName, newSuffix) {
  const ext = path.extname(oldName)
  const newName = 'output/' + path.basename(oldName, ext) + newSuffix + ext
  return newName
}

;(async () => {
  let charList = []
  try {
    const data = await fs.readFile(filename, 'utf-8')
    charList = data.split('\n')
  } catch (_) {
    console.error("Can't load character set file, initialize with empty data.")
    process.exit(1)
  }

  console.log('charList:' + charList.length)
  charList = Array.from(new Set(charList))
  console.log('de-duplication charList:' + charList.length)

  const cleanList = []
  const dirtyList = []
  const errorList = []

  // You must start a whistle server before running this script, and rewrite all request to *.bit.cc to a empty response.
  const browser = await puppeteer.launch({
    args: ['--proxy-server=http://127.0.0.1:8899'],
  })
  const page = await browser.newPage()

  for (let i = 0; i < charList.length; i++) {
    const char = charList[i]
    try {
      const url = `https://${char}.bit.cc`
      await page.goto(url)
      let ascii = page.url()
      console.log(url + ' => ' + ascii)
      ascii = ascii.substr(0, ascii.length - 8)
      ascii = ascii.replace('https://', '')
      const unicode = uts46.toUnicode(ascii, { useStd3ASCII: true })
      console.log(`unicode(${unicode}) === char(${char}): ` + (unicode === char))
      if (unicode === char) {
        cleanList.push(char)
      }
      else {
        dirtyList.push(char)
      }
    }
    catch (err) {
      console.error(err)
      errorList.push(char)
    }
  }

  await browser.close()

  await fs.writeFile(rename(filename, '.clean'), cleanList.join('\n'), 'utf8')
  await fs.writeFile(rename(filename, '.dirty'), dirtyList.join('\n'), 'utf8')
  await fs.writeFile(rename(filename, '.error'), errorList.join('\n'), 'utf8')
})()

