/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
/* eslint-disable */
import * as fs from 'fs'
import glob from 'glob'
import main, { Message } from 'typescript-react-intl'
import chalk from 'chalk'
import { ILanguage } from '@login/i18n/reducer'

interface IReactIntlDescriptions {
  [key: string]: string
}

function existsInContentful(obj: any, value: string): boolean {
  if (Object.values(obj).indexOf(value) > -1) {
    return true
  }
  return false
}

async function extractMessages() {
  const COUNTRY_CONFIG_PATH = process.argv[2]

  let login: {
    data: Array<{
      lang: string
      displayName: string
      messages: Record<string, string>
    }>
  }
  try {
    login = JSON.parse(
      fs
        .readFileSync(`${COUNTRY_CONFIG_PATH}/src/api/content/login/login.json`)
        .toString()
    )
  } catch (err) {
    console.error(
      `Please add valid COUNTRY_CONFIG_PATH as an environment variable`
    )
    process.exit(1)
  }
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
      files.forEach((f) => {
        const contents = fs.readFileSync(f).toString()
        var res = main(contents)
        results = results.concat(res)
      })
      const reactIntlDescriptions: IReactIntlDescriptions = {}
      results.forEach((r) => {
        reactIntlDescriptions[r.id] = r.description
      })
      const englishTranslations = login.data.find(
        (obj: ILanguage) => obj.lang === 'en-US' || obj.lang === 'en'
      )?.messages

      const missingKeys = Object.keys(reactIntlDescriptions).filter(
        (key) => !englishTranslations?.hasOwnProperty(key)
      )

      if (missingKeys.length > 0) {
        // eslint-disable-line no-console
        console.log(chalk.red.bold('Missing translations'))
        console.log(`You are missing the following content keys from your country configuration package:\n
${chalk.white(missingKeys.join('\n'))}\n
Translate the keys and add them to this file:
${chalk.white(`${COUNTRY_CONFIG_PATH}/src/api/content/login/login.json`)}`)

        process.exit(1)
      }

      fs.writeFileSync(
        `${COUNTRY_CONFIG_PATH}/src/api/content/login/descriptions.json`,
        JSON.stringify({ data: reactIntlDescriptions }, null, 2)
      )
    })
  } catch (err) {
    // eslint-disable-line no-console
    console.log(err)
    process.exit(1)
  }
}

extractMessages()
