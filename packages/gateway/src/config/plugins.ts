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

import * as JWT from 'hapi-auth-jwt2'
import * as Pino from 'hapi-pino'
import * as Sentry from '@sentry/node'
import { SENTRY_DSN } from '@gateway/constants'
import { logger } from '@gateway/logger'
import * as Inert from '@hapi/inert'
import * as Vision from '@hapi/vision'
import * as HapiSwagger from 'hapi-swagger'

export const getPlugins = () => {
  const plugins: any[] = []

  if (SENTRY_DSN) {
    Sentry.init({ dsn: SENTRY_DSN, environment: process.env.NODE_ENV })
  }

  const swaggerOptions: HapiSwagger.RegisterOptions = {
    info: {
      title: 'Gateway API Documentation',
      version: '1.1.1'
    },
    schemes: ['http', 'https']
  }

  plugins.push(
    JWT,
    {
      plugin: Pino,
      options: {
        prettyPrint: true,
        logPayload: false,
        instance: logger
      }
    },
    {
      plugin: Inert
    },
    {
      plugin: Vision
    },
    {
      plugin: HapiSwagger,
      options: swaggerOptions
    }
  )

  return plugins
}
