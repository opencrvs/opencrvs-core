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

/** Prunes all the indices that don't have an alias pointing to it */
export const prune = async () => {
  const { body: indicesWithAlias } = await client.cat.aliases(
    {
      format: 'json',
      name: OPENCRVS_INDEX_NAME
    },
    {
      meta: true
    }
  )
  const { body: allIndices } = await client.cat.indices(
    {
      format: 'json',
      index: `${OPENCRVS_INDEX_NAME}-*`
    },
    {
      meta: true
    }
  )

  for (const { index } of allIndices) {
    const isAliasPointedToIndex = indicesWithAlias.some(
      ({ index: aliasIndex }) => aliasIndex === index
    )

    if (!isAliasPointedToIndex && !!index) {
      logger.info(`Deleting index: ${index}`)
      await client.indices.delete({ index }, { meta: true })
    }
  }
}
