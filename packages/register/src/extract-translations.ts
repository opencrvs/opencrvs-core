/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
/* eslint-disable */
import * as fs from 'fs'
import glob from 'glob'
import main, { Message } from 'typescript-react-intl'
import chalk from 'chalk'
import { Parser } from 'json2csv'
import { ILanguage } from '@register/i18n/reducer'

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
  const register = JSON.parse(
    fs
      .readFileSync(
        '../resources/src/bgd/features/languages/generated/register.json'
      )
      .toString()
  )
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
        var res = main(contents)
        results = results.concat(res)
      })
      const reactIntlSource: IReactIntlSource = {}
      results.forEach(r => {
        reactIntlSource[r.id] = {
          defaultMessage: r.defaultMessage,
          description: r.description
        }
      })
      const englishTranslations = register.data.find(
        (obj: ILanguage) => obj.lang === 'en'
      ).messages
      const bengaliTranslations = register.data.find(
        (obj: ILanguage) => obj.lang === 'bn'
      ).messages
      let missingKeys = false

      Object.keys(reactIntlSource).forEach(key => {
        if (!englishTranslations.hasOwnProperty(key)) {
          missingKeys = true
          // eslint-disable-line no-console
          console.log(
            `${chalk.red(
              `No English translation key exists for message id: ${chalk.white(
                key
              )} in ${chalk.white(
                'resources/src/bgd/features/languages/generated/register.json'
              )}`
            )}`
          )
        }
        if (!bengaliTranslations.hasOwnProperty(key)) {
          missingKeys = true
          // eslint-disable-line no-console
          console.log(
            `${chalk.redBright(
              `No Bengali translation key exists for message id: ${chalk.white(
                key
              )} in ${chalk.yellow(
                `resources/src/bgd/features/languages/generated/register.json`
              )}`
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
      fs.writeFileSync(
        `../resources/src/bgd/features/languages/generated/bn.csv`,
        bengaliLanguageCSV
      )
      const englishLanguageCSV = json2csvParser.parse(
        buildTranslationsCSVData(englishTranslations, reactIntlSource)
      )
      fs.writeFileSync(
        `../resources/src/bgd/features/languages/generated/en.csv`,
        englishLanguageCSV
      )
    })
  } catch (err) {
    // eslint-disable-line no-console
    console.log(err)
    process.exit(1)
    return
  }
}

extractMessages()
