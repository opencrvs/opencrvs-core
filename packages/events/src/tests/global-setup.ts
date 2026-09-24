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
import { PostgreSqlContainer } from '@testcontainers/postgresql'
import { Client as ElasticsearchClient } from '@elastic/elasticsearch'
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

export default async function setup({ provide }: { provide: ProvideFunction }) {
  const es = await setupElasticSearchServer()
  const psql = await setupPostgresServer()

  const elasticsearchUri = `${es.getHost()}:${es.getMappedPort(9200)}`

  const elasticsearch = new ElasticsearchClient({
    node: `http://${elasticsearchUri}`
  })

  // Cluster settings are global and last for the whole run, so writing them
  // once here saves every test from repeating it.
  await elasticsearch.cluster.putSettings({
    body: { persistent: { 'action.auto_create_index': 'false' } }
  })

  // Writes wait for the next refresh, which defaults to once a second. A short interval removes that wait. Replicas are off because there is only one node.
  await elasticsearch.indices.putIndexTemplate({
    name: 'test-defaults',
    index_patterns: ['*'],
    priority: 1,
    template: {
      settings: {
        refresh_interval: '20ms',
        number_of_replicas: 0
      }
    }
  })

  provide('ELASTICSEARCH_URI', elasticsearchUri)
  provide('POSTGRES_URI', `${psql.getHost()}:${psql.getMappedPort(5432)}`)

  return async () => {
    await es.stop()

    await psql.stop()
  }
}
