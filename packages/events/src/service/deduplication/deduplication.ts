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

function dataReference(fieldName: string) {
  return `data.${fieldName}`
}

function generateElasticsearchQuery(
  eventIndex: EventIndex,
  configuration: ClauseOutput
): elasticsearch.estypes.QueryDslQueryContainer | null {
  const matcherFieldWithoutData =
    configuration.type !== 'and' &&
    configuration.type !== 'or' &&
    eventIndex.data[configuration.fieldId]

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
    case 'fuzzy':
      return {
        match: {
          ['data.' + configuration.fieldId]: {
            query: eventIndex.data[configuration.fieldId],
            fuzziness: configuration.options.fuzziness,
            boost: configuration.options.boost
          }
        }
      }
    case 'strict':
      return {
        match_phrase: {
          [dataReference(configuration.fieldId)]:
            eventIndex.data[configuration.fieldId] || ''
        }
      }
    case 'dateRange':
      return {
        range: {
          [dataReference(configuration.fieldId)]: {
            // @TODO: Improve types for origin field to be sure it returns a string when accessing data
            gte: subDays(
              new Date(eventIndex.data[configuration.options.origin] as string),
              configuration.options.days
            ).toISOString(),
            lte: addDays(
              new Date(eventIndex.data[configuration.options.origin] as string),
              configuration.options.days
            ).toISOString()
          }
        }
      }
    case 'dateDistance':
      return {
        distance_feature: {
          field: dataReference(configuration.fieldId),
          pivot: `${configuration.options.days}d`,
          origin: eventIndex.data[configuration.options.origin]
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

  const esQuery = generateElasticsearchQuery(eventIndex, query)

  if (!esQuery) {
    return []
  }

  const result = await esClient.search<EventIndex>({
    index: getEventIndexName('TENNIS_CLUB_MEMBERSHIP'),
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
      event: hit._source
    }))
}
