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
  EventIndex,
  EventInput,
  FileFieldValue,
  getCurrentEventState,
  isUndeclaredDraft
} from '@opencrvs/commons/events'

import {
  getEventConfigurations,
  notifyOnAction
} from '@events/service/config/config'
import { searchForDuplicates } from '@events/service/deduplication/deduplication'
import { deleteFile, fileExists } from '@events/service/files'
import { deleteEventIndex, indexEvent } from '@events/service/indexing/indexing'
import * as events from '@events/storage/mongodb/events'
import { ActionType, getUUID } from '@opencrvs/commons'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

export const EventInputWithId = EventInput.extend({
  id: z.string()
})

export type EventInputWithId = z.infer<typeof EventInputWithId>

async function getEventByTransactionId(transactionId: string) {
  const db = await events.getClient()
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
  const db = await events.getClient()

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
  const db = await events.getClient()

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
  await deleteEventIndex(event)
  return { id }
}

async function deleteEventAttachments(token: string, event: EventDocument) {
  const config = await getEventConfigurations(token)

  const form = config
    .find((c) => c.id === event.type)
    ?.actions.find((action) => action.type === event.type)
    ?.forms.find((f) => f.active)

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
}): Promise<EventDocument> {
  const existingEvent = await getEventByTransactionId(transactionId)

  if (existingEvent) {
    return existingEvent
  }

  const db = await events.getClient()
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
  const db = await events.getClient()
  const now = new Date().toISOString()
  const event = await getEventById(eventId)

  const config = await getEventConfigurations(token)

  const form = config
    .find((c) => c.id === event.type)
    ?.actions.find((action) => action.type === input.type)
    ?.forms.find((f) => f.active)

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
  await notifyOnAction(input, updatedEvent, token)
  return updatedEvent
}

export async function validate(
  input: Omit<Extract<ActionInputWithType, { type: 'VALIDATE' }>, 'duplicates'>,
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
  const config = await getEventConfigurations(token)
  const storedEvent = await getEventById(eventId)
  const form = config.find((c) => c.id === storedEvent.type)

  if (!form) {
    throw new Error(`Form not found with event type: ${storedEvent.type}`)
  }

  let duplicates: EventIndex[] = []

  const futureEventState = getCurrentEventState({
    ...storedEvent,
    actions: [
      ...storedEvent.actions,
      {
        ...input,
        createdAt: new Date().toISOString(),
        createdBy,
        createdAtLocation
      }
    ]
  })

  const resultsFromAllRules = await Promise.all(
    form.deduplication.map(async (deduplication) => {
      const matches = await searchForDuplicates(futureEventState, deduplication)
      return matches
    })
  )

  duplicates = resultsFromAllRules
    .flat()
    .sort((a, b) => b.score - a.score)
    .filter((hit): hit is { score: number; event: EventIndex } => !!hit.event)
    .map((hit) => hit.event)
    .filter((event, index, self) => {
      return self.findIndex((t) => t.id === event.id) === index
    })

  const event = await addAction(
    { ...input, duplicates: duplicates.map((d) => d.id) },
    {
      eventId,
      createdBy,
      token,
      createdAtLocation
    }
  )
  return event
}

export async function patchEvent(eventInput: EventInputWithId) {
  const existingEvent = await getEventById(eventInput.id)

  const db = await events.getClient()
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
