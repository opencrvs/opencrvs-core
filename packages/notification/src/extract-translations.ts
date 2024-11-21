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
import { messageKeys } from '@notification/i18n/messages'
import chalk from 'chalk'
import { Options, stringify } from 'csv-stringify'
import csv2json from 'csv2json'
import * as fs from 'fs'
import { promisify } from 'util'
const csvStringify = promisify<Array<Record<string, any>>, Options, string>(
  stringify
)

export async function writeJSONToCSV(
  filename: string,
  data: Array<Record<string, any>>
) {
  const csv = await csvStringify(data, {
    header: true
  })
  return fs.promises.writeFile(filename, csv, 'utf8')
}

export async function readCSVToJSON<T>(filename: string) {
  return new Promise<T>((resolve, reject) => {
    const chunks: string[] = []
    fs.createReadStream(filename)
      .on('error', reject)
      .pipe(
        csv2json({
          separator: ','
        })
      )
      .on('data', (chunk: string) => chunks.push(chunk))
      .on('error', reject)
      .on('end', () => {
        resolve(JSON.parse(chunks.join('')))
      })
  })
}

type CSVRow = { id: string; description: string } & Record<string, string>

const COUNTRY_CONFIG_PATH = process.argv[2]

function readTranslations() {
  return readCSVToJSON<CSVRow[]>(
    `${COUNTRY_CONFIG_PATH}/src/translations/notification.csv`
  )
}

async function extractMessages() {
  const translations = await readTranslations()

  try {
    console.log(
      `${chalk.yellow('Checking translations in notification service ...')}`
    )
    Object.keys(messageKeys).forEach((messageKey) => {
      let missingKeys = false

      if (!translations.find(({ id }) => id === messageKey)) {
        missingKeys = true
        console.log(
          `${chalk.red(
            `No translation key exists for ${messageKey}.  Remember to translate and add for all locales!!!: ${chalk.white(
              messageKey
            )} in ${chalk.white(
              `${COUNTRY_CONFIG_PATH}/src/translations/notification.csv`
            )}`
          )}`
        )
      }

      if (missingKeys) {
        console.log(
          `${chalk.red('WARNING: ')}${chalk.yellow(
            'Fix missing keys in locale files first.'
          )}`
        )
        process.exit(1)
      }
    })
  } catch (err) {
    console.log(err)
    process.exit(1)
  }
}

extractMessages()
