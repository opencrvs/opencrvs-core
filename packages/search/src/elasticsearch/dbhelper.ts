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
import { OPENCRVS_INDEX_NAME } from '@search/constants'
import { client, ISearchResponse } from '@search/elasticsearch/client'
import { buildQuery, ICompositionBody } from '@search/elasticsearch/utils'
import { logger } from '@search/logger'

export const indexComposition = async (
  compositionIdentifier: string,
  body: ICompositionBody
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

export const updateComposition = async (id: string, body: ICompositionBody) => {
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

export const searchComposition = async (body: ICompositionBody) => {
  try {
    const response = client.search<ISearchResponse<any>>({
      index: OPENCRVS_INDEX_NAME,
      type: 'compositions',
      body: {
        query: buildQuery(body)
      }
    })
    return response
  } catch (err) {
    logger.error(`searchComposition: error: ${err}`)
    return null
  }
}

export const searchByCompositionId = async (compositionId: string) => {
  try {
    const response = await client.search<ISearchResponse<any>>({
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
    return response
  } catch (err) {
    logger.error(`searchByCompositionId: error: ${err}`)
    return null
  }
}
