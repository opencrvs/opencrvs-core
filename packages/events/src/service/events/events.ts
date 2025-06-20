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

import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import {
  ActionDocument,
  ActionInputWithType,
  ActionStatus,
  ActionUpdate,
  Draft,
  EventDocument,
  EventInput,
  FieldConfig,
  FieldType,
  FieldUpdateValue,
  FileFieldValue,
  getDeclarationFields,
  getAcceptedActions,
  AsyncRejectActionDocument,
  ActionType,
  EventStatus,
  isWriteAction,
  getStatusFromActions,
  EventConfig
} from '@opencrvs/commons/events'
import { getUUID, TokenUserType } from '@opencrvs/commons'
import { getEventConfigurationById } from '@events/service/config/config'
import { deleteFile, fileExists } from '@events/service/files'
import { deleteEventIndex, indexEvent } from '@events/service/indexing/indexing'
import * as events from '@events/storage/mongodb/events'
import { TrpcUserContext } from '@events/context'
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

async function deleteEventAttachments(token: string, event: EventDocument) {
  const configuration = await getEventConfigurationById({
    token,
    eventType: event.type
  })

  const actions = getAcceptedActions(event)
  // @TODO: Check that this works after making sure data incldues only declaration fields.
  const fieldConfigs = getDeclarationFields(configuration)
  for (const ac of actions) {
    for (const [key, value] of Object.entries(ac.declaration)) {
      const fileValue = getValidFileValue(key, value, fieldConfigs)

      if (!fileValue) {
        continue
      }

      await deleteFile(fileValue.filename, token)
    }
  }
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

  const eventStatus = getStatusFromActions(event.actions)

  // Once an event is declared or notified, it can not be deleted anymore
  if (eventStatus !== EventStatus.enum.CREATED) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'A declared or notified event can not be deleted'
    })
  }

  const { id } = event
  await deleteEventAttachments(token, event)
  await deleteEventIndex(event)
  await deleteDraftsByEventId(id)
  await collection.deleteOne({ id })

  return { id }
}

const TRACKING_ID_LENGTH = 6
const TRACKING_ID_CHARACTERS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'

export function generateTrackingId(): string {
  let result = ''
  for (let i = 0; i < TRACKING_ID_LENGTH; i++) {
    const randomIndex = Math.floor(
      Math.random() * TRACKING_ID_CHARACTERS.length
    )
    result += TRACKING_ID_CHARACTERS[randomIndex]
  }
  return result
}

type EventDocumentWithTransactionId = EventDocument & { transactionId: string }

export async function createEvent({
  eventInput,
  user,
  transactionId,
  config
}: {
  eventInput: z.infer<typeof EventInput>
  user: TrpcUserContext
  transactionId: string
  config: EventConfig
}): Promise<EventDocument> {
  const existingEvent = await getEventByTransactionId(transactionId)

  if (existingEvent) {
    return existingEvent
  }

  const db = await events.getClient()
  const collection = db.collection<EventDocumentWithTransactionId>('events')

  const now = new Date().toISOString()
  const id = getUUID()
  const trackingId = generateTrackingId()

  const createdByDetails = {
    createdBy: user.id,
    createdByUserType: user.type,
    createdByRole: user.role,
    createdAtLocation: user.primaryOfficeId,
    createdBySignature: user.signature
  }

  await collection.insertOne({
    ...eventInput,
    id,
    transactionId,
    createdAt: now,
    updatedAt: now,
    trackingId,
    actions: [
      {
        ...createdByDetails,
        type: ActionType.CREATE,
        createdAt: now,
        id: getUUID(),
        declaration: {},
        status: ActionStatus.Accepted,
        transactionId: getUUID()
      }
    ]
  })

  // System users don't use assignment
  if (user.type !== TokenUserType.enum.system) {
    const action: ActionDocument = {
      ...createdByDetails,
      type: ActionType.ASSIGN,
      assignedTo: createdByDetails.createdBy,
      declaration: {},
      createdAt: now,
      id,
      status: ActionStatus.Accepted,
      transactionId: getUUID()
    }

    await db
      .collection<EventDocument>('events')
      .updateOne(
        { id },
        { $push: { actions: action }, $set: { updatedAt: now } }
      )
  }

  const event = await getEventById(id)
  await indexEvent(event, config)

  return event
}

function extractFileValues(
  data: ActionUpdate,
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
    .map((draft) => extractFileValues(draft.action.declaration, fieldConfigs))
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
    user,
    token,
    status
  }: {
    eventId: string
    user: TrpcUserContext
    token: string
    status: ActionStatus
  },
  actionId = getUUID()
): Promise<EventDocument> {
  const db = await events.getClient()
  const now = new Date().toISOString()
  const event = await getEventById(eventId)
  const configuration = await getEventConfigurationById({
    token,
    eventType: event.type
  })

  // @TODO: Check that this works after making sure data incldues only declaration fields.
  const fieldConfigs = getDeclarationFields(configuration)
  const fileValuesInCurrentAction = extractFileValues(
    input.declaration,
    fieldConfigs
  )

  for (const file of fileValuesInCurrentAction) {
    if (!(await fileExists(file.file.filename, token))) {
      throw new Error(`File not found: ${file.file.filename}`)
    }
  }

  const createdByDetails = {
    createdBy: user.id,
    createdByUserType: user.type,
    createdByRole: user.role,
    createdAtLocation: user.primaryOfficeId,
    createdBySignature: user.signature
  }

  if (input.type === ActionType.ARCHIVE && input.reason.isDuplicate) {
    await db.collection<EventDocument>('events').updateOne(
      {
        id: eventId,
        'actions.transactionId': {
          $ne: input.transactionId
        }
      },
      {
        $push: {
          actions: {
            ...input,
            ...createdByDetails,
            transactionId: getUUID(),
            type: ActionType.MARKED_AS_DUPLICATE,
            createdAt: now,
            id: getUUID(),
            status
          }
        },
        $set: {
          updatedAt: now
        }
      }
    )
  }

  const action: ActionDocument = {
    ...input,
    ...createdByDetails,
    createdAt: now,
    id: actionId,
    status: status
  }

  await db
    .collection<EventDocument>('events')
    .updateOne(
      { id: eventId, 'actions.transactionId': { $ne: input.transactionId } },
      { $push: { actions: action }, $set: { updatedAt: now } }
    )

  // We want to unassign only if:
  // - Action is a write action, since we dont want to unassign from e.g. READ action
  // - Keep assignment is false
  // - User is not a system user, since system users dont partake in assignment
  const shouldUnassign =
    isWriteAction(input.type) &&
    !input.keepAssignment &&
    user.type !== TokenUserType.enum.system

  if (shouldUnassign) {
    await db.collection<EventDocument>('events').updateOne(
      { id: eventId },
      {
        $push: {
          actions: {
            ...createdByDetails,
            transactionId: getUUID(),
            type: ActionType.UNASSIGN,
            declaration: {},
            assignedTo: null,
            createdAt: now,
            id: getUUID(), // use a new UUID for unassign action
            status: ActionStatus.Accepted
          }
        },
        $set: { updatedAt: now }
      }
    )
  }

  const drafts = await getDraftsForAction(
    eventId,
    createdByDetails.createdBy,
    input.type
  )

  await cleanUnreferencedAttachmentsFromPreviousDrafts(
    token,
    fieldConfigs,
    fileValuesInCurrentAction,
    drafts
  )

  const updatedEvent = await getEventById(eventId)

  if (action.type !== ActionType.READ) {
    await indexEvent(updatedEvent, configuration)

    if (action.type !== ActionType.ASSIGN) {
      await deleteDraftsByEventId(eventId)
    }
  }

  return updatedEvent
}

type AsyncRejectActionInput = Omit<
  z.infer<typeof AsyncRejectActionDocument>,
  'createdAt' | 'id' | 'status'
> & { transactionId: string; eventId: string; token: string; eventType: string }

export async function addAsyncRejectAction({
  token,
  eventType,
  ...input
}: AsyncRejectActionInput) {
  const db = await events.getClient()
  const now = new Date().toISOString()
  const { transactionId, eventId } = input

  const configuration = await getEventConfigurationById({
    token,
    eventType
  })

  const action = {
    ...input,
    createdAt: now,
    id: getUUID(),
    status: ActionStatus.Rejected
  } satisfies AsyncRejectActionDocument

  await db
    .collection<EventDocument>('events')
    .updateOne(
      { id: eventId, 'actions.transactionId': { $ne: transactionId } },
      { $push: { actions: action }, $set: { updatedAt: now } }
    )

  const updatedEvent = await getEventById(eventId)
  await indexEvent(updatedEvent, configuration)
  await deleteDraftsByEventId(eventId)

  return updatedEvent
}
