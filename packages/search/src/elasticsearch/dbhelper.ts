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
import * as elasticsearch from '@elastic/elasticsearch'
import { logger } from '@opencrvs/commons'
import { SearchDocument } from '@opencrvs/commons/types'
import { OPENCRVS_INDEX_NAME } from '@search/constants'

export const indexComposition = async (
  compositionIdentifier: string,
  body: SearchDocument,
  client: elasticsearch.Client
) => {
  try {
    return await client.index(
      {
        index: OPENCRVS_INDEX_NAME,
        id: compositionIdentifier,
        body,
        refresh: 'wait_for' // makes the call wait until the change is available via search
      },
      {
        meta: true
      }
    )
  } catch (e) {
    logger.error(`indexComposition: error: ${e}`)
  }
  return
}

export const updateComposition = async (
  id: string,
  body: SearchDocument,
  client: elasticsearch.Client
) => {
  try {
    return await client.update(
      {
        index: OPENCRVS_INDEX_NAME,
        id,
        body: {
          doc: body
        },
        refresh: 'wait_for' // makes the call wait until the change is available via search
      },
      {
        meta: true
      }
    )
  } catch (e) {
    logger.error(`updateComposition: error: ${e}`)

    return
  }
}

export const searchByCompositionId = async (
  compositionId: string,
  client: elasticsearch.Client
) => {
  try {
    return await client.search<SearchDocument>(
      {
        index: OPENCRVS_INDEX_NAME,
        body: {
          query: {
            match: {
              _id: compositionId
            }
          }
        }
      },
      { meta: true }
    )
  } catch (err) {
    logger.error(`searchByCompositionId: error: ${err}`)
    return null
  }
}
