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
import formatISO from 'date-fns/formatISO'
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
  EventDocument,
  getDeclarationFields,
  FieldConfig,
  AgeValue,
  ageToDate
} from '@opencrvs/commons/events'
import { logger } from '@opencrvs/commons'
import {
  getOrCreateClient,
  getEventIndexName
} from '@events/storage/elasticsearch'
import {
  ageQueryKey,
  declarationReference,
  decodeEventIndex,
  decodeFieldId,
  EncodedEventIndex,
  encodeEventIndex,
  encodeFieldId,
  nameQueryKey
} from '@events/service/indexing/utils'
import { TrpcContext } from '../../context'
import { getEventsAuditTrailed } from '../../storage/postgres/events/events'

/**
 * If the value referenced in a query is missing, the query resolves to null
 * The `and` query resolves to null if any of the sub-queries is null,
 * while the `or` query resolves to null if all of the sub-queries are null
 */

export function generateElasticsearchQuery(
  eventIndex: EncodedEventIndex,
  queryInput: ClauseOutput,
  eventConfig: EventConfig
): elasticsearch.estypes.QueryDslQueryContainer | null {
  if (queryInput.type === 'not') {
    const resolvedQuery = generateElasticsearchQuery(
      eventIndex,
      queryInput.clause,
      eventConfig
    )
    if (resolvedQuery === null) {
      return null
    }
    return {
      bool: {
        must_not: resolvedQuery,
        should: undefined
      }
    }
  }
  if (queryInput.type === 'and') {
    const resolvedQueries = queryInput.clauses.map((clause) => {
      return generateElasticsearchQuery(eventIndex, clause, eventConfig)
    })

    if (resolvedQueries.some((q) => q === null)) {
      return null
    }

    return {
      bool: {
        must: resolvedQueries.filter(
          (x): x is elasticsearch.estypes.QueryDslQueryContainer => x !== null
        ),
        should: undefined
      }
    }
  } else if (queryInput.type === 'or') {
    const resolvedQueries = queryInput.clauses.map((clause) => {
      return generateElasticsearchQuery(eventIndex, clause, eventConfig)
    })

    if (resolvedQueries.every((q) => q === null)) {
      return null
    }

    return {
      bool: {
        should: resolvedQueries.filter(
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
          [queryKey]: queryInput.options.value ?? queryValue.toString()
        }
      }
    }
    case 'dateRange': {
      let dateValue: string = ''
      const _dateValue = DateValue.safeParse(queryValue)
      const ageValue = AgeValue.safeParse(queryValue)
      if (_dateValue.success) {
        dateValue = _dateValue.data
      } else if (ageValue.success) {
        const ageFieldConfig = getDeclarationFields(eventConfig).find(
          (x) => x.id === decodeFieldId(queryKey.split('.')[1])
        )

        if (ageFieldConfig && ageFieldConfig.type === FieldType.AGE) {
          const asOfDateValue = DateValue.safeParse(
            eventIndex.declaration[
              encodeFieldId(ageFieldConfig.configuration.asOfDate.$$field)
            ]
          )
          dateValue = ageToDate(
            ageValue.data.age,
            asOfDateValue.success
              ? asOfDateValue.data
              : formatISO(new Date(), { representation: 'date' })
          )
        }
      }

      if (!_dateValue.success && !ageValue.success && !dateValue) {
        logger.warn(
          queryValue,
          `Invalid query value for dateRange matching ${rawFieldId}`
        )
        return null
      }

      const pivot =
        queryInput.options.pivot ??
        Math.floor((queryInput.options.days * 2) / 3)

      const fieldsToMatch = []

      if (Array.isArray(queryInput.options.matchAgainst)) {
        const fields = getDeclarationFields(eventConfig)
        const additionalFields = queryInput.options.matchAgainst
          .map((x) => fields.find((f) => f.id === x.$$field))
          .filter((field): field is FieldConfig => {
            if (!field) {
              return false
            }
            return field.type === FieldType.DATE || field.type === FieldType.AGE
          })
          .map((field) => {
            // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
            switch (field.type) {
              case FieldType.AGE:
                return declarationReference(
                  ageQueryKey(encodeFieldId(field.id))
                )
              default:
                return declarationReference(encodeFieldId(field.id))
            }
          })

        fieldsToMatch.push(...additionalFields)
      } else {
        // default query key if matchAgainst option not provided
        fieldsToMatch.push(queryKey)
      }

      // Helper to build query for a single field
      const buildFieldQuery = (fieldKey: string, date: string) => ({
        range: {
          [fieldKey]: {
            gte: DateTime.fromISO(date)
              .minus({ days: queryInput.options.days })
              .toISO(),
            lte: DateTime.fromISO(date)
              .plus({ days: queryInput.options.days })
              .toISO()
          }
        }
      })

      const buildDistanceFeature = (fieldKey: string) => ({
        distance_feature: {
          field: fieldKey,
          pivot: `${pivot}d`,
          origin: dateValue
        }
      })

      return {
        bool: {
          must: [
            {
              bool: {
                should: fieldsToMatch.map((f) => buildFieldQuery(f, dateValue)),
                minimum_should_match: 1
              }
            }
          ],
          should: fieldsToMatch.map(buildDistanceFeature)
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
