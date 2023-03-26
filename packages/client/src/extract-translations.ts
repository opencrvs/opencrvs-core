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
import { ILanguage } from '@client/i18n/reducer'

interface IReactIntlDescriptions {
  [key: string]: string
}

// unit tests use some content keys that do not need to be content managed
const testKeys = ['form.field.label.UNION', 'form.field.label.DIVISION']

function existsInContentful(obj: any, value: string): boolean {
  if (Object.values(obj).indexOf(value) > -1) {
    return true
  }
  return false
}
const write = process.argv.includes('--write')
const COUNTRY_CONFIG_PATH = process.argv[2]
type LocalisationFile = {
  data: Array<{
    lang: string
    displayName: string
    messages: Record<string, string>
  }>
}

function writeTranslations(data: LocalisationFile) {
  fs.writeFileSync(
    `${COUNTRY_CONFIG_PATH}/src/features/languages/content/client/client.json`,
    JSON.stringify(data, null, 2)
  )
}

function readTranslations() {
  return JSON.parse(
    fs
      .readFileSync(
        `${COUNTRY_CONFIG_PATH}/src/features/languages/content/client/client.json`
      )
      .toString()
  )
}
function readContentfulIds() {
  return JSON.parse(
    fs
      .readFileSync(
        `${COUNTRY_CONFIG_PATH}/src/features/languages/content/client/contentful-ids.json`
      )
      .toString()
  )
}
function isEnglish(obj: ILanguage) {
  return obj.lang === 'en-US' || obj.lang === 'en'
}

async function extractMessages() {
  let client: LocalisationFile
  let contentfulIds: Record<string, string>
  try {
    client = readTranslations()
    contentfulIds = readContentfulIds()
  } catch (error: unknown) {
    const err = error as Error & { code: string }
    if (err.code === 'ENOENT') {
      console.error(err.message)
      console.error(
        `Your environment variables may not be set.
        Please add valid COUNTRY_CONFIG_PATH, as an environment variable.
        If they are set correctly, then something is wrong with
        this file: ${COUNTRY_CONFIG_PATH}/src/features/languages/content/client/client.json or
        this file: ${COUNTRY_CONFIG_PATH}/src/features/languages/content/client/contentful-ids.json`
      )
    } else {
      console.error(err)
    }
    process.exit(1)
  }
  let results: Message[] = []
  const pattern = 'src/**/*.@(tsx|ts)'
  try {
    // eslint-disable-line no-console
    console.log('Checking translations in application...')
    console.log()

    glob(pattern, (err: any, files) => {
      if (err) {
        throw new Error(err)
      }

      files.forEach((f) => {
        const contents = fs.readFileSync(f).toString()
        results = results.concat(main(contents))
      })

      const reactIntlDescriptions: IReactIntlDescriptions = {}
      results.forEach((r) => {
        reactIntlDescriptions[r.id] = r.description!
      })
      const contentfulKeysToMigrate: string[] = []
      const englishTranslations = client.data.find(isEnglish)?.messages
      const missingKeys: string[] = []

      Object.keys(reactIntlDescriptions).forEach((key) => {
        if (
          !englishTranslations?.hasOwnProperty(key) &&
          !(testKeys.indexOf(key) > -1)
        ) {
          missingKeys.push(key)
        }

        if (contentfulIds && !existsInContentful(contentfulIds, key)) {
          contentfulKeysToMigrate.push(key)
        }
      })

      if (missingKeys.length > 0) {
        // eslint-disable-line no-console
        console.log(chalk.red.bold('Missing translations'))
        console.log(`You are missing the following content keys from your country configuration package:\n
${chalk.white(missingKeys.join('\n'))}\n
Translate the keys and add them to this file:
${chalk.white(
  `${COUNTRY_CONFIG_PATH}/src/features/languages/content/client/client.json`
)}`)

        if (write) {
          const defaultsToBeAdded = missingKeys.map((key) => [
            key,
            results.find(({ id }) => id === key)?.defaultMessage
          ])
          const newEnglishTranslations: Record<string, string> = {
            ...englishTranslations,
            ...Object.fromEntries(defaultsToBeAdded)
          }

          const english = client.data.find(isEnglish)!
          english.messages = newEnglishTranslations
          writeTranslations(client)
        } else {
          console.log(`
${chalk.green('Tip 🪄:')}
${chalk.white(
  `If you want this command do add the missing keys for you, run it with the ${chalk.bold(
    '--write'
  )} flag`
)}`)
        }

        process.exit(1)
      }

      if (contentfulKeysToMigrate.length > 0) {
        console.log(chalk.bold.yellow('Contentful'))
        console.log(
          `${chalk.white(
            `This country configuration is setup to optionally use the Contentful Content Management System.
${chalk.bold(
  'If your team is not using Contentful, you can safely ignore this message'
)}.

The following keys do not currently exist in Contentful:

${chalk.white(contentfulKeysToMigrate.join('\n'))}`
          )}`
        )
        console.log()
        console.log(
          `${chalk.yellow(
            'When this script passes, OpenCRVS will save the new keys here:'
          )}
${chalk.bold(
  chalk.white(
    `${COUNTRY_CONFIG_PATH}/src/features/languages/content/client/contentful-keys-to-migrate.json`
  )
)}
and save the description into descriptions.json so that later you can import it into an existing or new Contentful installation.`
        )
        console.log()
        console.log()
      }

      fs.writeFileSync(
        `${COUNTRY_CONFIG_PATH}/src/features/languages/content/client/descriptions.json`,
        JSON.stringify({ data: reactIntlDescriptions }, null, 2)
      )
      fs.writeFileSync(
        `${COUNTRY_CONFIG_PATH}/src/features/languages/content/client/contentful-keys-to-migrate.json`,
        JSON.stringify(contentfulKeysToMigrate, null, 2)
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
