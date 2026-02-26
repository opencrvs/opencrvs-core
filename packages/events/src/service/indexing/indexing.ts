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

import { estypes } from '@elastic/elasticsearch'
import { z } from 'zod'
import {
  ActionCreationMetadata,
  RegistrationCreationMetadata,
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
  getTemporaryIndexName,
  getOrCreateClient
} from '@events/storage/elasticsearch'
import {
  decodeEventIndex,
  EncodedEventIndex,
  encodeEventIndex,
  encodeFieldId,
  NAME_QUERY_KEY,
  AGE_DOB_QUERY_KEY,
  removeSecuredFields,
  IndexedAgeFieldValue,
  IndexedNameFieldValue
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
    case FieldType.TIME:
      return { type: 'text' }
    case FieldType.NUMBER_WITH_UNIT:
      return {
        type: 'object',
        properties: {
          numericValue: { type: 'double' },
          unit: { type: 'text' }
        }
      }
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
          asOfDateRef: { type: 'keyword' },
          [AGE_DOB_QUERY_KEY]: { type: 'date' }
        } satisfies {
          [K in keyof Required<IndexedAgeFieldValue>]: estypes.MappingProperty
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
          middlename: { type: 'text', analyzer: 'classic' },
          surname: { type: 'text', analyzer: 'classic' },
          [NAME_QUERY_KEY]: { type: 'text', analyzer: 'classic' }
        } satisfies {
          [K in keyof Required<IndexedNameFieldValue>]: estypes.MappingProperty
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
  formFields: FieldConfig[],
  { addAlias = true }: { addAlias?: boolean } = {}
): Promise<void> {
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

  if (addAlias) {
    await ensureAlias(indexName)
  }
}

export async function ensureIndexExists(eventConfiguration: EventConfig) {
  const esClient = getOrCreateClient()
  const indexName = getEventIndexName(eventConfiguration.id)

  // After a blue/green reindex, `indexName` (e.g. "events_birth") is a write
  // alias rather than a concrete index. finaliseReindexIndex already set up
  // both the global read alias and the per-type write alias, so nothing to do.
  const isAlreadyWriteAlias = await esClient.indices.existsAlias({
    name: indexName
  })
  if (isAlreadyWriteAlias) {
    logger.info(
      `Write alias ${indexName} already exists — index setup already complete`
    )
    return
  }

  const hasConcreteIndex = await esClient.indices.exists({ index: indexName })

  if (!hasConcreteIndex) {
    logger.info(`Creating index ${indexName}`)
    await createIndex(indexName, getDeclarationFields(eventConfiguration))
  } else {
    // Existing deployment: bare concrete index. Add the global read alias so
    // searches work. The per-type write alias will be created on the next
    // reindex (triggered automatically on deploy).
    logger.info(`Index ${indexName} already exists as a concrete index.`)
    await ensureAlias(indexName)
  }
}

/**
 * Creates a temporary index for blue/green reindexing.
 * Returns the temporary index name. Bulk writes should target this index.
 * The alias is NOT added at this point — it is only added in `finaliseReindexIndex`
 * once all data has been successfully indexed, so the temp index never appears
 * in alias-based queries before the swap.
 * Call `finaliseReindexIndex` on success or `cleanupTemporaryIndex` on failure.
 */
export async function prepareReindexIndex(
  eventConfiguration: EventConfig,
  timestamp: number
): Promise<{ tempIndexName: string }> {
  const tempIndexName = getTemporaryIndexName(eventConfiguration.id, timestamp)
  const formFields = getDeclarationFields(eventConfiguration)

  logger.info(`Preparing temporary reindex index ${tempIndexName}`)
  // addAlias: false — the temp index must NOT join the alias until the swap
  await createIndex(tempIndexName, formFields, { addAlias: false })

  return { tempIndexName }
}

/**
 * Atomically swaps the global read alias and the per-type write alias from
 * whichever index currently holds them to the newly built temp index, then
 * deletes the old index. Zero-downtime promotion.
 *
 * Two aliases are maintained:
 *  - Global read alias  (`events`)         — used by all search/query operations
 *  - Per-type write alias (`events_birth`) — used by indexEvent / indexEventsInBulk
 *    so that writes always resolve to the correct physical index regardless of
 *    whether a reindex has occurred.
 *
 * We look up the current alias holder at finalise-time rather than relying on
 * the static computed name, because after the first blue/green reindex the live
 * index is a timestamped temp name, not the original `{prefix}_{eventType}`.
 */
export async function finaliseReindexIndex(
  eventType: string,
  tempIndexName: string
) {
  const esClient = getOrCreateClient()
  const globalAliasName = getEventAliasName()
  // The write alias name is the same as the stable event-type index name
  // (e.g. "events_birth"). After the first reindex this name is an alias, not a
  // concrete index, so writes always land on the correct physical index.
  const writeAliasName = getEventIndexName(eventType)

  // Find which concrete index currently holds the global alias for this event type
  let currentLiveIndex: string | undefined
  try {
    const aliasInfo = await esClient.indices.getAlias({ name: globalAliasName })
    // The global alias spans all event types — find the index that serves this
    // specific event type (its name starts with the event type index prefix)
    const eventIndexPrefix = getEventIndexName(eventType)
    currentLiveIndex = Object.keys(aliasInfo).find((idx) =>
      idx.startsWith(eventIndexPrefix)
    )
  } catch {
    // Alias doesn't exist yet — this is the first reindex
  }

  if (currentLiveIndex) {
    // First-ever reindex of a deployed instance: the live index is a bare
    // concrete index whose name (e.g. "events_birth") is the same as the write
    // alias we want to create. ES does not allow an alias to share a name with
    // an existing concrete index, so we must delete the concrete index first and
    // then create the alias in two separate steps.
    const writeAliasConflictsWithConcreteIndex =
      currentLiveIndex === writeAliasName

    if (writeAliasConflictsWithConcreteIndex) {
      logger.warn(
        `First-time blue/green reindex detected: live index "${currentLiveIndex}" has the same name ` +
          `as the write alias "${writeAliasName}". Falling back to two-step alias promotion ` +
          `(brief write-alias gap window is unavoidable in this case).`
      )
      // Step 1: Atomically swap global read alias to the new index.
      await esClient.indices.updateAliases({
        body: {
          actions: [
            { remove: { index: currentLiveIndex, alias: globalAliasName } },
            { add: { index: tempIndexName, alias: globalAliasName } }
          ]
        }
      })
      // Step 2: Delete old concrete index — this frees the name "events_birth".
      logger.info(
        `Global alias swapped. Deleting old concrete index ${currentLiveIndex}`
      )
      await esClient.indices.delete({ index: currentLiveIndex })
      // Step 3: Now safe to create the write alias under the freed name.
      logger.info(
        `Creating per-type write alias ${writeAliasName} → ${tempIndexName}`
      )
      await esClient.indices.putAlias({
        index: tempIndexName,
        name: writeAliasName
      })
    } else {
      logger.info(
        `Swapping aliases [${globalAliasName}, ${writeAliasName}] from ${currentLiveIndex} to ${tempIndexName}`
      )
      // Normal path (second+ reindex): single atomic call swaps global read alias
      // AND creates per-type write alias simultaneously — no gap window.
      await esClient.indices.updateAliases({
        body: {
          actions: [
            { remove: { index: currentLiveIndex, alias: globalAliasName } },
            { add: { index: tempIndexName, alias: globalAliasName } },
            { add: { index: tempIndexName, alias: writeAliasName } }
          ]
        }
      })
      // Delete old index only after aliases are consistent.
      logger.info(
        `Aliases swapped atomically. Deleting old index ${currentLiveIndex}`
      )
      await esClient.indices.delete({ index: currentLiveIndex })
    }
  } else {
    // No existing index for this event type — create both aliases in one call.
    logger.info(
      `No existing index for ${eventType}, creating aliases ${globalAliasName} and ${writeAliasName} → ${tempIndexName}`
    )
    await esClient.indices.updateAliases({
      body: {
        actions: [
          { add: { index: tempIndexName, alias: globalAliasName } },
          { add: { index: tempIndexName, alias: writeAliasName } }
        ]
      }
    })
  }

  logger.info(`Reindex finalised: ${tempIndexName} is now live`)
}

/**
 * Deletes the temporary index if reindexing failed. The live index is untouched.
 */
export async function cleanupTemporaryIndex(tempIndexName: string) {
  const esClient = getOrCreateClient()
  logger.info(`Cleaning up temporary index ${tempIndexName}`)
  const exists = await esClient.indices.exists({ index: tempIndexName })
  if (exists) {
    await esClient.indices.delete({ index: tempIndexName })
    logger.info(`Temporary index ${tempIndexName} deleted`)
  }
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
  configs: EventConfig[],
  /**
   * Optional map of eventType → index name. When provided (e.g. during a
   * blue/green reindex), writes go to the temporary index instead of the live one.
   */
  indexNameOverrides?: Map<string, string>
) {
  const esClient = getOrCreateClient()

  const body = batch.flatMap((doc) => [
    {
      index: {
        _index:
          indexNameOverrides?.get(doc.type) ?? getEventIndexName(doc.type),
        _id: doc.id
      }
    },
    eventToEventIndex(doc, getEventConfigById(configs, doc.type))
  ])

  const response = await esClient.bulk({ refresh: false, body })

  if (response.errors) {
    const failures = response.items
      .filter((item) => item.index?.error)
      .map((item) => ({
        id: item.index?._id,
        index: item.index?._index,
        error: item.index?.error
      }))
    logger.error(
      `Bulk indexing had ${failures.length} failure(s) out of ${batch.length} documents`,
      { failures }
    )
  }

  return response
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
