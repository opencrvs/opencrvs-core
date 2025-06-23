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

import path from 'node:path'
import { ElasticsearchContainer } from '@testcontainers/elasticsearch'
import { PostgreSqlContainer } from '@testcontainers/postgresql'
import { MongoMemoryServer } from 'mongodb-memory-server'
import type { ProvidedContext } from 'vitest'

type ProvideFunction = <K extends keyof ProvidedContext>(
  key: K,
  value: ProvidedContext[K]
) => void

async function setupElasticSearchServer() {
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

async function setupPostgresServer() {
  return new PostgreSqlContainer('postgres:17')
    .withUsername('postgres')
    .withPassword('postgres')
    .withDatabase('postgres')
    .withExposedPorts(5432)
    .withCopyContentToContainer([
      {
        content: `CREATE ROLE events_migrator WITH LOGIN PASSWORD 'migrator_password'; CREATE ROLE events_app WITH LOGIN PASSWORD 'app_password';`,
        target: '/docker-entrypoint-initdb.d/0001_init.sql'
      }
    ])
    .withStartupTimeout(60_000)
    .start()
}

export default async function setup({ provide }: { provide: ProvideFunction }) {
  const userMgntMongoD = await MongoMemoryServer.create()
  const es = await setupElasticSearchServer()
  const psql = await setupPostgresServer()

  const userMgntURI = userMgntMongoD.getUri()

  provide('ELASTICSEARCH_URI', `${es.getHost()}:${es.getMappedPort(9200)}`)
  provide('USER_MGNT_MONGO_URI', userMgntURI)
  provide('POSTGRES_URI', `${psql.getHost()}:${psql.getMappedPort(5432)}`)

  console.log(psql.getConnectionUri())

  return async () => {
    await es.stop()
    await userMgntMongoD.stop()
    await psql.stop()
  }
}
