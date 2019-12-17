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
import { graphqlHapi } from 'apollo-server-hapi'

import * as JWT from 'hapi-auth-jwt2'
import * as Pino from 'hapi-pino'
import * as Sentry from '@sentry/node'
import { getExecutableSchema } from '@gateway/graphql/config'
import { SENTRY_DSN } from '@gateway/constants'
import { GraphQLError } from 'graphql'

export const getPlugins = (env: string | undefined, schemaPath: string) => {
  const plugins: any[] = []
  const executableSchema = getExecutableSchema(schemaPath)
  Sentry.init({ dsn: SENTRY_DSN, environment: process.env.NODE_ENV })
  plugins.push(
    JWT,
    {
      plugin: Pino,
      options: {
        prettyPrint: false,
        logPayload: false
      }
    },
    {
      plugin: graphqlHapi,
      options: {
        path: '/graphql',
        graphqlOptions: (request: any) => ({
          pretty: true,
          schema: executableSchema,
          formatError: (error: GraphQLError) => {
            Sentry.captureException(error)
            return error
          },
          // this is where you add anything you want attached to context in resolvers
          context: {
            Authorization: request.headers['authorization']
          }
        })
      },
      name: 'graphqlHapi',
      version: '1.3.6'
    }
  )

  return plugins
}
