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
  QueryType,
  WorkqueueCountInput,
  getEventConfigById,
  SearchScopeAccessLevels
} from '@opencrvs/commons/events'
import { logger } from '@opencrvs/commons'
import {
  getEventAliasName,
  getEventIndexName,
  getOrCreateClient
} from '@events/storage/elasticsearch'
import {
  decodeEventIndex,
  DEFAULT_SIZE,
  EncodedEventIndex,
  encodeEventIndex,
  encodeFieldId,
  removeSecuredFields
} from './utils'
import {
  buildElasticQueryFromSearchPayload,
  withJurisdictionFilters
} from './query'

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

function mapFieldTypeToElasticsearch(field: FieldConfig) {
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
        // apply custom normalyzer
        normalizer: 'lowercase_normalizer'
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
    case FieldType.DATA:
    case FieldType.ID:
    case FieldType.PHONE:
      return { type: 'keyword' }
    case FieldType.ADDRESS:
      const addressProperties = {
        country: { type: 'keyword' },
        addressType: { type: 'keyword' },
        province: { type: 'keyword' },
        district: { type: 'keyword' },
        urbanOrRural: { type: 'keyword' },
        town: { type: 'keyword' },
        residentialArea: { type: 'keyword' },
        street: { type: 'keyword' },
        number: { type: 'keyword' },
        zipCode: { type: 'keyword' },
        village: { type: 'keyword' },
        state: { type: 'keyword' },
        district2: { type: 'keyword' },
        cityOrTown: { type: 'keyword' },
        addressLine1: { type: 'keyword' },
        addressLine2: { type: 'keyword' },
        addressLine3: { type: 'keyword' },
        postcodeOrZip: { type: 'keyword' }
      } satisfies {
        [K in keyof Required<AllFieldsUnion>]: estypes.MappingProperty
      }
      return {
        type: 'object',
        properties: addressProperties
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
          firstname: { type: 'text', analyzer: 'human_name' },
          surname: { type: 'text', analyzer: 'human_name' },
          __fullname: { type: 'text', analyzer: 'human_name' }
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
    // @TODO: other option would be to throw an error, since these should not be used in declaration form.
    case FieldType.DATE_RANGE:
    case FieldType.SELECT_DATE_RANGE:
      return {
        type: 'object',
        properties: {
          start: { type: 'date' },
          end: { type: 'date' }
        }
      }
    default:
      const _exhaustiveCheck: never = field
      throw new Error(
        `Unhandled field type: ${JSON.stringify(_exhaustiveCheck)}`
      )
  }
}

function formFieldsToDataMapping(fields: FieldConfig[]) {
  return fields.reduce((acc, field) => {
    return {
      ...acc,
      [encodeFieldId(field.id)]: mapFieldTypeToElasticsearch(field)
    }
  }, {})
}

export async function createIndex(
  indexName: string,
  formFields: FieldConfig[]
) {
  const client = getOrCreateClient()

  await client.indices.create({
    index: indexName,
    body: {
      // Define a custom normalizer to make keyword fields case-insensitive by applying a lowercase filter
      settings: {
        analysis: {
          normalizer: {
            lowercase_normalizer: {
              type: 'custom',
              filter: ['lowercase']
            }
          },
          analyzer: {
            /*
             * Human name can contain
             * Special characters including hyphens, underscores and spaces
             */
            human_name: {
              type: 'custom',
              tokenizer: 'standard',
              filter: ['lowercase', 'word_delimiter']
            }
          }
        }
      },
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
          flags: { type: 'keyword' }
        } satisfies EventIndexMapping
      }
    }
  })

  return ensureAlias(indexName)
}

export async function ensureIndexExists(eventConfiguration: EventConfig) {
  const esClient = getOrCreateClient()
  const indexName = getEventIndexName(eventConfiguration.id)
  const hasEventsIndex = await esClient.indices.exists({
    index: indexName
  })

  if (!hasEventsIndex) {
    logger.info(`Creating index ${indexName}`)
    await createIndex(indexName, getDeclarationFields(eventConfiguration))
  } else {
    logger.info(`Index ${indexName} already exists.\n`)
  }
  return ensureAlias(indexName)
}

type _Combine<
  T,
  K extends PropertyKey = T extends unknown ? keyof T : never
> = T extends unknown ? T & Partial<Record<Exclude<K, keyof T>, never>> : never

type Combine<T> = { [K in keyof _Combine<T>]: _Combine<T>[K] }
type AllFieldsUnion = Combine<AddressFieldValue>

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

export async function deleteEventIndex(event: EventDocument) {
  const esClient = getOrCreateClient()

  const response = await esClient.delete({
    index: getEventIndexName(event.type),
    id: event.id,
    refresh: 'wait_for'
  })

  return response
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
    size: DEFAULT_SIZE,
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

export async function getIndex(
  eventParams: QueryType,
  eventConfigs: EventConfig[],
  options: Record<string, SearchScopeAccessLevels>,
  userOfficeId: string | undefined
) {
  const esClient = getOrCreateClient()

  const query = withJurisdictionFilters(
    await buildElasticQueryFromSearchPayload(eventParams, eventConfigs),
    options,
    userOfficeId
  )

  const response = await esClient.search<EncodedEventIndex>({
    index: getEventAliasName(),
    size: DEFAULT_SIZE,
    request_cache: false,
    query,
    sort: {
      _score: {
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

  return events
}

export async function getEventCount(
  queries: WorkqueueCountInput,
  eventConfigs: EventConfig[],
  options: Record<string, SearchScopeAccessLevels>,
  userOfficeId: string | undefined
) {
  return (
    //  @TODO: write a query that does everything in one go.
    (
      await Promise.all(
        queries.map(async ({ slug, query }) => {
          const count = (
            await getIndex(query, eventConfigs, options, userOfficeId)
          ).length
          return { slug, count }
        })
      )
    ).reduce((acc: Record<string, number>, { slug, count }) => {
      acc[slug] = count
      return acc
    }, {})
  )
}
