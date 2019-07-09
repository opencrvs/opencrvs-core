/* eslint-disable */
import * as fs from 'fs'
import glob from 'glob'
import main, { Message } from 'typescript-react-intl'
import chalk from 'chalk'
import { ENGLISH_STATE } from '@register/i18n/locales/en'
import { BENGALI_STATE } from '@register/i18n/locales/bn'
import { Parser } from 'json2csv'

interface ITranslationCSVItem {
  Translation_Key: string
  Value: string
  Description: string
}

interface IMessages {
  [key: string]: string
}

interface IReactIntlSource {
  [key: string]: {
    defaultMessage: string
    description: string
  }
}

function buildTranslationsCSVData(
  translations: IMessages,
  source: IReactIntlSource
): ITranslationCSVItem[] {
  const data: ITranslationCSVItem[] = []
  Object.keys(source).forEach(key => {
    const translation: ITranslationCSVItem = {
      // eslint-disable-next-line @typescript-eslint/camelcase
      Translation_Key: key,
      Value: translations[key],
      // eslint-disable-line no-string-literal
      Description: source[key]['description']
    }
    data.push(translation)
  })
  return data
}

async function extractMessages() {
  let results: any[] = []
  const pattern = 'src/**/*.@(tsx|ts)'
  try {
    // eslint-disable-line no-console
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
      const reactIntlSource: IReactIntlSource = {}

      results.forEach(r => {
        reactIntlSource[r.id] = {
          defaultMessage: r.defaultMessage,
          description: r.description
        }
      })

      const englishTranslations = ENGLISH_STATE.messages
      const bengaliTranslations = BENGALI_STATE.messages
      let missingKeys = false

      Object.keys(reactIntlSource).forEach(key => {
        if (!englishTranslations.hasOwnProperty(key)) {
          missingKeys = true
          // eslint-disable-line no-console
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
          // eslint-disable-line no-console
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
        // eslint-disable-line no-console
        console.log(
          `${chalk.red('WARNING: ')}${chalk.yellow(
            'Fix missing keys in locale files first.'
          )}`
        )
        process.exit(1)
        return
      }

      const fields = ['Translation_Key', 'Value', 'Description']

      const json2csvParser = new Parser({ fields })
      const bengaliLanguageCSV = json2csvParser.parse(
        buildTranslationsCSVData(bengaliTranslations, reactIntlSource)
      )
      fs.writeFileSync(`src/i18n/locales/bn.csv`, bengaliLanguageCSV)
      const englishLanguageCSV = json2csvParser.parse(
        buildTranslationsCSVData(englishTranslations, reactIntlSource)
      )
      fs.writeFileSync(`src/i18n/locales/en.csv`, englishLanguageCSV)
    })
  } catch (err) {
    // eslint-disable-line no-console
    console.log(err)
    process.exit(1)
    return
  }
}

extractMessages()
