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

import { getOrCreateClient } from '@events/storage/__mocks__/elasticsearch'
import { getEventIndexName } from '@events/storage/elasticsearch'
import * as elasticsearch from '@elastic/elasticsearch'
import { z } from 'zod'
import {
  EventIndex,
  DeduplicationConfig,
  Clause
} from '@opencrvs/commons/events'
import { subDays, addDays } from 'date-fns'

function generateESQuery(
  eventIndex: EventIndex,
  configuration: z.output<typeof Clause>
): elasticsearch.estypes.QueryDslQueryContainer | null {
  if (configuration.type === 'and') {
    const clauses = configuration.clauses
      .map((clause) => generateESQuery(eventIndex, clause))
      .filter(
        (x): x is elasticsearch.estypes.QueryDslQueryContainer => x !== null
      )
    return {
      bool: {
        must: clauses
      } as elasticsearch.estypes.QueryDslBoolQuery
    }
  }
  if (configuration.type === 'or') {
    return {
      bool: {
        should: configuration.clauses
          .map((clause) => generateESQuery(eventIndex, clause))
          .filter(
            (x): x is elasticsearch.estypes.QueryDslQueryContainer => x !== null
          )
      }
    }
  }
  const truthyFormDataValue = eventIndex.data[configuration.fieldId]
  if (!truthyFormDataValue) {
    return null
  }

  if (configuration.type === 'fuzzy') {
    return {
      match: {
        ['data.' + configuration.fieldId]: {
          query: eventIndex.data[configuration.fieldId],
          fuzziness: configuration.options.fuzziness,
          boost: configuration.options.boost
        }
      }
    }
  }

  if (configuration.type === 'strict') {
    return {
      match_phrase: {
        ['data.' + configuration.fieldId]:
          eventIndex.data[configuration.fieldId] || ''
      }
    }
  }

  if (configuration.type === 'dateRange') {
    return {
      range: {
        ['data.' + configuration.fieldId]: {
          gte: subDays(
            new Date(eventIndex.data[configuration.options.origin]),
            configuration.options.days
          ).toISOString(),
          lte: addDays(
            new Date(eventIndex.data[configuration.options.origin]),
            configuration.options.days
          ).toISOString()
        }
      }
    }
  }

  if (configuration.type === 'dateDistance') {
    return {
      distance_feature: {
        field: 'data.' + configuration.fieldId,
        pivot: `${configuration.options.days}d`,
        origin: eventIndex.data[configuration.options.origin]
      }
    }
  }

  throw new Error(`Unknown clause type`)
}

export async function searchForDuplicates(
  eventIndex: EventIndex,
  configuration: DeduplicationConfig
) {
  const esClient = getOrCreateClient()
  const query = Clause.parse(configuration.query)

  const esQuery = generateESQuery(eventIndex, query)

  if (!esQuery) {
    return []
  }

  const result = await esClient.search<EventIndex>({
    index: getEventIndexName(),
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
      score: hit._score,
      event: hit._source!
    }))
}
