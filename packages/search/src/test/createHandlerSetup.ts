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

import { createServer } from '@search/server'
import * as esClient from '@search/elasticsearch/client'
import * as elasticsearch from '@elastic/elasticsearch'
import {
  ElasticsearchContainer,
  StartedElasticsearchContainer
} from 'testcontainers'
import { Server } from '@hapi/hapi'

const ELASTIC_SEARCH_HTTP_PORT = 9200

export type SetupFn = () => Promise<{
  server: {
    server: Server
    start: () => Promise<void>
    stop: () => Promise<void>
  }
  elasticClient: elasticsearch.Client
}>

/**
 * Creates a setup for testing search handlers with elasticsearch
 *
 * @returns helpers for setting up, cleaning up and shutting down the test environment
 */
export const createHandlerSetup = () => {
  let elasticContainer: StartedElasticsearchContainer
  let elasticClient: elasticsearch.Client

  const getOrCreateContainer = () => {
    if (elasticContainer) {
      return elasticContainer
    }

    // eslint-disable-next-line no-console
    console.log('Building elastic container...')

    return new ElasticsearchContainer('elasticsearch:8.16.4')
      .withExposedPorts(ELASTIC_SEARCH_HTTP_PORT)
      .withStartupTimeout(120_000)
      .withEnvironment({
        'discovery.type': 'single-node',
        'xpack.security.enabled': 'false'
      })
      .start()
  }

  const setup = async () => {
    const server = await createServer()

    elasticContainer = await getOrCreateContainer()

    const esHost = elasticContainer.getHost()
    const esPort = elasticContainer.getMappedPort(ELASTIC_SEARCH_HTTP_PORT)

    elasticClient = new elasticsearch.Client({
      node: `http://${esHost}:${esPort}`
    })

    jest.spyOn(esClient, 'getOrCreateClient').mockReturnValue(elasticClient)

    return {
      server,
      elasticClient
    }
  }

  const cleanup = async () => {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cannot clear all indices in production')
    }

    const allIndices = await elasticClient.cat.indices({
      format: 'json'
    })

    for (const { index } of allIndices) {
      if (index) {
        await elasticClient.indices.delete({
          index: index
        })
      }
    }
  }

  const shutdown = async () => {
    jest.clearAllMocks()
    try {
      await elasticClient.close()
    } catch (error) {
    } finally {
      if (elasticContainer) {
        await elasticContainer.stop()
      }
    }
  }

  return {
    setup,
    cleanup,
    shutdown
  }
}
