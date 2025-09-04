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
import { DateTime } from 'luxon'
import {
  EventIndex,
  DeduplicationConfig,
  ClauseOutput,
  FieldValue,
  EventConfig,
  getDeclarationFieldById,
  DateValue,
  FieldType,
  extractPotentialDuplicatesFromActions,
  EventDocument
} from '@opencrvs/commons/events'
import { logger } from '@opencrvs/commons'
import {
  getOrCreateClient,
  getEventIndexName
} from '@events/storage/elasticsearch'
import {
  declarationReference,
  decodeEventIndex,
  EncodedEventIndex,
  encodeEventIndex,
  encodeFieldId,
  nameQueryKey
} from '@events/service/indexing/utils'
import { TrpcContext } from '../../context'
import { getEventsAuditTrailed } from '../../storage/postgres/events/events'

export function generateElasticsearchQuery(
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
  const encodedFieldId = encodeFieldId(rawFieldId)
  const valuePath =
    fieldConfig.type === FieldType.NAME
      ? nameQueryKey(encodedFieldId)
      : encodedFieldId

  const queryKey = declarationReference(valuePath)
  const queryValue = get(eventIndex.declaration, valuePath)
  if (!queryValue) {
    logger.warn(
      `No value found for field ${rawFieldId} in the current event. Skipping query clause.`
    )
    return null
  }
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
        logger.warn(
          queryValue,
          `Invalid query value found for fuzzy matching ${rawFieldId}. Expected string, number or boolean`
        )
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
        logger.warn(
          queryValue,
          `Invalid query value for found for strict matching ${rawFieldId}. Expected string, number or boolean`
        )
        return null
      }

      return {
        match_phrase: {
          [queryKey]: queryValue.toString()
        }
      }
    }
    case 'dateRange': {
      const dateValue = DateValue.safeParse(queryValue)
      if (!dateValue.success) {
        logger.warn(
          queryValue,
          `Invalid query value for found for dateRange matching ${rawFieldId}. Expected date in YYYY-MM-DD format`
        )
        return null
      }
      const pivot =
        queryInput.options.pivot ??
        Math.floor((queryInput.options.days * 2) / 3)
      return {
        bool: {
          must: [
            {
              range: {
                [queryKey]: {
                  gte: DateTime.fromISO(dateValue.data)
                    .minus({ days: queryInput.options.days })
                    .toISO(),
                  lte: DateTime.fromISO(dateValue.data)
                    .plus({ days: queryInput.options.days })
                    .toISO()
                }
              }
            }
          ],
          should: [
            {
              distance_feature: {
                field: queryKey,
                pivot: `${pivot}d`,
                origin: dateValue.data
              }
            }
          ]
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
  const query = configuration.query

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

  return result.hits.hits.flatMap((hit) => {
    if (!hit._source) {
      return []
    }
    return {
      score: hit._score || 0,
      event: decodeEventIndex(eventConfig, hit._source)
    }
  })
}

/**
 * Given event, returns all the events that have been marked as duplicate.
 */
export async function getDuplicateEvents(
  event: EventDocument,
  ctx: TrpcContext
) {
  const duplicates = extractPotentialDuplicatesFromActions(event.actions)

  if (duplicates.length === 0) {
    return []
  }

  const duplicateEventIds = duplicates.map(({ id }) => id)

  return getEventsAuditTrailed(ctx.user, duplicateEventIds)
}
