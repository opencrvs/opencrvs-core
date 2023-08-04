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
import * as chalk from 'chalk'
import { messageKeys } from '@notification/i18n/messages'
import { ILanguage } from '@notification/features/sms/utils'

interface IMessageKey {
  [key: string]: string
}

interface IMessageDescriptions {
  data: IMessageKey
}

async function extractMessages() {
  const COUNTRY_CONFIG_PATH = process.argv[2]
  const notification = JSON.parse(
    fs
      .readFileSync(
        `${COUNTRY_CONFIG_PATH}/src/features/languages/content/notification/notification.json`
      )
      .toString()
  )
  const descriptions: IMessageDescriptions = JSON.parse(
    fs
      .readFileSync(
        `${COUNTRY_CONFIG_PATH}/src/features/languages/content/notification/descriptions.json`
      )
      .toString()
  )

  const englishTranslations = notification.data.find(
    (obj: ILanguage) => obj.lang === 'en'
  ).messages
  try {
    console.log(
      `${chalk.yellow('Checking translations in notification service ...')}`
    )
    Object.keys(messageKeys).forEach((messageKey) => {
      let missingKeys = false

      if (!englishTranslations.hasOwnProperty(messageKey)) {
        missingKeys = true
        console.log(
          `${chalk.red(
            `No English translation key exists for messageKey.  Remeber to translate and add for all locales!!!: ${chalk.white(
              messageKey
            )} in ${chalk.white(
              `${COUNTRY_CONFIG_PATH}/src/features/languages/content/notification/notification.json`
            )}`
          )}`
        )
      }

      if (!descriptions.data.hasOwnProperty(messageKey)) {
        missingKeys = true
        console.log(
          `${chalk.red(
            `No description exists for messageKey: ${chalk.white(
              messageKey
            )} in ${chalk.white(
              `${COUNTRY_CONFIG_PATH}/src/features/languages/content/notification/descriptions.json`
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
