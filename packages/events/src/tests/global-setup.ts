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
import type { ProvidedContext } from 'vitest'

type ProvideFunction = <K extends keyof ProvidedContext>(
  key: K,
  value: ProvidedContext[K]
) => void

async function setupServer() {
  return new ElasticsearchContainer('elasticsearch:8.16.4')
    .withExposedPorts(9200)
    .withStartupTimeout(120_000)
    .withEnvironment({
      'discovery.type': 'single-node',
      'xpack.security.enabled': 'false',
      'action.destructive_requires_name': 'false'
    })
    .start()
}

export default async function setup({ provide }: { provide: ProvideFunction }) {
  const eventsMongoD = await MongoMemoryServer.create()
  const userMgntMongoD = await MongoMemoryServer.create()
  const es = await setupServer()

  const eventsURI = eventsMongoD.getUri()
  const userMgntURI = userMgntMongoD.getUri()

  provide('ELASTICSEARCH_URI', `${es.getHost()}:${es.getMappedPort(9200)}`)
  provide('EVENTS_MONGO_URI', eventsURI)
  provide('USER_MGNT_MONGO_URI', userMgntURI)

  return async () => {
    await es.stop()
    await eventsMongoD.stop()
    await userMgntMongoD.stop()
  }
}
