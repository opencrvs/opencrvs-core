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
import fs from 'node:fs'
import { ElasticsearchContainer } from '@testcontainers/elasticsearch'
import { PostgreSqlContainer } from '@testcontainers/postgresql'
import { MongoMemoryServer } from 'mongodb-memory-server'
import type { ProvidedContext } from 'vitest'
import { Pool } from 'pg'

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

export async function setupPostgresServer() {
  const psql = await new PostgreSqlContainer('postgres:17')
    .withExposedPorts(5432)
    .withStartupTimeout(60_000)
    .withCopyFilesToContainer([
      {
        source: path.resolve(__dirname, './0001_init.sql'),
        target: '/docker-entrypoint-initdb.d/0001_init.sql'
      }
    ])
    .start()

  return {
    psql,
    eventsAppUri: `postgres://events_app:app_password@${psql.getHost()}:${psql.getMappedPort(5432)}/events`,
    eventsMigratorUri: `postgres://events_migrator:migrator_password@${psql.getHost()}:${psql.getMappedPort(5432)}/events`
  }
}

export default async function setup({ provide }: { provide: ProvideFunction }) {
  const eventsMongoD = await MongoMemoryServer.create()
  const userMgntMongoD = await MongoMemoryServer.create()
  const es = await setupElasticSearchServer()
  const { psql, eventsAppUri, eventsMigratorUri } = await setupPostgresServer()

  const eventsURI = eventsMongoD.getUri()
  const userMgntURI = userMgntMongoD.getUri()

  provide('ELASTICSEARCH_URI', `${es.getHost()}:${es.getMappedPort(9200)}`)
  provide('EVENTS_MONGO_URI', eventsURI)
  provide('USER_MGNT_MONGO_URI', userMgntURI)
  provide('EVENTS_APP_POSTGRES_URI', eventsAppUri)
  provide('EVENTS_MIGRATOR_POSTGRES_URI', eventsMigratorUri)

  return async () => {
    await es.stop()
    await eventsMongoD.stop()
    await userMgntMongoD.stop()
    await psql.stop()
  }
}
