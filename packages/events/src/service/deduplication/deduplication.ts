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
  getOrCreateClient,
  getEventIndexName
} from '@events/storage/elasticsearch'
import * as elasticsearch from '@elastic/elasticsearch'

import {
  EventIndex,
  DeduplicationConfig,
  Clause,
  ClauseOutput
} from '@opencrvs/commons/events'
import { subDays, addDays } from 'date-fns'
import {
  decodeEventIndex,
  EncodedEventIndex,
  encodeEventIndex,
  encodeFieldId
} from '@events/service/indexing/indexing'

function dataReference(fieldName: string) {
  return `data.${fieldName}`
}

function generateElasticsearchQuery(
  eventIndex: EncodedEventIndex,
  configuration: ClauseOutput
): elasticsearch.estypes.QueryDslQueryContainer | null {
  const matcherFieldWithoutData =
    configuration.type !== 'and' &&
    configuration.type !== 'or' &&
    !eventIndex.data[encodeFieldId(configuration.fieldId)]

  if (matcherFieldWithoutData) {
    return null
  }

  switch (configuration.type) {
    case 'and':
      const clauses = configuration.clauses
        .map((clause) => {
          return generateElasticsearchQuery(eventIndex, clause)
        })
        .filter(
          (x): x is elasticsearch.estypes.QueryDslQueryContainer => x !== null
        )

      return {
        bool: {
          must: clauses
        } as elasticsearch.estypes.QueryDslBoolQuery
      }
    case 'or':
      return {
        bool: {
          should: configuration.clauses
            .map((clause) => generateElasticsearchQuery(eventIndex, clause))
            .filter(
              (x): x is elasticsearch.estypes.QueryDslQueryContainer =>
                x !== null
            )
        }
      }
    case 'fuzzy': {
      const encodedFieldId = encodeFieldId(configuration.fieldId)
      return {
        match: {
          ['data.' + encodedFieldId]: {
            query: eventIndex.data[encodedFieldId],
            fuzziness: configuration.options.fuzziness,
            boost: configuration.options.boost
          }
        }
      }
    }
    case 'strict': {
      const encodedFieldId = encodeFieldId(configuration.fieldId)
      return {
        match_phrase: {
          [dataReference(encodedFieldId)]: eventIndex.data[encodedFieldId] || ''
        }
      }
    }
    case 'dateRange': {
      const encodedFieldId = encodeFieldId(configuration.fieldId)
      const origin = encodeFieldId(configuration.options.origin)
      return {
        range: {
          [dataReference(encodedFieldId)]: {
            // @TODO: Improve types for origin field to be sure it returns a string when accessing data
            gte: subDays(
              new Date(eventIndex.data[origin] as string),
              configuration.options.days
            ).toISOString(),
            lte: addDays(
              new Date(eventIndex.data[origin] as string),
              configuration.options.days
            ).toISOString()
          }
        }
      }
    }
    case 'dateDistance': {
      const encodedFieldId = encodeFieldId(configuration.fieldId)
      const origin = encodeFieldId(configuration.options.origin)
      return {
        distance_feature: {
          field: dataReference(encodedFieldId),
          pivot: `${configuration.options.days}d`,
          origin: eventIndex.data[origin]
        }
      }
    }
  }
}

export async function searchForDuplicates(
  eventIndex: EventIndex,
  configuration: DeduplicationConfig
): Promise<{ score: number; event: EventIndex | undefined }[]> {
  const esClient = getOrCreateClient()
  const query = Clause.parse(configuration.query)

  const esQuery = generateElasticsearchQuery(
    encodeEventIndex(eventIndex),
    query
  )

  if (!esQuery) {
    return []
  }

  const result = await esClient.search<EncodedEventIndex>({
    index: getEventIndexName(eventIndex.type),
    query: {
      bool: {
        should: [esQuery],
        must_not: [{ term: { id: eventIndex.id } }]
      }
    }
  })

  return result.hits.hits
    .filter((hit) => hit._source)
    .map((hit) => ({
      score: hit._score || 0,
      event: hit._source && decodeEventIndex(hit._source)
    }))
}
