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

import fs from 'node:fs'
import { ElasticsearchContainer } from '@testcontainers/elasticsearch'
import { PostgreSqlContainer } from '@testcontainers/postgresql'
import { Client } from 'pg'
import type { ProvidedContext } from 'vitest'
import {
  copyMigrations,
  createDatabase,
  initializeSchemaAccess,
  runMigrations,
  TEMPLATE_DATABASE
} from './postgres'

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
  return new PostgreSqlContainer('postgres:17.6')
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

async function createTemplateDatabase(postgresUri: string) {
  const getClient = (database: string) =>
    new Client({
      connectionString: `postgres://postgres:postgres@${postgresUri}/${database}`
    })

  const cluster = getClient('postgres')
  await cluster.connect()
  await createDatabase(cluster, TEMPLATE_DATABASE)
  await cluster.end()

  const template = getClient(TEMPLATE_DATABASE)
  await template.connect()
  await initializeSchemaAccess(template)

  const migrations = copyMigrations()
  try {
    await runMigrations(postgresUri, TEMPLATE_DATABASE, migrations.dir, 'up')
  } finally {
    fs.rmSync(migrations.root, { recursive: true, force: true })
  }

  // A migration seeds this row on an empty database. Tests that need it
  // insert their own.
  await template.query('TRUNCATE app.system_initialisation')
  await template.end()
}

export default async function setup({ provide }: { provide: ProvideFunction }) {
  const es = await setupElasticSearchServer()
  const psql = await setupPostgresServer()

  const postgresUri = `${psql.getHost()}:${psql.getMappedPort(5432)}`
  await createTemplateDatabase(postgresUri)

  provide('ELASTICSEARCH_URI', `${es.getHost()}:${es.getMappedPort(9200)}`)
  provide('POSTGRES_URI', postgresUri)

  return async () => {
    await es.stop()

    await psql.stop()
  }
}
