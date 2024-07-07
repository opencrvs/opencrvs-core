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

import { Server } from '@hapi/hapi'
import { join } from 'path'
import * as Joi from 'joi'
import { register } from 'ts-node'
import * as tsConfigPaths from 'tsconfig-paths'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const parse = require('joi-to-json')

module.paths.push(process.cwd())

export const requestSchema = Joi.object({
  id: Joi.string().required(),
  password: Joi.string().required()
})

const serverModulePath = process.argv[2]

// eslint-disable-next-line @typescript-eslint/no-var-requires
const tsConfig = require(join(process.cwd(), 'tsconfig.json')) as any

register({
  project: join(process.cwd(), 'tsconfig.json'),
  transpileOnly: true
})

tsConfigPaths.register({
  baseUrl: tsConfig.compilerOptions.baseUrl,
  paths: tsConfig.compilerOptions.paths
})

async function main() {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { createServer } = require(join(process.cwd(), serverModulePath)) as {
    createServer: () => Promise<{ server: Server }>
  }

  const { server } = await createServer()

  const routes = server.table()
  const root = {
    type: 'object',
    title: 'HapiRoutes',
    additionalProperties: false,
    required: Array.from(new Set(routes.map((route) => route.method))),
    properties: {
      get: {
        type: 'object',
        additionalProperties: false,
        properties: {} as Record<string, any>,
        required: [] as string[]
      },
      post: {
        type: 'object',
        additionalProperties: false,
        properties: {} as Record<string, any>,
        required: [] as string[]
      },
      put: {
        type: 'object',
        additionalProperties: false,
        properties: {} as Record<string, any>,
        required: [] as string[]
      },
      delete: {
        type: 'object',
        additionalProperties: false,
        properties: {} as Record<string, any>,
        required: [] as string[]
      }
    }
  }
  for (const route of routes) {
    const validation = route.settings.validate

    const schema = route.settings.response?.schema as any
    const method = route.method as keyof typeof root.properties

    root.properties[method] = {
      type: 'object',
      additionalProperties: false,
      required: routes
        .filter((r) => r.method === method)
        .map((route) => route.path),
      properties: {}
    }

    root.properties[method].properties[route.path] = {
      type: 'object',
      additionalProperties: false,
      required: ['response', 'request'],
      properties: {
        ...(!validation?.payload
          ? { request: { not: {}, additionalProperties: false } }
          : {
              request: {
                ...parse(validation.payload),
                additionalProperties: false
              }
            }),
        ...(!schema?.describe
          ? { response: { not: {}, additionalProperties: false } }
          : {
              response: {
                ...parse(route.settings.response?.schema),
                additionalProperties: false
              }
            })
      }
    }
  }
  console.log(JSON.stringify(root))
}
main()
