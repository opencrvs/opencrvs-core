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

/* eslint-disable max-lines */

import { estypes } from '@elastic/elasticsearch'
import * as z from 'zod/v4'
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
  toEventConfig,
  WorkqueueCountInput,
  getEventConfigById,
  SearchQuery,
  DateRangeField,
  SelectDateRangeField
} from '@opencrvs/commons/events'
import {
  dropSecuredDeclarationFields,
  EventIndexWithAdministrativeHierarchy,
  getEventConfigForRecord,
  logger,
  RecordScopeV2,
  TokenWithBearer,
  VersionedEventConfig
} from '@opencrvs/commons'
import {
  getEventAliasName,
  getEventIndexName,
  getEventVersionIndexName,
  getOrCreateClient
} from '@events/storage/elasticsearch'
import { primeAdministrativeHierarchyCache } from '@events/storage/postgres/administrative-hierarchy/locations'
import { getValidatorContext } from '@events/router/middleware/validate/utils'
import { TrpcUserContext } from '../../context'
import {
  collectLocationIds,
  decodeEventIndex,
  EncodedEventIndex,
  encodeEventIndex,
  encodeFieldId,
  getEventIndexWithAdministrativeHierarchy,
  getEventIndexWithoutLocationHierarchy,
  NAME_QUERY_KEY,
  AGE_DOB_QUERY_KEY,
  IndexedAgeFieldValue,
  resolveRecordActionScopeToIds,
  valueFromTotal,
  IndexedNameFieldValue
} from './utils'
import {
  buildElasticQueryFromSearchPayload,
  withFlagsFilter,
  withJurisdictionFilters
} from './query'

function eventToEventIndex(
  event: EventDocument,
  config: EventConfig
): EventIndex {
  return encodeEventIndex(getCurrentEventState(event, config), config)
}

/* This type ensures all properties of EventIndex are present in the mapping */
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
    case FieldType.FIELD_GROUP:
      return {
        type: 'object',
        properties: field.fields.reduce(
          (acc, subfield) => ({
            ...acc,
            [subfield.id]: mapFieldTypeToElasticsearch(subfield)
          }),
          {}
        )
      }
    case FieldType.NUMBER:
      return { type: 'double' }
    case FieldType.DATE:
      return { type: 'date' }
    case FieldType.DATE_RANGE:
    case FieldType.TEXTAREA:
    case FieldType.PARAGRAPH:
    case FieldType.HEADING:
    case FieldType.BULLET_LIST:
    case FieldType.PAGE_HEADER:
    case FieldType.TIME:
    case FieldType.ALPHA_HIDDEN:
      return { type: 'text' }
    case FieldType.TEXT:
      return { type: 'keyword' }
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
    case FieldType.AUTOCOMPLETE:
      return {
        type: 'object',
        properties: {
          label: { type: 'keyword' },
          value: { type: 'keyword' }
        }
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
    case FieldType.USER_ROLE:
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
    /**
     * HTTP values are redirected to other fields via `value: field('http').get('data.my-data')`, so we currently don't need to enable exhaustive indexing.
     * The field still lands in `_source`.
     */
    case FieldType.HTTP:
    case FieldType.LINK_BUTTON:
    case FieldType.QUERY_PARAM_READER:
    /** Images are not indexed as they're currently asserted read-only. */
    case FieldType.IMAGE_VIEW:
    case FieldType.LOADER:
      return {
        type: 'object',
        enabled: false
      }
    /** Custom fields are not indexed as their structure is unknown. */
    case FieldType._EXPERIMENTAL_CUSTOM:
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
  addAlias: boolean = true
) {
  const client = getOrCreateClient()

  await client.indices.create({
    index: indexName,
    body: {
      mappings: {
        properties: {
          id: { type: 'keyword' },
          type: { type: 'keyword' },
          configVersionId: { type: 'keyword' },
          status: { type: 'keyword' },
          createdAt: { type: 'date' },
          createdByUserType: { type: 'keyword' },
          createdBy: { type: 'keyword' },
          createdAtLocation: { type: 'keyword' },
          updatedAtLocation: { type: 'keyword' },
          placeOfEvent: { type: 'keyword' },
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
              [EventStatus.enum.NOTIFIED]: {
                type: 'object',
                properties: {
                  createdAt: { type: 'date' },
                  createdBy: { type: 'keyword' },
                  createdByUserType: { type: 'keyword' },
                  createdAtLocation: { type: 'keyword' },
                  createdByRole: { type: 'keyword' },
                  acceptedAt: { type: 'date' }
                } satisfies Record<
                  keyof ActionCreationMetadata,
                  estypes.MappingProperty
                >
              },
              [EventStatus.enum.DECLARED]: {
                type: 'object',
                properties: {
                  createdAt: { type: 'date' },
                  createdBy: { type: 'keyword' },
                  createdByUserType: { type: 'keyword' },
                  createdAtLocation: { type: 'keyword' },
                  createdByRole: { type: 'keyword' },
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
                  acceptedAt: { type: 'date' },
                  registrationNumber: { type: 'keyword' }
                } satisfies Record<
                  keyof RegistrationCreationMetadata,
                  estypes.MappingProperty
                >
              },
              [EventStatus.enum.REVOKED]: {
                type: 'object',
                properties: {
                  createdAt: { type: 'date' },
                  createdBy: { type: 'keyword' },
                  createdByUserType: { type: 'keyword' },
                  createdAtLocation: { type: 'keyword' },
                  createdByRole: { type: 'keyword' },
                  acceptedAt: { type: 'date' }
                } satisfies Record<
                  keyof ActionCreationMetadata,
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

/**
 * Creates the index of one version of an event, searchable through the event's alias
 * and the global alias.
 */
export async function createVersionIndex(
  eventType: string,
  versionId: string,
  formFields: FieldConfig[]
) {
  const indexName = getEventVersionIndexName(eventType, versionId)
  await createIndex(indexName, formFields)
  await getOrCreateClient().indices.putAlias({
    index: indexName,
    name: getEventIndexName(eventType)
  })
}

/** @returns the indices behind `name`, an index or an alias, with their aliases. Empty when neither exists. */
export async function getIndicesBehind(name: string) {
  const esClient = getOrCreateClient()

  if (!(await esClient.indices.exists({ index: name }))) {
    return {}
  }
  return esClient.indices.getAlias({ index: name })
}

/** The suffix that a reindex adds to an index name: the time it started, in milliseconds since 1970 (13 digits). */
const REINDEX_TIMESTAMP = /^\d{13}$/

/**
 * Whether `index` is the index that all versions shared before 2.2: `<event>`, or
 * `<event>_<timestamp>` after a reindex. Versions without an index are pointed at it,
 * so a leftover index of a removed version (`<event>_<version>_<timestamp>`) must not match.
 */
function isSharedIndexName(index: string, eventIndexName: string) {
  return (
    index === eventIndexName ||
    (index.startsWith(`${eventIndexName}_`) &&
      REINDEX_TIMESTAMP.test(index.slice(eventIndexName.length + 1)))
  )
}

/**
 * Makes sure every version of the event has a name its records can be written to.
 *
 * Records of every version used to share one index. Until a reindex gives each version
 * its own, the version names are aliases of that shared index, so it keeps answering
 * queries with nothing written elsewhere.
 */
export async function ensureIndexExists(
  eventConfiguration: VersionedEventConfig
) {
  const esClient = getOrCreateClient()
  const eventIndexName = getEventIndexName(eventConfiguration.id)
  const versions = eventConfiguration.versions.map((version) => ({
    version,
    indexName: getEventVersionIndexName(eventConfiguration.id, version.id)
  }))

  const indicesOfEvent = await getIndicesBehind(eventIndexName)
  // The shared index is the one no version's name resolves to yet. None is left once
  // a reindex has run, or on a fresh install.
  const [sharedIndex] = Object.entries(indicesOfEvent)
    .filter(
      ([index, { aliases }]) =>
        isSharedIndexName(index, eventIndexName) &&
        !versions.some(
          ({ indexName }) => indexName === index || indexName in aliases
        )
    )
    .map(([index]) => index)

  if (sharedIndex) {
    await ensureAlias(sharedIndex)
  }

  // Makes each version's name point to an index its records can be written to: kept as
  // it is when it exists, aliased to the shared index until a reindex, or a new index.
  for (const { version, indexName } of versions) {
    if (await esClient.indices.exists({ index: indexName })) {
      continue
    }

    // Until a reindex, records of this version are written to the shared index.
    if (sharedIndex) {
      logger.info(`Aliasing ${indexName} to shared index ${sharedIndex}`)
      await esClient.indices.putAlias({ index: sharedIndex, name: indexName })
      continue
    }

    const formFields = getDeclarationFields(
      toEventConfig(eventConfiguration, version)
    )

    // An alias cannot take the name of an index. A reindex replaces that index.
    if (eventIndexName in indicesOfEvent) {
      logger.warn(
        `Creating index ${indexName} outside ${eventIndexName}, which is still an index. Reindex to include it.`
      )
      await createIndex(indexName, formFields)
      continue
    }

    logger.info(`Creating index ${indexName}`)
    await createVersionIndex(eventConfiguration.id, version.id, formFields)
  }
}

type _Combine<
  T,
  K extends PropertyKey = T extends unknown ? keyof T : never
> = T extends unknown ? T & Partial<Record<Exclude<K, keyof T>, never>> : never

type Combine<T> = { [K in keyof _Combine<T>]: _Combine<T>[K] }
type AllFieldsUnion = Combine<AddressFieldValue>
export type BulkResponse = estypes.BulkResponse

/**
 * @returns the configuration of the version `record` was created under.
 * @throws when its event type or version is not configured.
 */
export function getConfigForRecord(
  configs: VersionedEventConfig[],
  record: Pick<EventIndex, 'type' | 'configVersionId'>
) {
  return getEventConfigForRecord(
    getEventConfigById(configs, record.type),
    record
  )
}

export async function indexEventsInBulk(
  batch: EventDocument[],
  configs: VersionedEventConfig[],
  /** Where each record is written. Its version's index, unless a reindex is building new ones. */
  getIndexName = (doc: EventDocument) =>
    getEventVersionIndexName(doc.type, doc.configVersionId)
) {
  const esClient = getOrCreateClient()

  const hiearchyResolutionStarted = new Date()

  const indexableEvents = batch.map((doc) => {
    // Each record is indexed with the version it was created under.
    const config = getConfigForRecord(configs, doc)
    return { doc, config, eventIndex: eventToEventIndex(doc, config) }
  })

  await primeAdministrativeHierarchyCache(
    indexableEvents.flatMap(({ config, eventIndex }) =>
      collectLocationIds(config, eventIndex)
    )
  )

  const indexedDocs = await Promise.all(
    indexableEvents.map(async ({ doc, config, eventIndex }) => {
      const eventIndexWithLocationHierarchy =
        await getEventIndexWithAdministrativeHierarchy(config, eventIndex)
      return [
        {
          index: {
            _index: getIndexName(doc),
            _id: doc.id
          }
        },
        eventIndexWithLocationHierarchy
      ]
    })
  )
  const batchId = batch[0]?.id ?? 'unknown'
  logger.info(
    `Batch ${batchId}: Resolving admin hierarchy took ${new Date().valueOf() - hiearchyResolutionStarted.valueOf()} ms`
  )

  const body = indexedDocs.flat()
  const start = new Date()
  const response = await esClient.bulk({ refresh: false, body })
  logger.info(
    `Batch ${batchId}: Bulk indexing took ${new Date().valueOf() - start.valueOf()} ms`
  )
  if (response.errors) {
    const failures = response.items
      .filter((item) => item.index?.error)
      .map((item) => ({
        id: item.index?._id,
        index: item.index?._index,
        error: item.index?.error
      }))
    logger.error(
      `Bulk indexing had ${failures.length} failure(s) out of ${batch.length} documents.` +
        `Typically this is a sign of the records containing fields that do not exist in the form configuration anymore.` +
        ` Failures: ${JSON.stringify(failures, null, 2)}`
    )
  }

  return response
}

export async function indexEvent(
  event: EventDocument,
  config: EventConfig,
  waitFor: boolean
) {
  const esClient = getOrCreateClient()
  const indexName = getEventVersionIndexName(event.type, event.configVersionId)
  const eventIndex = eventToEventIndex(event, config)

  const eventIndexWithAdministrativeHierarchy =
    await getEventIndexWithAdministrativeHierarchy(config, eventIndex)
  return esClient.index<EventIndexWithAdministrativeHierarchy>({
    index: indexName,
    id: event.id,
    /** We derive the full state (without nulls) from eventToEventIndex, replace instead of update. */
    document: eventIndexWithAdministrativeHierarchy,
    refresh: waitFor ? 'wait_for' : false
  })
}

export async function findRecordsByQuery({
  search,
  eventConfigs,
  versionedEventConfigs,
  user,
  acceptedScopes,
  token
}: {
  search: SearchQuery
  eventConfigs: EventConfig[]
  versionedEventConfigs: VersionedEventConfig[]
  user: TrpcUserContext
  acceptedScopes: RecordScopeV2[]
  token: TokenWithBearer
}) {
  const esClient = getOrCreateClient()
  const { query, limit, offset } = search
  const resolvedScopes = acceptedScopes.map((scope) =>
    resolveRecordActionScopeToIds(scope, user)
  )

  const validatorContext = await getValidatorContext({ token })

  const esQuery = withFlagsFilter({
    query: withJurisdictionFilters({
      query: await buildElasticQueryFromSearchPayload(query, eventConfigs),
      scopesV2: resolvedScopes
    }),
    scopesV2: resolvedScopes
  })

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
    .map((eventIndex: EncodedEventIndex) => {
      // Each hit is decoded and secured with the version its record was created under.
      const eventConfig = getConfigForRecord(versionedEventConfigs, eventIndex)
      const decodedEventIndex = decodeEventIndex(eventConfig, eventIndex)
      const eventIndexWithoutLocationHierarchy =
        getEventIndexWithoutLocationHierarchy(eventConfig, decodedEventIndex)

      return dropSecuredDeclarationFields(
        eventConfig,
        eventIndexWithoutLocationHierarchy,
        // @TODO: This is not a full context. It will require fetching every EventDocument. https://github.com/opencrvs/opencrvs-core/issues/13530
        validatorContext
      )
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

export async function getEventCount({
  queries,
  eventConfigs,
  user,
  acceptedScopes
}: {
  queries: WorkqueueCountInput
  eventConfigs: EventConfig[]
  user: TrpcUserContext
  acceptedScopes: RecordScopeV2[]
}) {
  const esClient = getOrCreateClient()

  const resolvedScopes = acceptedScopes.map((scope) =>
    resolveRecordActionScopeToIds(scope, user)
  )

  const esQueries = queries.map(async (query) =>
    buildElasticQueryFromSearchPayload(query.query, eventConfigs)
  )

  const filteredQueries = (await Promise.all(esQueries)).map((query) =>
    withFlagsFilter({
      query: withJurisdictionFilters({
        query,
        scopesV2: resolvedScopes
      }),
      scopesV2: resolvedScopes
    })
  )

  const { responses } = await esClient.msearch({
    searches: filteredQueries.flatMap((query) => [
      { index: getEventAliasName() },
      { size: 0, track_total_hits: true, query }
    ])
  })

  return responses.reduce((acc: Record<string, number>, response, index) => {
    const slug = queries[index].slug

    return {
      ...acc,
      [slug]: MsearchResponseSchema.validate(response)
        ? response.hits.total.value
        : 0
    }
  }, {})
}
