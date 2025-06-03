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

import { Transform } from 'stream'
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
  WorkqueueCountInput
} from '@opencrvs/commons/events'
import { logger } from '@opencrvs/commons'
import {
  getEventAliasName,
  getEventIndexName,
  getOrCreateClient
} from '@events/storage/elasticsearch'
import { getClient, sql } from '@events/storage/postgres/events/db'
import {
  decodeEventIndex,
  DEFAULT_SIZE,
  EncodedEventIndex,
  encodeEventIndex,
  encodeFieldId
} from './utils'
import { buildElasticQueryFromSearchPayload } from './query'

function eventToEventIndex(
  event: EventDocument,
  config: EventConfig
): EventIndex {
  return encodeEventIndex(getCurrentEventState(event, config))
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
    case FieldType.SIGNATURE:
    case FieldType.PARAGRAPH:
    case FieldType.BULLET_LIST:
    case FieldType.PAGE_HEADER:
    case FieldType.EMAIL:
      return { type: 'text' }
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
    case FieldType.FILE:
      return {
        type: 'object',
        properties: {
          filename: { type: 'keyword' },
          originalFilename: { type: 'keyword' },
          type: { type: 'keyword' }
        }
      }
    case FieldType.FILE_WITH_OPTIONS:
      return {
        type: 'nested',
        properties: {
          filename: { type: 'keyword' },
          originalFilename: { type: 'keyword' },
          type: { type: 'keyword' },
          option: { type: 'keyword' }
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
      mappings: {
        properties: {
          id: { type: 'keyword' },
          type: { type: 'keyword' },
          status: { type: 'keyword' },
          createdAt: { type: 'date' },
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
              [EventStatus.DECLARED]: {
                type: 'object',
                properties: {
                  createdAt: { type: 'date' },
                  createdBy: { type: 'keyword' },
                  createdAtLocation: { type: 'keyword' },
                  createdByRole: { type: 'keyword' },
                  acceptedAt: { type: 'date' }
                } satisfies Record<
                  keyof ActionCreationMetadata,
                  estypes.MappingProperty
                >
              },
              [EventStatus.REGISTERED]: {
                type: 'object',
                properties: {
                  createdAt: { type: 'date' },
                  createdBy: { type: 'keyword' },
                  createdAtLocation: { type: 'keyword' },
                  createdByRole: { type: 'keyword' },
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

export async function indexAllEvents(eventConfiguration: EventConfig) {
  const db = await getClient()
  const esClient = getOrCreateClient()
  const indexName = getEventIndexName(eventConfiguration.id)
  const hasEventsIndex = await esClient.indices.exists({
    index: indexName
  })

  if (!hasEventsIndex) {
    await createIndex(indexName, getDeclarationFields(eventConfiguration))
  }

  const transformedStreamData = new Transform({
    readableObjectMode: true,
    writableObjectMode: true,
    transform: (record: EventDocument, _encoding, callback) => {
      callback(null, eventToEventIndex(record, eventConfiguration))
    }
  })

  await db.stream(
    sql.type(EventDocument)`
      SELECT
        e.id,
        e.event_type AS type,
        e.created_at AS "createdAt",
        e.updated_at AS "updatedAt",
        e.tracking_id AS "trackingId",
        COALESCE(
          json_agg(
            jsonb_build_object(
              'id',
              a.id,
              'transactionId',
              a.transaction_id,
              'createdAt',
              a.created_at,
              'createdBy',
              a.created_by,
              'createdByRole',
              a.created_by_role,
              'declaration',
              a.declaration,
              'annotation',
              a.annotation,
              'createdAtLocation',
              a.created_at_location,
              'status',
              a.status,
              'type',
              a.action_type,
              'originalActionId',
              a.original_action_id
            )
          ) FILTER (
            WHERE
              a.id IS NOT NULL
          ),
          '[]'::json
        ) AS actions
      FROM
        events e
        LEFT JOIN event_actions a ON a.event_id = e.id
      GROUP BY
        e.id
    `,
    // @TODO: Look into this
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    async (stream) => {
      await esClient.helpers.bulk({
        retries: 3,
        wait: 3000,
        datasource: stream.pipe(transformedStreamData),
        onDocument: (doc: EventIndex) => ({
          index: {
            _index: indexName,
            _id: doc.id
          }
        }),
        refresh: 'wait_for'
      })
    }
  )
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

export async function deleteEventIndex(event: EventDocument) {
  const esClient = getOrCreateClient()

  const response = await esClient.delete({
    index: getEventIndexName(event.type),
    id: event.id,
    refresh: 'wait_for'
  })

  return response
}

export async function getIndexedEvents(userId: string) {
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
            must_not: [{ term: { status: EventStatus.CREATED } }]
          }
        },
        {
          bool: {
            must: [
              { term: { status: EventStatus.CREATED } },
              { term: { createdBy: userId } }
            ]
          }
        }
      ],
      minimum_should_match: 1
    }
  } as estypes.QueryDslQueryContainer

  const response = await esClient.search<EncodedEventIndex>({
    index: getEventAliasName(),
    query,
    size: DEFAULT_SIZE,
    request_cache: false
  })

  return response.hits.hits
    .map((hit) => hit._source)
    .filter((event): event is EncodedEventIndex => event !== undefined)
    .map(decodeEventIndex)
}

export async function getIndex(eventParams: QueryType) {
  const esClient = getOrCreateClient()

  if (eventParams.type === 'or') {
    const { clauses } = eventParams
    // @todo: implement or query for quick search
    // eslint-disable-next-line no-console
    console.log({ clauses })
    return []
  }

  if (Object.values(eventParams).length === 0) {
    throw new Error('No search params provided')
  }

  const query = buildElasticQueryFromSearchPayload(eventParams)
  const response = await esClient.search<EncodedEventIndex>({
    index: getEventAliasName(),
    size: DEFAULT_SIZE,
    request_cache: false,
    query
  })

  const events = response.hits.hits
    .map((hit) => hit._source)
    .filter((event): event is EncodedEventIndex => event !== undefined)
    .map((event) => decodeEventIndex(event))

  return events
}

export async function getEventCount(queries: WorkqueueCountInput) {
  return (
    //  @ToDo: write a query that does everything in one go.
    (
      await Promise.all(
        queries.map(async ({ slug, query }) => {
          const count = (await getIndex(query)).length
          return { slug, count }
        })
      )
    ).reduce((acc: Record<string, number>, { slug, count }) => {
      acc[slug] = count
      return acc
    }, {})
  )
}
