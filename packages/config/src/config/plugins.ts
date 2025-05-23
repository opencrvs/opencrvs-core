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
import { logger } from '@opencrvs/commons'
import { env } from '@config/environment'
import { ServerRegisterPluginObject } from '@hapi/hapi'
import * as JWT from 'hapi-auth-jwt2'
import * as Pino from 'hapi-pino'
import * as Sentry from 'hapi-sentry'

type IHapiPlugin<T = any> = ServerRegisterPluginObject<T>

export default function getPlugins() {
  const plugins: IHapiPlugin[] = [{ plugin: JWT, options: {} }]

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

  if (env.SENTRY_DSN) {
    plugins.push({
      plugin: Sentry,
      options: {
        client: {
          environment: env.DOMAIN,
          dsn: env.SENTRY_DSN,
          initialScope: {
            tags: { service: 'config' }
          }
        },
        catchLogErrors: true
      }
    })
  }
  return plugins
}
