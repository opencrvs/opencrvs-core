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

import { ElasticsearchContainer } from '@testcontainers/elasticsearch'
import { MongoMemoryServer } from 'mongodb-memory-server'
export type { ProvidedContext } from 'vitest'

declare module 'vitest' {
  export interface ProvidedContext {
    MONGO_URI: string
    ELASTICSEARCH_URI: string
  }
}

async function setupServer() {
  return new ElasticsearchContainer('elasticsearch:8.14.3')
    .withExposedPorts(9200)
    .withStartupTimeout(120_000)
    .withEnvironment({
      'discovery.type': 'single-node',
      'xpack.security.enabled': 'false',
      'action.destructive_requires_name': 'false'
    })
    .start()
}

export default async function setup({ provide }: any) {
  const [mongod, es] = await Promise.all([
    await MongoMemoryServer.create(),
    await setupServer()
  ])
  const uri = mongod.getUri()

  provide('ELASTICSEARCH_URI', `${es.getHost()}:${es.getMappedPort(9200)}`)
  provide('MONGO_URI', uri)

  return async () => {
    await es.stop()
    await mongod.stop()
  }
}
