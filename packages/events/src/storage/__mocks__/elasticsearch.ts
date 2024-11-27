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
import {
  ElasticsearchContainer,
  StartedElasticsearchContainer
} from '@testcontainers/elasticsearch'
import * as elasticsearch from '@elastic/elasticsearch'
let server: StartedElasticsearchContainer

export async function setupServer() {
  server = await new ElasticsearchContainer('elasticsearch:8.14.3')
    .withExposedPorts(9200)
    .withStartupTimeout(120_000)
    .withEnvironment({
      'discovery.type': 'single-node',
      'xpack.security.enabled': 'false',
      'action.destructive_requires_name': 'false'
    })
    .start()
}

export async function resetServer() {
  const host = server.getHost()
  const port = server.getMappedPort(9200)
  return fetch(`http://${host}:${port}/*`, {
    method: 'DELETE'
  })
}

/** @public */
export function getOrCreateClient() {
  const host = server.getHost()
  const port = server.getMappedPort(9200)
  return new elasticsearch.Client({
    node: `http://${host}:${port}`
  })
}
