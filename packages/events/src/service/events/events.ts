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
  Draft,
  EventDocument,
  EventInput,
  FieldConfig,
  FieldType,
  FieldUpdateValue,
  FileFieldValue,
  isUndeclaredDraft
} from '@opencrvs/commons/events'
import {
  getActionFormFields,
  notifyOnAction
} from '@events/service/config/config'
import { deleteFile, fileExists } from '@events/service/files'
import { deleteEventIndex, indexEvent } from '@events/service/indexing/indexing'
import * as events from '@events/storage/mongodb/events'
import { ActionType, getUUID } from '@opencrvs/commons'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { deleteDraftsByEventId, getDraftsForAction } from './drafts'

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

export async function getEventById(id: string): Promise<EventDocument> {
  const db = await events.getClient()

  const collection = db.collection<EventDocument>('events')
  const event = await collection.findOne<Omit<EventDocument, '_id'>>(
    { id: id },
    { projection: { _id: 0 } }
  )

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

  const { id } = event
  await deleteEventAttachments(token, event)
  await deleteEventIndex(event)
  await deleteDraftsByEventId(id)
  await collection.deleteOne({ id })

  return { id }
}

async function deleteEventAttachments(token: string, event: EventDocument) {
  for (const ac of event.actions) {
    const fieldConfigs = await getActionFormFields({
      token,
      eventType: event.type,
      action: ac.type
    })
    for (const [key, value] of Object.entries(ac.data)) {
      const fileValue = getValidFileValue(key, value, fieldConfigs)

      if (!fileValue) {
        continue
      }

      await deleteFile(fileValue.filename, token)
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
        id: getUUID(),
        data: {}
      }
    ]
  })

  const event = await getEventById(id)
  await indexEvent(event)

  return event
}

function getValidFileValue(
  fieldKey: string,
  fieldValue: FieldUpdateValue,
  fieldTypes: Array<{ id: string; type: FieldType }>
) {
  const isFileType =
    fieldTypes.find((field) => field.id === fieldKey)?.type === FieldType.FILE
  const validFieldValue = FileFieldValue.safeParse(fieldValue)
  if (!isFileType || !validFieldValue.success) {
    return undefined
  }
  return validFieldValue.data
}

function extractFileValues(
  data: ActionDocument['data'],
  fieldTypes: Array<{ id: string; type: FieldType }>
): Array<{ fieldName: string; file: FileFieldValue }> {
  const fileValues: Array<{ fieldName: string; file: FileFieldValue }> = []
  for (const [key, value] of Object.entries(data)) {
    const validFileValue = getValidFileValue(key, value, fieldTypes)
    if (!validFileValue) {
      continue
    }

    fileValues.push({
      file: validFileValue,
      fieldName: key
    })
  }
  return fileValues
}

async function cleanUnreferencedAttachmentsFromPreviousDrafts(
  token: string,
  fieldConfigs: FieldConfig[],
  fileValuesInCurrentAction: { fieldName: string; file: FileFieldValue }[],
  drafts: Draft[]
): Promise<void> {
  const previousFileValuesInDrafts = drafts
    .map((draft) => extractFileValues(draft.action.data, fieldConfigs))
    .flat()

  for (const previousFileValue of previousFileValuesInDrafts) {
    if (
      !fileValuesInCurrentAction.some(
        (curr) =>
          curr.fieldName === previousFileValue.fieldName &&
          curr.file.filename === previousFileValue.file.filename
      )
    ) {
      await deleteFile(previousFileValue.file.filename, token)
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
  const fieldConfigs = await getActionFormFields({
    token,
    eventType: event.type,
    action: input.type
  })
  const fileValuesInCurrentAction = extractFileValues(input.data, fieldConfigs)

  for (const file of fileValuesInCurrentAction) {
    if (!(await fileExists(file.file.filename, token))) {
      throw new Error(`File not found: ${file.file.filename}`)
    }
  }

  if (input.type === ActionType.ARCHIVED && input.metadata?.isDuplicate) {
    input.transactionId = getUUID()
    await db.collection<EventDocument>('events').updateOne(
      {
        id: eventId,
        'actions.transactionId': { $nin: [transactionId, input.transactionId] }
      },
      {
        $push: {
          actions: {
            ...input,
            type: ActionType.MARKED_AS_DUPLICATE,
            createdBy,
            createdAt: now,
            createdAtLocation,
            id: getUUID()
          }
        },
        $set: {
          updatedAt: now
        }
      }
    )
    input.transactionId = transactionId
  }

  const action: ActionDocument = {
    ...input,
    createdBy,
    createdAt: now,
    createdAtLocation,
    id: getUUID()
  }

  await db
    .collection<EventDocument>('events')
    .updateOne(
      { id: eventId, 'actions.transactionId': { $ne: transactionId } },
      { $push: { actions: action }, $set: { updatedAt: now } }
    )

  const drafts = await getDraftsForAction(eventId, createdBy, input.type)

  await cleanUnreferencedAttachmentsFromPreviousDrafts(
    token,
    fieldConfigs,
    fileValuesInCurrentAction,
    drafts
  )

  const updatedEvent = await getEventById(eventId)
  await indexEvent(updatedEvent)
  await notifyOnAction(input, updatedEvent, token)
  await deleteDraftsByEventId(eventId)

  return updatedEvent
}
