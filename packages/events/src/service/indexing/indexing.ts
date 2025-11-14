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

import { type estypes } from '@elastic/elasticsearch'
import * as z from 'zod/v4'
import {
  ActionCreationMetadata,
  RegistrationCreationMetadata,
  AgeValue,
  AddressFieldValue,
  EventConfig,
  EventDocument,
  EventIndex,
  EventStatus,
  FieldConfig,
  FieldType,
  getCurrentEventState,
  getDeclarationFields,
  WorkqueueCountInput,
  getEventConfigById,
  SearchScopeAccessLevels,
  SearchQuery,
  DateRangeField,
  SelectDateRangeField
} from '@opencrvs/commons/events'
import { logger } from '@opencrvs/commons'
import {
  getEventAliasName,
  getEventIndexName,
  getOrCreateClient
} from '@events/storage/elasticsearch'
import {
  decodeEventIndex,
  EncodedEventIndex,
  encodeEventIndex,
  encodeFieldId,
  NAME_QUERY_KEY,
  removeSecuredFields
} from './utils'
import {
  buildElasticQueryFromSearchPayload,
  withJurisdictionFilters
} from './query'

// Elasticsearch has a limit of 10,000 results for a query, and
// trying to get beyond that will result in a “Result window is too large“ error
const ELASTICSEARCH_MAXIMUM_QUERY_SIZE = 10000

function eventToEventIndex(
  event: EventDocument,
  config: EventConfig
): EventIndex {
  return encodeEventIndex(getCurrentEventState(event, config), config)
}

/*
 * This type ensures all properties of EventIndex are present in the mapping
 */
type EventIndexMapping = { [key in keyof EventIndex]: estypes.MappingProperty }

async function ensureAlias(indexName: string) {
  const client = getOrCreateClient()
  logger.info(`Ensuring alias for index ${indexName}`)
  const res = await client.indices.putAlias({
    index: indexName,
    name: getEventAliasName()
  })

  logger.info(`Alias ${getEventAliasName()} created for index ${indexName}`)
  logger.info(JSON.stringify(res))

  return res
}

function mapFieldTypeToElasticsearch(
  field: FieldConfig
): estypes.MappingProperty {
  switch (field.type) {
    case FieldType.NUMBER:
      return { type: 'double' }
    case FieldType.DATE:
      return { type: 'date' }
    case FieldType.DATE_RANGE:
    case FieldType.TEXT:
    case FieldType.TEXTAREA:
    case FieldType.PARAGRAPH:
    case FieldType.BULLET_LIST:
    case FieldType.PAGE_HEADER:
    case FieldType.EMAIL:
    case FieldType.TIME:
      return { type: 'text' }
    case FieldType.EMAIL:
      return {
        type: 'keyword',
        normalizer: 'lowercase'
      }
    case FieldType.DIVIDER:
    case FieldType.RADIO_GROUP:
    case FieldType.SELECT:
    case FieldType.COUNTRY:
    case FieldType.CHECKBOX:
    case FieldType.LOCATION:
    case FieldType.ADMINISTRATIVE_AREA:
    case FieldType.FACILITY:
    case FieldType.OFFICE:
    case FieldType.BUTTON:
    case FieldType.ALPHA_PRINT_BUTTON:
    case FieldType.ID:
    case FieldType.PHONE:
    case FieldType.VERIFICATION_STATUS:
      return { type: 'keyword' }
    case FieldType.DATA:
      return { type: 'object' }
    case FieldType.ADDRESS:
      const streetLevelDetails = Object.fromEntries(
        (field.configuration?.streetAddressForm ?? []).map((f) => [
          f.id,
          mapFieldTypeToElasticsearch(f)
        ])
      )
      const addressProperties = {
        country: { type: 'keyword' },
        addressType: { type: 'keyword' },
        administrativeArea: { type: 'keyword' },
        streetLevelDetails: {
          type: 'object',
          properties: streetLevelDetails
        }
      } satisfies {
        [K in keyof Required<AllFieldsUnion>]: estypes.MappingProperty
      }

      return {
        type: 'object',
        properties: addressProperties
      }
    case FieldType.AGE:
      return {
        type: 'object',
        properties: {
          age: { type: 'double' },
          asOfDateRef: { type: 'keyword' }
        } satisfies {
          [K in keyof AgeValue]: estypes.MappingProperty
        }
      }
    case FieldType.SIGNATURE:
    case FieldType.FILE:
      return {
        type: 'object',
        properties: {
          path: { type: 'keyword' },
          originalFilename: { type: 'keyword' },
          type: { type: 'keyword' }
        }
      }
    case FieldType.NAME:
      return {
        type: 'object',
        properties: {
          firstname: { type: 'text', analyzer: 'classic' },
          surname: { type: 'text', analyzer: 'classic' },
          [NAME_QUERY_KEY]: { type: 'text', analyzer: 'classic' }
        }
      }
    case FieldType.FILE_WITH_OPTIONS:
      return {
        type: 'nested',
        properties: {
          path: { type: 'keyword' },
          originalFilename: { type: 'keyword' },
          type: { type: 'keyword' },
          option: { type: 'keyword' }
        }
      }
    case FieldType.SEARCH:
    case FieldType.ID_READER:
    case FieldType.QR_READER:
    case FieldType.HTTP:
    case FieldType.LINK_BUTTON:
    case FieldType.QUERY_PARAM_READER:
    case FieldType.LOADER:
      /**
       * HTTP values are redirected to other fields via `value: field('http').get('data.my-data')`, so we currently don't need to enable exhaustive indexing.
       * The field still lands in `_source`.
       */
      return {
        type: 'object',
        enabled: false
      }
    case FieldType.DATE_RANGE:
    case FieldType.SELECT_DATE_RANGE:
    default:
      /**
       * The remaining fields are "search" only fields so should not be
       * encountered when indexing events.
       */
      const _exhaustiveCheck: DateRangeField | SelectDateRangeField = field
      throw new Error(
        `Unsupported indexing field type: ${JSON.stringify(_exhaustiveCheck)}`
      )
  }
}

function formFieldsToDataMapping(fields: FieldConfig[]) {
  return fields.reduce(
    (acc, field) => {
      return {
        ...acc,
        [encodeFieldId(field.id)]: mapFieldTypeToElasticsearch(field)
      }
    },
    {} as Record<string, estypes.MappingProperty>
  )
}

export async function createIndex(
  indexName: string,
  formFields: FieldConfig[]
) {
  const client = getOrCreateClient()

  await client.indices.create({
    index: indexName,
    body: {
      mappings: {
        properties: {
          id: { type: 'keyword' },
          type: { type: 'keyword' },
          status: { type: 'keyword' },
          createdAt: { type: 'date' },
          createdByUserType: { type: 'keyword' },
          createdBy: { type: 'keyword' },
          createdAtLocation: { type: 'keyword' },
          updatedAtLocation: { type: 'keyword' },
          updatedAt: { type: 'date' },
          assignedTo: { type: 'keyword' },
          updatedBy: { type: 'keyword' },
          updatedByUserRole: { type: 'keyword' },
          declaration: {
            type: 'object',
            properties: formFieldsToDataMapping(formFields)
          },
          trackingId: { type: 'keyword' },
          legalStatuses: {
            type: 'object',
            properties: {
              [EventStatus.enum.DECLARED]: {
                type: 'object',
                properties: {
                  createdAt: { type: 'date' },
                  createdBy: { type: 'keyword' },
                  createdByUserType: { type: 'keyword' },
                  createdAtLocation: { type: 'keyword' },
                  createdByRole: { type: 'keyword' },
                  createdBySignature: { type: 'keyword' },
                  acceptedAt: { type: 'date' }
                } satisfies Record<
                  keyof ActionCreationMetadata,
                  estypes.MappingProperty
                >
              },
              [EventStatus.enum.REGISTERED]: {
                type: 'object',
                properties: {
                  createdAt: { type: 'date' },
                  createdBy: { type: 'keyword' },
                  createdByUserType: { type: 'keyword' },
                  createdAtLocation: { type: 'keyword' },
                  createdByRole: { type: 'keyword' },
                  createdBySignature: { type: 'keyword' },
                  acceptedAt: { type: 'date' },
                  registrationNumber: { type: 'keyword' }
                } satisfies Record<
                  keyof RegistrationCreationMetadata,
                  estypes.MappingProperty
                >
              }
            }
          },
          flags: { type: 'keyword' },
          potentialDuplicates: {
            type: 'object',
            properties: {
              id: { type: 'keyword' },
              trackingId: { type: 'keyword' }
            }
          }
        } satisfies EventIndexMapping
      }
    }
  })

  return ensureAlias(indexName)
}

export async function ensureIndexExists(
  eventConfiguration: EventConfig,
  { overwrite }: { overwrite?: boolean } = { overwrite: false }
) {
  const esClient = getOrCreateClient()
  const indexName = getEventIndexName(eventConfiguration.id)
  const hasEventsIndex = await esClient.indices.exists({
    index: indexName
  })

  if (!hasEventsIndex) {
    logger.info(`Creating index ${indexName}`)
    await createIndex(indexName, getDeclarationFields(eventConfiguration))
  } else {
    logger.info(`Index ${indexName} already exists.`)
    if (overwrite) {
      logger.info(`. - Overwriting index ${indexName}`)
      await esClient.indices.delete({ index: indexName })
      await createIndex(indexName, getDeclarationFields(eventConfiguration))
    }
  }
  return ensureAlias(indexName)
}

type _Combine<
  T,
  K extends PropertyKey = T extends unknown ? keyof T : never
> = T extends unknown ? T & Partial<Record<Exclude<K, keyof T>, never>> : never

type Combine<T> = { [K in keyof _Combine<T>]: _Combine<T>[K] }
type AllFieldsUnion = Combine<AddressFieldValue>
export type BulkResponse = estypes.BulkResponse

export async function indexEventsInBulk(
  batch: EventDocument[],
  configs: EventConfig[]
) {
  const esClient = getOrCreateClient()

  const body = batch.flatMap((doc) => [
    { index: { _index: getEventIndexName(doc.type), _id: doc.id } },
    eventToEventIndex(doc, getEventConfigById(configs, doc.type))
  ])

  return esClient.bulk({ refresh: false, body })
}

export async function indexEvent(event: EventDocument, config: EventConfig) {
  const esClient = getOrCreateClient()
  const indexName = getEventIndexName(event.type)

  return esClient.index<EventIndex>({
    index: indexName,
    id: event.id,
    /** We derive the full state (without nulls) from eventToEventIndex, replace instead of update. */
    document: eventToEventIndex(event, config),
    refresh: 'wait_for'
  })
}

export async function getIndexedEvents(
  userId: string,
  eventConfigs: EventConfig[]
) {
  const esClient = getOrCreateClient()

  const hasEventsIndex = await esClient.indices.existsAlias({
    name: getEventAliasName()
  })

  if (!hasEventsIndex) {
    logger.error(
      `Event alias ${getEventAliasName()} not created. Sending empty array. Ensure indexing is running.`
    )
    return []
  }

  const query = {
    // We basically want to fetch all events,
    // UNLESS they are in status 'CREATED' (i.e. undeclared drafts) and not created by current user.
    bool: {
      should: [
        {
          bool: {
            must_not: [{ term: { status: EventStatus.enum.CREATED } }],
            should: undefined
          }
        },
        {
          bool: {
            must: [
              { term: { status: EventStatus.enum.CREATED } },
              { term: { createdBy: userId } }
            ],

            should: undefined
          }
        }
      ],

      minimum_should_match: 1
    }
  } satisfies estypes.QueryDslQueryContainer

  const response = await esClient.search<EncodedEventIndex>({
    index: getEventAliasName(),
    query,
    size: ELASTICSEARCH_MAXIMUM_QUERY_SIZE,
    request_cache: false
  })

  return response.hits.hits
    .map((hit) => hit._source)
    .filter((event): event is EncodedEventIndex => event !== undefined)
    .map((eventIndex) => {
      const eventConfig = getEventConfigById(eventConfigs, eventIndex.type)
      const decodedEventIndex = decodeEventIndex(eventConfig, eventIndex)
      return removeSecuredFields(eventConfig, decodedEventIndex)
    })
}

function valueFromTotal(total?: number | estypes.SearchTotalHits) {
  if (!total) {
    return 0
  }
  if (typeof total === 'number') {
    return total
  } else {
    return total.value
  }
}

export async function findRecordsByQuery(
  search: SearchQuery,
  eventConfigs: EventConfig[],
  options: Record<string, SearchScopeAccessLevels>,
  userOfficeId: string | undefined
) {
  const esClient = getOrCreateClient()

  const { query, limit, offset } = search

  const esQuery = withJurisdictionFilters(
    await buildElasticQueryFromSearchPayload(query, eventConfigs),
    options,
    userOfficeId
  )

  const response = await esClient.search<EncodedEventIndex>({
    index: getEventAliasName(),
    size: limit,
    from: offset,
    track_total_hits: true,
    request_cache: false,
    query: esQuery,
    sort: search.sort?.map((sort) => ({
      [sort.field]: {
        order: sort.direction,
        unmapped_type: 'keyword'
      }
    })) || {
      _score: {
        order: 'desc'
      },
      updatedAt: {
        order: 'desc'
      }
    }
  })

  const events = response.hits.hits
    .map((hit) => hit._source)
    .filter((event): event is EncodedEventIndex => event !== undefined)
    .map((eventIndex) => {
      const eventConfig = getEventConfigById(eventConfigs, eventIndex.type)
      const decodedEventIndex = decodeEventIndex(eventConfig, eventIndex)
      return removeSecuredFields(eventConfig, decodedEventIndex)
    })

  return { results: events, total: valueFromTotal(response.hits.total) }
}

/*
 * The types provided by the Elasticsearch client library.
 * Left the code having to check for almost all fields.
 */
const MsearchResponseSchema = z.object({
  status: z.number(),
  hits: z.object({
    total: z.object({
      value: z.number()
    })
  })
})

export async function getEventCount(
  queries: WorkqueueCountInput,
  eventConfigs: EventConfig[],
  options: Record<string, SearchScopeAccessLevels>,
  userOfficeId: string | undefined
) {
  const esClient = getOrCreateClient()

  const esQueries = queries.map(async (query) =>
    buildElasticQueryFromSearchPayload(query.query, eventConfigs)
  )

  const filteredQueries = (await Promise.all(esQueries)).map((query) =>
    withJurisdictionFilters(query, options, userOfficeId)
  )
  const { responses } = await esClient.msearch({
    searches: filteredQueries.flatMap((query) => [
      { index: getEventAliasName() },
      { size: 0, track_total_hits: true, query }
    ])
  })

  return responses.reduce((acc: Record<string, number>, response, index) => {
    const slug = queries[index].slug

    const validatedResponse = MsearchResponseSchema.safeParse(response)

    return {
      ...acc,
      [slug]: validatedResponse.success
        ? validatedResponse.data.hits.total.value
        : 0
    }
  }, {})
}
