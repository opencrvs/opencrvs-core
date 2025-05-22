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
  getCurrentEventState,
  EventStatus,
  isWriteAction
} from '@opencrvs/commons/events'
import { UUID } from '@opencrvs/commons'
import { getEventConfigurationById } from '@events/service/config/config'
import { deleteFile, fileExists } from '@events/service/files'
import { deleteEventIndex, indexEvent } from '@events/service/indexing/indexing'
import * as eventsDb from '@events/storage/postgres/events'
import { deleteDraftsByEventId, getDraftsForAction } from './drafts'

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

export async function deleteEvent(eventId: UUID, { token }: { token: string }) {
  const event = await eventsDb.getEventById(eventId)
  const eventState = getCurrentEventState(event)

  // Once an event is declared or notified, it can not be deleted anymore
  if (eventState.status !== EventStatus.CREATED) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'A declared or notified event can not be deleted'
    })
  }

  const { id } = event
  await deleteEventAttachments(token, event)
  await deleteEventIndex(event)
  await deleteDraftsByEventId(id)
  await eventsDb.deleteEventById(id)

  return { id }
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

export async function createEvent({
  eventInput,
  createdAtLocation,
  createdBy,
  createdByRole,
  transactionId
}: {
  eventInput: z.infer<typeof EventInput>
  createdBy: string
  createdByRole: string
  createdAtLocation: string
  transactionId: string
}): Promise<EventDocument> {
  const event = await eventsDb.getOrCreateEvent({
    type: eventInput.type,
    fieldId: eventInput.dateOfEvent?.fieldId,
    transactionId: transactionId,
    trackingId: generateTrackingId(),
    createdBy,
    createdByRole,
    createdAtLocation
  })

  await indexEvent(event)

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
    createdBy,
    createdByRole,
    token,
    createdAtLocation,
    status
  }: {
    eventId: UUID
    createdBy: string
    createdByRole: string
    /**
     * The location where the action was created. This is used for auditing purposes.
     */
    createdAtLocation: UUID
    token: string
    transactionId: string
    status: ActionStatus
  }
): Promise<EventDocument> {
  const db = await getClient()
  const event = await eventsDb.getEventById(eventId)
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

  if (input.type === ActionType.ARCHIVE && input.annotation?.isDuplicate) {
    await db.query(sql.typeAlias('void')`
      INSERT INTO
        event_actions (
          transaction_id,
          event_id,
          action_type,
          declaration,
          annotation,
          status,
          original_action_id,
          created_by,
          created_by_role,
          created_at_location
        )
      VALUES
        (
          gen_random_uuid (),
          ${eventId},
          ${ActionType.MARKED_AS_DUPLICATE},
          ${sql.jsonb(input.declaration)},
          ${sql.jsonb(input.annotation)},
          ${status}::action_status,
          ${input.originalActionId ?? null}::uuid,
          ${createdBy},
          ${createdByRole},
          ${createdAtLocation}::uuid
        )
      ON CONFLICT (transaction_id) DO NOTHING
    `)
  }

  await db.query(sql.typeAlias('void')`
    INSERT INTO
      event_actions (
        transaction_id,
        event_id,
        action_type,
        declaration,
        annotation,
        status,
        original_action_id,
        created_by,
        created_by_role,
        created_at_location
      )
    VALUES
      (
        gen_random_uuid (),
        ${eventId},
        ${status},
        ${sql.jsonb(input.declaration)},
        ${sql.jsonb(input.annotation)},
        ${status}::action_status,
        ${input.originalActionId ?? null}::uuid,
        ${createdBy},
        ${createdByRole},
        ${createdAtLocation}::uuid
      )
    ON CONFLICT (transaction_id) DO NOTHING
  `)

  if (isWriteAction(input.type) && !input.keepAssignment) {
    await db.query(sql.typeAlias('void')`
      INSERT INTO
        event_actions (
          transaction_id,
          event_id,
          action_type,
          declaration,
          annotation,
          status,
          original_action_id,
          created_by,
          created_by_role,
          created_at_location
        )
      VALUES
        (
          gen_random_uuid (),
          ${eventId},
          ${ActionType.UNASSIGN},
          '{}'::jsonb,
          '{}'::jsonb,
          ${status}::action_status,
          NULL,
          ${createdBy},
          ${createdByRole},
          ${createdAtLocation}::uuid
        )
    `)
  }

  const drafts = await getDraftsForAction(eventId, createdBy, input.type)

  await cleanUnreferencedAttachmentsFromPreviousDrafts(
    token,
    fieldConfigs,
    fileValuesInCurrentAction,
    drafts
  )

  const updatedEvent = await eventsDb.getEventById(eventId)

  if (input.type !== ActionType.READ) {
    await indexEvent(updatedEvent)

    if (input.type !== ActionType.ASSIGN) {
      await deleteDraftsByEventId(eventId)
    }
  }

  return updatedEvent
}

type AsyncRejectActionInput = Omit<
  z.infer<typeof AsyncRejectActionDocument>,
  'createdAt' | 'id' | 'status'
> & { transactionId: string; eventId: UUID }

export async function addAsyncRejectAction(input: AsyncRejectActionInput) {
  const db = await getClient()
  const { transactionId, eventId } = input

  await db.query(sql.typeAlias('void')`
    INSERT INTO
      event_actions (
        event_id,
        transaction_id,
        action_type,
        status,
        original_action_id,
        created_by,
        created_by_role,
        created_at_location
      )
    VALUES
      (
        ${eventId},
        ${transactionId},
        ${input.type},
        ${ActionStatus.Rejected}::action_status,
        ${input.originalActionId ?? null}::uuid,
        ${input.createdBy},
        ${input.createdByRole},
        ${input.createdAtLocation}
      )
    ON CONFLICT (transaction_id) DO NOTHING
  `)

  const updatedEvent = await eventsDb.getEventById(eventId)
  await indexEvent(updatedEvent)
  await deleteDraftsByEventId(eventId)

  return updatedEvent
}
