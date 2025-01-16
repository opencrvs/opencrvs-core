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
import { getAllFields } from '@opencrvs/commons'
import { Transform } from 'stream'
import { z } from 'zod'

function eventToEventIndex(event: EventDocument): EventIndex {
  return getCurrentEventState(event)
}

/*
 * This type ensures all properties of EventIndex are present in the mapping
 */
type EventIndexMapping = { [key in keyof EventIndex]: estypes.MappingProperty }

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
  if (field.type === 'DATE') {
    return { type: 'date' }
  }

  if (
    field.type === 'TEXT' ||
    field.type === 'PARAGRAPH' ||
    field.type === 'BULLET_LIST'
  ) {
    return { type: 'text' }
  }

  if (
    field.type === 'RADIO_GROUP' ||
    field.type === 'SELECT' ||
    field.type === 'COUNTRY' ||
    field.type === 'LOCATION' ||
    field.type === 'CHECKBOX'
  ) {
    return { type: 'keyword' }
  }

  if (field.type === 'FILE') {
    return {
      type: 'object',
      properties: {
        filename: { type: 'keyword' },
        originalFilename: { type: 'keyword' },
        type: { type: 'keyword' }
      }
    }
  }

  return assertNever(field)
}

const assertNever = (n: never): never => {
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
    transform: (record, _encoding, callback) => {
      callback(null, eventToEventIndex(record))
    }
  })

  return esClient.helpers.bulk({
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
    return []
  }

  const response = await esClient.search({
    index: getEventAliasName(),
    size: 10000,
    request_cache: false
  })

  return z.array(EventIndex).parse(response.hits.hits.map((hit) => hit._source))
}
