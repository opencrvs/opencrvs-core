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
} from 'testcontainers'
import { indexComposition } from '@search/elasticsearch/dbhelper'
import {
  IBirthCompositionBody,
  IDeathCompositionBody
} from '@search/elasticsearch/utils'
import * as elasticsearch from '@elastic/elasticsearch'
import { searchForDeathDuplicates, searchForBirthDuplicates } from './service'

export const ELASTIC_SEARCH_HTTP_PORT = 9200

const container: ElasticsearchContainer = new ElasticsearchContainer(
  'elasticsearch:7.17.7'
)

export const startContainer =
  async (): Promise<StartedElasticsearchContainer> => {
    return container
      .withExposedPorts(ELASTIC_SEARCH_HTTP_PORT)
      .withStartupTimeout(120_000)
      .withEnvironment({ 'discovery.type': 'single-node' })
      .start()
  }

export const stopContainer = async (
  container: StartedElasticsearchContainer
): Promise<void> => {
  await container.stop()
}

type ComparisonObject<T> = {
  [Key in keyof T]: [T[Key], T[Key]]
}
type Values<T> = T[keyof T]

export async function compareForBirthDuplication(
  registrationComparison: ComparisonObject<IBirthCompositionBody>,
  client: elasticsearch.Client
) {
  const existingComposition = Object.fromEntries(
    Object.entries<Values<IBirthCompositionBody>[]>(registrationComparison).map(
      ([key, values]) => [key, values[0]]
    )
  )
  const newComposition = Object.fromEntries(
    Object.entries<Values<IBirthCompositionBody>[]>(registrationComparison).map(
      ([key, values]) => [key, values[1]]
    )
  )

  await indexComposition('123-123-123-123', existingComposition, client)
  const results = await searchForBirthDuplicates(newComposition, client)
  return results
}

export async function compareForDeathDuplication(
  registrationComparison: ComparisonObject<IDeathCompositionBody>,
  client: elasticsearch.Client
) {
  const existingComposition = Object.fromEntries(
    Object.entries<Values<IDeathCompositionBody>[]>(registrationComparison).map(
      ([key, values]) => [key, values[0]]
    )
  )
  const newComposition = Object.fromEntries(
    Object.entries<Values<IDeathCompositionBody>[]>(registrationComparison).map(
      ([key, values]) => [key, values[1]]
    )
  )

  await indexComposition('123-123-123-123', existingComposition, client)
  const results = await searchForDeathDuplicates(newComposition, client)
  return results
}
