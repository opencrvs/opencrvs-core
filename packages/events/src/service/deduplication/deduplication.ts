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

import { DateTime } from 'luxon'
import {
  EventIndex,
  DeduplicationConfig,
  Clause,
  ClauseOutput,
  FieldValue,
  EventConfig
} from '@opencrvs/commons/events'
import {
  getOrCreateClient,
  getEventIndexName
} from '@events/storage/elasticsearch'
import {
  declarationReference,
  decodeEventIndex,
  EncodedEventIndex,
  encodeEventIndex,
  encodeFieldId
} from '@events/service/indexing/utils'

function generateElasticsearchQuery(
  eventIndex: EncodedEventIndex,
  configuration: ClauseOutput
): elasticsearch.estypes.QueryDslQueryContainer | null {
  // @TODO: When implementing deduplication revisit this. For now, we just want to use the right types for es.
  const isPrimitiveQueryValue = (
    value: FieldValue
  ): value is string | number => {
    return (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    )
  }

  const matcherFieldWithoutData =
    configuration.type !== 'and' &&
    configuration.type !== 'or' &&
    !eventIndex.declaration[encodeFieldId(configuration.fieldId)]

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

      const fieldValue = eventIndex.declaration[encodedFieldId]
      if (!isPrimitiveQueryValue(fieldValue)) {
        return null
      }

      return {
        match: {
          [declarationReference(encodedFieldId)]: {
            query: fieldValue,
            fuzziness: configuration.options.fuzziness,
            boost: configuration.options.boost
          }
        }
      }
    }
    case 'strict': {
      const encodedFieldId = encodeFieldId(configuration.fieldId)
      const fieldValue = eventIndex.declaration[encodedFieldId]
      if (!isPrimitiveQueryValue(fieldValue)) {
        return null
      }

      return {
        match_phrase: {
          [declarationReference(encodedFieldId)]: fieldValue.toString()
        }
      }
    }
    case 'dateRange': {
      const encodedFieldId = encodeFieldId(configuration.fieldId)
      const origin = encodeFieldId(configuration.options.origin)
      return {
        range: {
          [declarationReference(encodedFieldId)]: {
            // @TODO: Improve types for origin field to be sure it returns a string when accessing data
            gte: DateTime.fromJSDate(
              new Date(eventIndex.declaration[origin] as string)
            )
              .minus({ days: configuration.options.days })
              .toISO(),
            lte: DateTime.fromJSDate(
              new Date(eventIndex.declaration[origin] as string)
            )
              .plus({ days: configuration.options.days })
              .toISO()
          }
        }
      }
    }
    case 'dateDistance': {
      const encodedFieldId = encodeFieldId(configuration.fieldId)
      const origin = encodeFieldId(configuration.options.origin)
      return {
        distance_feature: {
          field: declarationReference(encodedFieldId),
          pivot: `${configuration.options.days}d`,
          origin: eventIndex.declaration[origin]
        }
      }
    }
  }
}

export async function searchForDuplicates(
  eventIndex: EventIndex,
  configuration: DeduplicationConfig,
  eventConfig: EventConfig
): Promise<{ score: number; event: EventIndex | undefined }[]> {
  const esClient = getOrCreateClient()
  const query = Clause.parse(configuration.query)

  const esQuery = generateElasticsearchQuery(
    encodeEventIndex(eventIndex, eventConfig),
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
      event: hit._source && decodeEventIndex(eventConfig, hit._source)
    }))
}
