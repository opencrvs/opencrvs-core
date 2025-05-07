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

// @TODO: Unify this file with @search/src/elasticsearch/dbhelper.ts
import { Client } from '@elastic/elasticsearch'
import { SearchDocument } from '@opencrvs/commons/types'

const ES_HOST = process.env.ES_HOST || 'localhost:9200'
const ELASTICSEARCH_INDEX_NAME = process.env.ELASTICSEARCH_INDEX_NAME || 'ocrvs'

export const client = new Client({
  node: `http://${ES_HOST}`
})

export const updateComposition = async (
  id: string,
  body: any,
  extraConfigs?: Record<string, any>
) => {
  try {
    return await client.update(
      {
        index: ELASTICSEARCH_INDEX_NAME,
        id,
        body: {
          doc: body
        },
        ...extraConfigs
      },
      {
        meta: true
      }
    )
  } catch (e) {
    console.error(`updateComposition: error: ${e}`)
    return
  }
}

export const renameField = async (
  oldFieldName: string,
  newFieldName: string
) => {
  try {
    const response = await client.updateByQuery(
      {
        index: ELASTICSEARCH_INDEX_NAME,
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
          script: `ctx._source.${newFieldName} = ctx._source.${oldFieldName}; ctx._source.remove("${oldFieldName}");`
        }
      },
      { meta: true }
    )
    return response
  } catch (err) {
    console.error(`searchByCompositionId: error: ${err}`)
    return null
  }
}

export const searchByCompositionId = async (compositionId: string) => {
  try {
    return await client.search<SearchDocument>(
      {
        index: ELASTICSEARCH_INDEX_NAME,
        body: {
          query: {
            match: {
              _id: compositionId
            }
          }
        }
      },
      {
        meta: true
      }
    )
  } catch (err) {
    console.error(`searchByCompositionId: error: ${err}`)
    return null
  }
}

export const searchCompositionByCriteria = async (
  criteriaObject: Record<string, any>,
  extraConfigs?: Record<string, any>
) => {
  try {
    return await client.search<SearchDocument>(
      {
        index: ELASTICSEARCH_INDEX_NAME,
        body: {
          query: criteriaObject,
          ...extraConfigs
        }
      },
      {
        meta: true
      }
    )
  } catch (err) {
    console.error(`searchCompositionByCriteria: error: ${err}`)
    return null
  }
}
