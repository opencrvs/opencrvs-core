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
import * as Pino from 'hapi-pino'
import * as Sentry from 'hapi-sentry'
import { SENTRY_DSN } from '@config/config/constants'
import * as JWT from 'hapi-auth-jwt2'
import { logger } from '@config/config/logger'

export default function getPlugins() {
  const plugins: any[] = [
    JWT,
    {
      plugin: Pino,
      options: {
        prettyPrint: false,
        logPayload: false,
        instance: logger
      }
    }
  ]

  if (SENTRY_DSN) {
    plugins.push({
      plugin: Sentry,
      options: {
        client: {
          environment: process.env.HOSTNAME,
          dsn: SENTRY_DSN
        },
        catchLogErrors: true
      }
    })
  }
  return plugins
}
