import * as fs from 'fs'
import glob from 'glob'
import main, { Message } from 'typescript-react-intl'
import chalk from 'chalk'
import { ENGLISH_STATE } from './i18n/locales/en'
import { BENGALI_STATE } from './i18n/locales/bn'
import { Parser } from 'json2csv'

interface ITranslationCSVItem {
  Translation_Key: string
  Value: string
}

interface IMessages {
  [key: string]: string
}

function buildTranslationsCSVData(
  translations: IMessages
): ITranslationCSVItem[] {
  const data: ITranslationCSVItem[] = []
  Object.keys(translations).forEach(key => {
    const translation: ITranslationCSVItem = {
      Translation_Key: key,
      Value: translations[key]
    }
    data.push(translation)
  })
  return data
}

async function extractMessages() {
  let results: any[] = []
  const pattern = 'src/**/*.@(tsx|ts)'
  try {
    // tslint:disable-next-line:no-console
    console.log(`${chalk.yellow('Checking translations in application ...')}`)
    glob(pattern, (err: any, files) => {
      if (err) {
        throw new Error(err)
      }
      let res: Message[]
      files.forEach(f => {
        const contents = fs.readFileSync(f).toString()
        res = main(contents)
        results = results.concat(res)
      })
      const locale = {}

      results.forEach(r => {
        locale[r.id] = r.defaultMessage
      })

      const englishTranslations = ENGLISH_STATE.messages
      const bengaliTranslations = BENGALI_STATE.messages
      let missingKeys = false

      Object.keys(locale).forEach(key => {
        if (!englishTranslations.hasOwnProperty(key)) {
          missingKeys = true
          // tslint:disable-next-line:no-console
          console.log(
            `${chalk.red(
              `No translation key exists for message id: ${chalk.white(
                key
              )} in ${chalk.white('locales/en.ts')}`
            )}`
          )
        }
        if (!bengaliTranslations.hasOwnProperty(key)) {
          missingKeys = true
          // tslint:disable-next-line:no-console
          console.log(
            `${chalk.redBright(
              `No translation key exists for message id: ${chalk.white(
                key
              )} in ${chalk.yellow(`locales/bn.ts`)}`
            )}`
          )
        }
      })

      if (missingKeys) {
        // tslint:disable-next-line:no-console
        console.log(
          `${chalk.red('WARNING: ')}${chalk.yellow(
            'Fix missing keys in locale files first.'
          )}`
        )
        process.exit(1)
        return
      }

      const fields = ['Translation_Key', 'Value']

      const json2csvParser = new Parser({ fields })
      const languageCSV = json2csvParser.parse(
        buildTranslationsCSVData(bengaliTranslations)
      )
      fs.writeFileSync(`src/i18n/locales/bn.csv`, languageCSV)
    })
  } catch (err) {
    // tslint:disable-next-line:no-console
    console.log(err)
    process.exit(1)
    return
  }
}

extractMessages()
