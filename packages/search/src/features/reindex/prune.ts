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
import { OPENCRVS_INDEX_NAME } from '@search/constants'
import { client } from '@search/elasticsearch/client'
import { logger } from '@opencrvs/commons'
import { orderBy } from 'lodash'

/** Prunes all the indices except the latest one */
export const prune = async () => {
  const { body: indices } = await client.cat.indices<
    Array<{ index: `${typeof OPENCRVS_INDEX_NAME}-${string}` }>
  >({
    format: 'json',
    index: `${OPENCRVS_INDEX_NAME}-*`
  })

  // ignores the first index and returns the older ones
  const [, ...oldIndices] = orderBy(indices, 'index', 'desc')

  for (const { index } of oldIndices) {
    logger.info(`Deleting index: ${index}`)
    await client.indices.delete({ index })
  }
}
