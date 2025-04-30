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
  EventConfig,
  EventDocument,
  EventIndex,
  FieldConfig,
  getCurrentEventState
} from '@opencrvs/commons/events'
import { type estypes } from '@elastic/elasticsearch'
import * as eventsDb from '@events/storage/mongodb/events'
import {
  getEventAliasName,
  getEventIndexName,
  getOrCreateClient
} from '@events/storage/elasticsearch'
import { getAllFields, logger } from '@opencrvs/commons'
import { Transform } from 'stream'
import { z } from 'zod'

function eventToEventIndex(event: EventDocument): EventIndex {
  return getCurrentEventState(event)
}

/*
 * This type ensures all properties of EventIndex are present in the mapping
 */
type EventIndexMapping = { [key in keyof EventIndex]: estypes.MappingProperty }

export async function ensureIndexExists(eventConfiguration: EventConfig) {
  const esClient = getOrCreateClient()
  const indexName = getEventIndexName(eventConfiguration.id)
  const hasEventsIndex = await esClient.indices.exists({
    index: indexName
  })

  if (!hasEventsIndex) {
    await createIndex(indexName, getAllFields(eventConfiguration))
  }
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
          modifiedAt: { type: 'date' },
          assignedTo: { type: 'keyword' },
          updatedBy: { type: 'keyword' },
          data: {
            type: 'object',
            properties: formFieldsToDataMapping(formFields)
          }
        } satisfies EventIndexMapping
      }
    }
  })

  return client.indices.putAlias({
    index: indexName,
    name: getEventAliasName()
  })
}

function getElasticsearchMappingForType(field: FieldConfig) {
  switch (field.type) {
    case 'DATE':
      return { type: 'date' }
    case 'TEXT':
    case 'PARAGRAPH':
    case 'BULLET_LIST':
      return { type: 'text' }
    case 'RADIO_GROUP':
    case 'SELECT':
    case 'COUNTRY':
    case 'CHECKBOX':
    case 'LOCATION':
      return { type: 'keyword' }
    case 'FILE':
      return {
        type: 'object',
        properties: {
          filename: { type: 'keyword' },
          originalFilename: { type: 'keyword' },
          type: { type: 'keyword' }
        }
      }

    default:
      assertNever(field)
  }
}

function assertNever(_: never): never {
  throw new Error('Should never happen')
}

function formFieldsToDataMapping(fields: FieldConfig[]) {
  return fields.reduce((acc, field) => {
    return {
      ...acc,
      [field.id]: getElasticsearchMappingForType(field)
    }
  }, {})
}

export async function indexAllEvents(eventConfiguration: EventConfig) {
  const mongoClient = await eventsDb.getClient()
  const esClient = getOrCreateClient()
  const indexName = getEventIndexName(eventConfiguration.id)
  const hasEventsIndex = await esClient.indices.exists({
    index: indexName
  })

  if (!hasEventsIndex) {
    await createIndex(indexName, getAllFields(eventConfiguration))
  }

  const stream = mongoClient.collection(indexName).find().stream()

  const transformedStreamData = new Transform({
    readableObjectMode: true,
    writableObjectMode: true,
    transform: (record: EventDocument, _encoding, callback) => {
      callback(null, eventToEventIndex(record))
    }
  })

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

export async function indexEvent(event: EventDocument) {
  const esClient = getOrCreateClient()
  const indexName = getEventIndexName(event.type)

  return esClient.update<EventIndex>({
    index: indexName,
    id: event.id,
    body: {
      doc: eventToEventIndex(event),
      doc_as_upsert: true
    },
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

export async function getIndexedEvents() {
  const esClient = getOrCreateClient()

  const hasEventsIndex = await esClient.indices.exists({
    index: getEventAliasName()
  })

  if (!hasEventsIndex) {
    logger.error(
      'Event index not created. Sending empty array. Ensure indexing is running.'
    )
    return []
  }

  const response = await esClient.search({
    index: getEventAliasName(),
    size: 10000,
    request_cache: false
  })

  return z.array(EventIndex).parse(response.hits.hits.map((hit) => hit._source))
}
