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
import * as Good from 'good'
import * as JWT from 'hapi-auth-jwt2'
import * as HapiI18n from 'hapi-i18n'
import {
  getAvailableLanguages,
  getDefaultLanguage
} from '@notification/i18n/utils'

export default function getPlugins() {
  const plugins: any[] = [
    JWT,
    {
      plugin: Good,
      options: {
        ops: {
          interval: 1000
        },
        reporters: {
          console: [
            {
              module: 'good-squeeze',
              name: 'Squeeze',
              args: [
                {
                  log: '*',
                  response: '*',
                  request: '*',
                  error: '*'
                }
              ]
            },
            {
              module: 'good-console'
            },
            'stdout'
          ]
        }
      }
    },
    {
      plugin: HapiI18n,
      options: {
        locales: getAvailableLanguages(),
        directory: __dirname + '/../i18n/locales',
        defaultLocale: getDefaultLanguage(),
        languageHeaderField: 'language'
      }
    }
  ]

  return plugins
}
