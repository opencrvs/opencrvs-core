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

function existsInContentful(obj: any, value: string): boolean {
  if (Object.values(obj).indexOf(value) > -1) {
    return true
  }
  return false
}

async function extractMessages() {
  const RESOURCES_PATH = process.argv[2]
  const COUNTRY_CODE = process.argv[3]
  const notification = JSON.parse(
    fs
      .readFileSync(
        `${RESOURCES_PATH}/src/${COUNTRY_CODE}/features/languages/generated/notification/notification.json`
      )
      .toString()
  )
  const contentfulIds = JSON.parse(
    fs
      .readFileSync(
        `${RESOURCES_PATH}/src/${COUNTRY_CODE}/features/languages/generated/notification/contentful-ids.json`
      )
      .toString()
  )
  const descriptions: IMessageDescriptions = JSON.parse(
    fs
      .readFileSync(
        `${RESOURCES_PATH}/src/${COUNTRY_CODE}/features/languages/generated/notification/descriptions.json`
      )
      .toString()
  )

  const englishTranslations = notification.data.find(
    (obj: ILanguage) => obj.lang === 'en-US'
  ).messages
  try {
    // tslint:disable-next-line:no-console
    console.log(
      `${chalk.yellow('Checking translations in notification service ...')}`
    )
    Object.keys(messageKeys).forEach(messageKey => {
      const contentfulKeysToMigrate: string[] = []

      let missingKeys = false

      if (!englishTranslations.hasOwnProperty(messageKey)) {
        missingKeys = true
        // tslint:disable-next-line:no-console
        console.log(
          `${chalk.red(
            `No English translation key exists for messageKey.  Remeber to translate and add for all locales!!!: ${chalk.white(
              messageKey
            )} in ${chalk.white(
              `${RESOURCES_PATH}/src/${COUNTRY_CODE}/features/languages/generated/notification/notification.json`
            )}`
          )}`
        )
      }
      if (contentfulIds && !existsInContentful(contentfulIds, messageKey)) {
        // tslint:disable-next-line:no-console
        console.log(
          `${chalk.red(
            `You have set up a Contentful Content Management System.  OpenCRVS core has created this new key in this version: ${chalk.white(
              messageKey
            )} in ${chalk.white(`${messageKey}`)}`
          )}`
        )
        // tslint:disable-next-line:no-console
        console.log(
          `${chalk.yellow(
            'This key must be migrated into your Contentful CMS.  Saving to ...'
          )} in ${chalk.white(
            `${RESOURCES_PATH}/src/${COUNTRY_CODE}/features/languages/generated/notification/contentful-keys-to-migrate.json`
          )}`
        )
        contentfulKeysToMigrate.push(messageKey)
      }
      if (!descriptions.data.hasOwnProperty(messageKey)) {
        missingKeys = true
        // tslint:disable-next-line:no-console
        console.log(
          `${chalk.red(
            `No description exists for messageKey: ${chalk.white(
              messageKey
            )} in ${chalk.white(
              `${RESOURCES_PATH}/src/${COUNTRY_CODE}/features/languages/generated/notification/descriptions.json`
            )}`
          )}`
        )
      }

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

      fs.writeFileSync(
        `${RESOURCES_PATH}/src/${COUNTRY_CODE}/features/languages/generated/notification/contentful-keys-to-migrate.json`,
        JSON.stringify(contentfulKeysToMigrate, null, 2)
      )
    })
  } catch (err) {
    // tslint:disable-next-line:no-console
    console.log(err)
    process.exit(1)
    return
  }
}

extractMessages()
