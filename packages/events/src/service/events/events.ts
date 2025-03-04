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
  ActionDocument,
  ActionInputWithType,
  EventDocument,
  EventInput,
  FieldType,
  FileFieldValue,
  isUndeclaredDraft
} from '@opencrvs/commons/events'
import {
  getEventConfigurations,
  notifyOnAction
} from '@events/service/config/config'
import { deleteFile, fileExists } from '@events/service/files'
import { deleteEventIndex, indexEvent } from '@events/service/indexing/indexing'
import * as events from '@events/storage/mongodb/events'
import { ActionType, getUUID } from '@opencrvs/commons'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

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

export async function getEventTypeId(id: string) {
  const event = await getEventById(id)

  return event.type
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
  for (const ac of event.actions) {
    const fieldTypes = await getActiveFormFieldTypes(token, event, ac.type)
    for (const [key, value] of Object.entries(ac.data)) {
      const isFile =
        fieldTypes.find((field) => field.id === key)?.type === FieldType.FILE

      const fileValue = FileFieldValue.safeParse(value)

      if (!isFile || !fileValue.success) {
        continue
      }

      await deleteFile(fileValue.data.filename, token)
    }
  }
}

const TRACKING_ID_LENGTH = 6
const TRACKING_ID_CHARACTERS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'

function generateTrackingId(): string {
  let result = ''
  for (let i = 0; i < TRACKING_ID_LENGTH; i++) {
    const randomIndex = Math.floor(
      Math.random() * TRACKING_ID_CHARACTERS.length
    )
    result += TRACKING_ID_CHARACTERS[randomIndex]
  }
  return result
}

type EventDocumentWithTransActionId = EventDocument & { transactionId: string }
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
  const collection = db.collection<EventDocumentWithTransActionId>('events')

  const now = new Date().toISOString()
  const id = getUUID()
  const trackingId = generateTrackingId()

  await collection.insertOne({
    ...eventInput,
    id,
    transactionId,
    createdAt: now,
    updatedAt: now,
    trackingId,
    actions: [
      {
        type: ActionType.CREATE,
        createdAt: now,
        createdBy,
        createdAtLocation,
        draft: false,
        id: getUUID(),
        data: {}
      }
    ]
  })

  const event = await getEventById(id)
  await indexEvent(event)

  return event
}

function extractFileValues(
  data: Record<string, unknown>,
  fieldTypes: Array<{ id: string; type: string }>
): Array<{ fieldName: string; file: FileFieldValue }> {
  const fileValues: Array<{ fieldName: string; file: FileFieldValue }> = []
  for (const [key, value] of Object.entries(data)) {
    const isFile =
      fieldTypes.find((field) => field.id === key)?.type === FieldType.FILE
    const fileValue = FileFieldValue.safeParse(value)
    if (!isFile || !fileValue.success) {
      continue
    }

    fileValues.push({
      file: fileValue.data,
      fieldName: key
    })
  }
  return fileValues
}

async function getActiveFormFieldTypes(
  token: string,
  event: EventDocument,
  actionType: ActionType
) {
  const config = await getEventConfigurations(token)
  const form = config
    .find((c) => c.id === event.type)
    ?.actions.find((ac) => ac.type === actionType)
    ?.forms.find((f) => f.active)
  const fieldTypes = form?.pages.flatMap((page) => page.fields) ?? []
  return fieldTypes
}

async function cleanUnreferencedAttachmentsFromPreviousDrafts(
  token: string,
  event: EventDocument,
  action: ActionDocument
): Promise<void> {
  const previousDrafts: ActionDocument[] = []
  for (let i = event.actions.length - 1; i >= 0; i--) {
    const x = event.actions[i]
    if (x.type === action.type && x.createdBy === action.createdBy && x.draft) {
      previousDrafts.push(x)
    } else {
      break
    }
  }

  if (previousDrafts.length === 0) {
    return
  }
  const fieldTypes = await getActiveFormFieldTypes(token, event, action.type)
  const previousFileValuesInTheDrafts = previousDrafts
    .map((draft) => extractFileValues(draft.data, fieldTypes))
    .flat()
  const currentFileValuesInTheAction = extractFileValues(
    action.data,
    fieldTypes
  )

  for (const previousDraft of previousFileValuesInTheDrafts) {
    if (
      !currentFileValuesInTheAction.some(
        (curr) =>
          curr.fieldName === previousDraft.fieldName &&
          curr.file.filename === previousDraft.file.filename
      )
    ) {
      await deleteFile(previousDraft.file.filename, token)
    }
  }
}

export async function addAction(
  input: ActionInputWithType,
  {
    eventId,
    createdBy,
    token,
    createdAtLocation,
    transactionId
  }: {
    eventId: string
    createdBy: string
    createdAtLocation: string
    token: string
    transactionId: string
  }
): Promise<EventDocument> {
  const db = await events.getClient()
  const now = new Date().toISOString()
  const event = await getEventById(eventId)
  const fieldTypes = await getActiveFormFieldTypes(token, event, input.type)
  const inputFiles = extractFileValues(input.data, fieldTypes)
  for (const file of inputFiles) {
    if (!(await fileExists(file.file.filename, token))) {
      throw new Error(`File not found: ${file.file.filename}`)
    }
  }

  const action: ActionDocument = {
    ...input,
    createdBy,
    createdAt: now,
    createdAtLocation,
    draft: input.draft || false,
    id: getUUID()
  }

  await db
    .collection<EventDocument>('events')
    .updateOne(
      { id: eventId, 'actions.transactionId': { $ne: transactionId } },
      { $push: { actions: action }, $set: { updatedAt: now } }
    )

  if (!action.draft) {
    await cleanUnreferencedAttachmentsFromPreviousDrafts(token, event, action)
  }
  const updatedEvent = await getEventById(eventId)
  await indexEvent(updatedEvent)
  await notifyOnAction(input, updatedEvent, token)
  return updatedEvent
}
