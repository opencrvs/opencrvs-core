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
import { logger } from '@search/logger'
import { isBefore, parse, subMonths } from 'date-fns'

export const prune = async ({ before = subMonths(new Date(), 3) } = {}) => {
  const { body: indices } = await client.cat.indices<Array<{ index: string }>>({
    format: 'json',
    index: `${OPENCRVS_INDEX_NAME}-*`
  })

  for (const index of indices) {
    const indexName = index.index
    const timestampStr = indexName.split('-')[1] // Extract the timestamp part
    const timestamp = parse(timestampStr, 'yyyyMMddHHmmss', new Date())

    if (isBefore(timestamp, before)) {
      logger.info(`Deleting index: ${indexName}`)
      await client.indices.delete({ index: indexName })
    }
  }
}
