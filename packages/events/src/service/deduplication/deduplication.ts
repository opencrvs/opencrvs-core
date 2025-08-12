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
import { get } from 'lodash'
import {
  EventIndex,
  DeduplicationConfig,
  Clause,
  ClauseOutput,
  FieldValue,
  EventConfig,
  getDeclarationFieldById,
  DatetimeValue
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
  queryInput: ClauseOutput,
  eventConfig: EventConfig
): elasticsearch.estypes.QueryDslQueryContainer | null {
  if (queryInput.type === 'and') {
    return {
      bool: {
        must: queryInput.clauses
          .map((clause) => {
            return generateElasticsearchQuery(eventIndex, clause, eventConfig)
          })
          .filter(
            (x): x is elasticsearch.estypes.QueryDslQueryContainer => x !== null
          ),
        should: undefined
      }
    }
  } else if (queryInput.type === 'or') {
    return {
      bool: {
        should: queryInput.clauses
          .map((clause) =>
            generateElasticsearchQuery(eventIndex, clause, eventConfig)
          )
          .filter(
            (x): x is elasticsearch.estypes.QueryDslQueryContainer => x !== null
          )
      }
    }
  }
  const rawFieldId = queryInput.fieldId
  const fieldConfig = getDeclarationFieldById(eventConfig, rawFieldId)
  const valuePath =
    fieldConfig.type === 'NAME' ? `${rawFieldId}.__fullname` : rawFieldId

  const queryKey = declarationReference(encodeFieldId(valuePath))
  const queryValue = get(eventIndex.declaration, valuePath)
  if (!queryValue) {
    return null
  }
  // @TODO: When implementing deduplication revisit this. For now, we just want to use the right types for es.
  const isPrimitiveQueryValue = (
    value: FieldValue
  ): value is string | number | boolean => {
    return (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    )
  }

  switch (queryInput.type) {
    case 'fuzzy': {
      if (!isPrimitiveQueryValue(queryValue)) {
        return null
      }

      return {
        match: {
          [queryKey]: {
            query: queryValue,
            fuzziness: queryInput.options.fuzziness,
            boost: queryInput.options.boost
          }
        }
      }
    }
    case 'strict': {
      if (!isPrimitiveQueryValue(queryValue)) {
        return null
      }

      return {
        match_phrase: {
          [queryKey]: queryValue.toString()
        }
      }
    }
    case 'dateDistance': {
      const dateValue = DatetimeValue.safeParse(queryValue)
      if (!dateValue.success) {
        return null
      }
      return {
        distance_feature: {
          field: queryKey,
          pivot: `${queryInput.options.days}d`,
          origin: new Date(dateValue.data)
        }
      }
    }
  }
}

export async function searchForDuplicates(
  eventIndex: EventIndex,
  configuration: DeduplicationConfig,
  eventConfig: EventConfig
): Promise<{ score: number; event: EventIndex }[]> {
  const esClient = getOrCreateClient()
  const query = Clause.parse(configuration.query)

  const esQuery = generateElasticsearchQuery(
    encodeEventIndex(eventIndex, eventConfig),
    query,
    eventConfig
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
      event: decodeEventIndex(eventConfig, hit._source as EventIndex)
    }))
}
