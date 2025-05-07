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

import * as JWT from 'hapi-auth-jwt2'
import * as Pino from 'hapi-pino'
import * as Sentry from 'hapi-sentry'
import { SENTRY_DSN } from '@gateway/constants'
import { logger } from '@opencrvs/commons'
import * as HapiSwagger from 'hapi-swagger'
import { ServerRegisterPluginObject } from '@hapi/hapi'
import * as H2o2 from '@hapi/h2o2'

export const getPlugins = () => {
  const swaggerOptions: HapiSwagger.RegisterOptions = {
    info: {
      title: 'Gateway API Documentation',
      version: '1.7.0'
    },
    definitionPrefix: 'useLabel',
    basePath: '/v1/',
    schemes: ['http', 'https'],
    swaggerUI: false,
    documentationPage: false
  }

  const plugins = [
    JWT,
    {
      plugin: HapiSwagger,
      options: swaggerOptions
    },
    H2o2
  ] as Array<ServerRegisterPluginObject<any>>

  if (process.env.NODE_ENV === 'production') {
    plugins.push({
      plugin: Pino,
      options: {
        prettyPrint: false,
        logPayload: false,
        instance: logger
      }
    })
  }

  if (SENTRY_DSN) {
    plugins.push({
      plugin: Sentry,
      options: {
        client: {
          dsn: SENTRY_DSN,
          environment: process.env.DOMAIN,
          initialScope: {
            tags: { service: 'gateway' }
          }
        },
        catchLogErrors: true
      }
    })
  }
  return plugins
}
