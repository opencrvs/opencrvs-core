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
  ActionInputWithType,
  EventDocument,
  EventInput,
  FileFieldValue,
  isUndeclaredDraft
} from '@opencrvs/commons/events'

import { getClient } from '@events/storage/mongodb'
import { ActionType, getUUID } from '@opencrvs/commons'
import { z } from 'zod'
import { deleteEventIndex, indexEvent } from './indexing/indexing'
import * as _ from 'lodash'
import { TRPCError } from '@trpc/server'
import { getEventConfigurations } from './config/config'
import { deleteFile, fileExists } from './files'

export const EventInputWithId = EventInput.extend({
  id: z.string()
})

export type EventInputWithId = z.infer<typeof EventInputWithId>

async function getEventByTransactionId(transactionId: string) {
  const db = await getClient()
  const collection = db.collection<EventDocument>('events')

  const document = await collection.findOne({ transactionId })

  return document
}
class EventNotFoundError extends TRPCError {
  constructor(id: string) {
    super({
      code: 'NOT_FOUND',
      message: `Event not found with ID: ${id}`
    })
  }
}
export async function getEventById(id: string) {
  const db = await getClient()

  const collection = db.collection<EventDocument>('events')
  const event = await collection.findOne({ id: id })

  if (!event) {
    throw new EventNotFoundError(id)
  }

  return event
}

export async function deleteEvent(
  eventId: string,
  { token }: { token: string }
) {
  const db = await getClient()

  const collection = db.collection<EventDocument>('events')
  const event = await collection.findOne({ id: eventId })

  if (!event) {
    throw new EventNotFoundError(eventId)
  }

  const hasNonDeletableActions = !isUndeclaredDraft(event)

  if (hasNonDeletableActions) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Event has actions that cannot be deleted'
    })
  }

  await deleteEventAttachments(token, event)

  const { id } = event
  await collection.deleteOne({ id })
  await deleteEventIndex(id)
  return { id }
}

async function deleteEventAttachments(token: string, event: EventDocument) {
  const config = await getEventConfigurations(token)

  const form = config
    .find((config) => config.id === event.type)
    ?.actions.find((action) => action.type === event.type)
    ?.forms.find((form) => form.active)

  const fieldTypes = form?.pages.flatMap((page) => page.fields)

  for (const action of event.actions) {
    for (const [key, value] of Object.entries(action.data)) {
      const isFile =
        fieldTypes?.find((field) => field.id === key)?.type === 'FILE'

      const fileValue = FileFieldValue.safeParse(value)

      if (!isFile || !fileValue.success || !fileValue.data) {
        continue
      }

      await deleteFile(fileValue.data.filename, token)
    }
  }
}

export async function createEvent({
  eventInput,
  createdAtLocation,
  createdBy,
  transactionId
}: {
  eventInput: z.infer<typeof EventInput>
  createdBy: string
  createdAtLocation: string
  transactionId: string
}) {
  const existingEvent = await getEventByTransactionId(transactionId)

  if (existingEvent) {
    return existingEvent
  }

  const db = await getClient()
  const collection = db.collection<EventDocument>('events')

  const now = new Date().toISOString()
  const id = getUUID()

  await collection.insertOne({
    ...eventInput,
    id,
    transactionId,
    createdAt: now,
    updatedAt: now,
    actions: [
      {
        type: ActionType.CREATE,
        createdAt: now,
        createdBy,
        createdAtLocation,
        draft: false,
        data: {}
      }
    ]
  } satisfies EventDocument)

  const event = await getEventById(id)
  await indexEvent(event)

  return event
}

export async function addAction(
  input: ActionInputWithType,
  {
    eventId,
    createdBy,
    token,
    createdAtLocation
  }: {
    eventId: string
    createdBy: string
    createdAtLocation: string
    token: string
  }
) {
  const db = await getClient()
  const now = new Date().toISOString()
  const event = await getEventById(eventId)

  const config = await getEventConfigurations(token)

  const form = config
    .find((config) => config.id === event.type)
    ?.actions.find((action) => action.type === input.type)
    ?.forms.find((form) => form.active)

  const fieldTypes = form?.pages.flatMap((page) => page.fields)

  for (const [key, value] of Object.entries(input.data)) {
    const isFile =
      fieldTypes?.find((field) => field.id === key)?.type === 'FILE'

    const fileValue = FileFieldValue.safeParse(value)

    if (!isFile || !fileValue.success) {
      continue
    }

    if (fileValue.data && !(await fileExists(fileValue.data.filename, token))) {
      throw new Error(`File not found: ${fileValue.data.filename}`)
    }
  }

  await db.collection<EventDocument>('events').updateOne(
    {
      id: eventId
    },
    {
      $push: {
        actions: {
          ...input,
          createdBy,
          createdAt: now,
          createdAtLocation,
          draft: input.draft || false
        }
      },
      $set: {
        updatedAt: now
      }
    }
  )

  const updatedEvent = await getEventById(eventId)
  await indexEvent(updatedEvent)
  return updatedEvent
}

export async function patchEvent(eventInput: EventInputWithId) {
  const existingEvent = await getEventById(eventInput.id)

  if (!existingEvent) {
    throw new EventNotFoundError(eventInput.id)
  }

  const db = await getClient()
  const collection = db.collection<EventDocument>('events')

  const now = new Date().toISOString()

  await collection.updateOne(
    {
      id: eventInput.id
    },
    {
      $set: {
        ...eventInput,
        updatedAt: now
      }
    }
  )

  const event = await getEventById(existingEvent.id)
  await indexEvent(event)

  return event
}
