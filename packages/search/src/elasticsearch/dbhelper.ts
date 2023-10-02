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
import { ISearchResponse } from '@search/elasticsearch/client'
import { ICompositionBody } from '@search/elasticsearch/utils'
import { logger } from '@search/logger'
import * as elasticsearch from '@elastic/elasticsearch'

export const indexComposition = async (
  compositionIdentifier: string,
  body: ICompositionBody,
  client: elasticsearch.Client
) => {
  let response: any
  try {
    response = await client.index({
      index: OPENCRVS_INDEX_NAME,
      type: 'compositions',
      id: compositionIdentifier,
      body,
      refresh: 'wait_for' // makes the call wait until the change is available via search
    })
  } catch (e) {
    logger.error(`indexComposition: error: ${e}`)
  }
  return response
}

export const updateComposition = async (
  id: string,
  body: ICompositionBody,
  client: elasticsearch.Client
) => {
  let response: any
  try {
    response = await client.update({
      index: OPENCRVS_INDEX_NAME,
      type: 'compositions',
      id,
      body: {
        doc: body
      },
      refresh: 'wait_for' // makes the call wait until the change is available via search
    })
  } catch (e) {
    logger.error(`updateComposition: error: ${e}`)
  }

  return response
}

export const searchByCompositionId = async (
  compositionId: string,
  client: elasticsearch.Client
) => {
  try {
    return await client.search<ISearchResponse<any>>({
      index: OPENCRVS_INDEX_NAME,
      type: 'compositions',
      body: {
        query: {
          match: {
            _id: compositionId
          }
        }
      }
    })
  } catch (err) {
    logger.error(`searchByCompositionId: error: ${err}`)
    return null
  }
}
