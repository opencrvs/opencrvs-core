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

import * as elasticsearch from '@elastic/elasticsearch'

const ES_HOST = process.env.ES_HOST || 'localhost:9200'
const ELASTICSEARCH_INDEX_NAME = 'ocrvs'

export const client = new elasticsearch.Client({
  node: `http://${ES_HOST}`
})

export const updateComposition = async (id, body) => {
  let response
  try {
    response = await client.update({
      index: ELASTICSEARCH_INDEX_NAME,
      type: 'compositions',
      id,
      body: {
        doc: body
      }
    })
  } catch (e) {
    console.error(`updateComposition: error: ${e}`)
  }

  return response
}

export const updateFieldNameByCompositionId = async (
  newFieldName,
  oldFieldName
) => {
  try {
    const response = await client.updateByQuery({
      index: ELASTICSEARCH_INDEX_NAME,
      type: 'compositions',
      body: {
        query: {
          bool: {
            must_not: {
              exists: {
                field: newFieldName
              }
            }
          }
        },
        script: {
          inline: `ctx._source.${newFieldName} = ctx._source.${oldFieldName}; ctx._source.remove("${oldFieldName}");`
        }
      }
    })
    return response
  } catch (err) {
    console.error(`searchByCompositionId: error: ${err}`)
    return null
  }
}
