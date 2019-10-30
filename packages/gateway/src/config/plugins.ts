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
import * as Good from 'good'
import * as JWT from 'hapi-auth-jwt2'
import { getExecutableSchema } from '@gateway/graphql/config'

export const getPlugins = (env: string | undefined, schemaPath: string) => {
  const plugins: any[] = []
  const executableSchema = getExecutableSchema(schemaPath)

  plugins.push(
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
                  response: '*'
                }
              ]
            },
            {
              module: 'good-console'
            },
            'stdout'
          ]
        }
      },
      name: 'good',
      version: '8.1.1'
    },
    {
      plugin: graphqlHapi,
      options: {
        path: '/graphql',
        graphqlOptions: (request: any) => ({
          pretty: true,
          schema: executableSchema,
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
