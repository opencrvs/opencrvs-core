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
import {
  ElasticsearchContainer,
  StartedElasticsearchContainer
} from 'testcontainers'

export const ELASTIC_SEARCH_HTTP_PORT = 9200

const container: ElasticsearchContainer = new ElasticsearchContainer(
  'elasticsearch:7.17.7'
)

/**
 * @description Function that starts ElasticSearchTestContainer
 * @returns {Promise<void>} Promise<void>
 * **/
export const startContainer =
  async (): Promise<StartedElasticsearchContainer> => {
    return await container
      .withExposedPorts(ELASTIC_SEARCH_HTTP_PORT)
      .withStartupTimeout(120_000)
      .withEnvironment({ 'discovery.type': 'single-node' })
      .start()
  }

/**
 * @description Function that stops ElasticSearchTestContainer
 * @returns {Promise<void>} Promise<void>
 * **/
export const stopContainer = async (
  container: StartedElasticsearchContainer
): Promise<void> => {
  await container.stop()
}
