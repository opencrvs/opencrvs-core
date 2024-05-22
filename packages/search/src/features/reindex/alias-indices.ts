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
import { migrate } from '@search/features/reindex/reindex'
import { orderBy } from 'lodash'

export async function updateAliases() {
  /*
   * if alias called ${OPENCRVS_INDEX_NAME} doesn't exist, migrate the index for an timestamped alias to point into it
   */
  const doesOcrvsAliasExist = await client.indices.existsAlias({
    name: OPENCRVS_INDEX_NAME
  })
  if (!doesOcrvsAliasExist) {
    await migrate()
  }

  /*
   * find the latest index and set alias ${OPENCRVS_INDEX_NAME} to point to that
   */
  const { body: indices } = await client.cat.indices<Array<{ index: string }>>({
    format: 'json',
    index: 'ocrvs-*'
  })

  const sortedIndices = orderBy(indices, 'index')
  const { index: latestIndex } = sortedIndices.at(-1)!

  await client.indices.updateAliases({
    body: {
      actions: [
        { remove: { alias: OPENCRVS_INDEX_NAME, index: 'ocrvs-*' } },
        { add: { alias: OPENCRVS_INDEX_NAME, index: latestIndex } }
      ]
    }
  })
}
