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
import { NoResultError } from 'kysely'
import { z } from 'zod'
import { TokenUserType, TokenWithBearer, UUID } from '@opencrvs/commons'
import {
  ActionInputWithType,
  ActionStatus,
  ActionType,
  ActionUpdate,
  AsyncRejectActionDocument,
  DisplayableAction,
  EventConfig,
  EventDocument,
  EventInput,
  EventStatus,
  FieldType,
  FieldUpdateValue,
  FileFieldValue,
  getAcceptedActions,
  getAvailableActionsForEvent,
  getCurrentEventState,
  getDeclarationFields,
  getStatusFromActions,
  isWriteAction
} from '@opencrvs/commons/events'
import { TrpcUserContext } from '@events/context'
import { getEventConfigurationById } from '@events/service/config/config'
import {
  cleanupUnreferencedFiles,
  deleteFile,
  fileExists
} from '@events/service/files'
import { indexEvent } from '@events/service/indexing/indexing'
import * as draftsRepo from '@events/storage/postgres/events/drafts'
import * as eventsRepo from '@events/storage/postgres/events/events'

export class EventNotFoundError extends TRPCError {
  constructor(id: string) {
    super({
      code: 'NOT_FOUND',
      message: `Event not found with ID: ${id}`
    })
  }
}

/** Get event by ID. Throws tRPC HTTP 404 if event is not found */
export const getEventById = async (eventId: UUID): Promise<EventDocument> => {
  try {
    return await eventsRepo.getEventById(eventId)
  } catch (error) {
    if (error instanceof NoResultError) {
      throw new EventNotFoundError(eventId)
    }
    throw error
  }
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

async function deleteEventAttachments(
  token: TokenWithBearer,
  event: EventDocument
) {
  const configuration = await getEventConfigurationById({
    eventType: event.type,
    token
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

      await deleteFile(fileValue.path, token)
    }
  }
}

export async function throwConflictIfActionNotAllowed(
  eventId: UUID,
  actionType: ActionType,
  token: TokenWithBearer
) {
  const event = await getEventById(eventId)
  const eventConfig = await getEventConfigurationById({
    eventType: event.type,
    token
  })
  const eventIndex = getCurrentEventState(event, eventConfig)

  const allowedActions: DisplayableAction[] =
    getAvailableActionsForEvent(eventIndex)

  if (!allowedActions.includes(actionType)) {
    throw new TRPCError({
      code: 'CONFLICT',
      message: `Action '${actionType}' cannot be performed on an event in '${eventIndex.status}' state with [${eventIndex.flags.join(', ')}] flags. Available actions: ${allowedActions.join(', ')}.`
    })
  }
}

export async function deleteEvent(
  eventId: UUID,
  { token }: { token: TokenWithBearer }
) {
  const event = await getEventById(eventId)
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
  await draftsRepo.deleteDraftsByEventId(id)
  await eventsRepo.deleteEventById(id)

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
  user,
  transactionId
}: {
  eventInput: z.infer<typeof EventInput>
  user: TrpcUserContext
  transactionId: string
  config: EventConfig
}): Promise<EventDocument> {
  const isSystem = user.type === TokenUserType.enum.system

  const getOrCreateEvent = isSystem
    ? eventsRepo.getOrCreateEvent // System users create events without assignment
    : eventsRepo.getOrCreateEventAndAssign

  const event = await getOrCreateEvent({
    eventType: eventInput.type,
    transactionId: transactionId,
    trackingId: generateTrackingId(),
    createdBy: user.id,
    createdByUserType: user.type,
    createdByRole: user.role,
    createdBySignature: user.signature,
    createdAtLocation: user.primaryOfficeId
  })

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

export function buildAction(
  input: ActionInputWithType,
  status: ActionStatus,
  user: TrpcUserContext
) {
  const commonAttributes = {
    eventId: input.eventId,
    transactionId: input.transactionId,
    actionType: input.type,
    status,
    declaration: input.declaration,
    annotation: input.annotation,
    ...('content' in input ? { content: input.content } : {}),
    createdBy: user.id,
    createdByRole: user.role,
    createdByUserType: user.type,
    createdBySignature: user.signature,
    createdAtLocation:
      user.type === 'system' ? input.createdAtLocation : user.primaryOfficeId,
    originalActionId: input.originalActionId
  }
  switch (input.type) {
    case ActionType.REGISTER: {
      return {
        ...commonAttributes,
        registrationNumber: input.registrationNumber
      }
    }
    case ActionType.ASSIGN: {
      return {
        ...commonAttributes,
        status: ActionStatus.Accepted,
        assignedTo: user.id
      }
    }
    case ActionType.UNASSIGN: {
      return {
        ...commonAttributes,
        status: ActionStatus.Accepted
      }
    }
    case ActionType.APPROVE_CORRECTION: {
      return {
        ...commonAttributes,
        requestId: input.requestId
      }
    }
    case ActionType.REJECT_CORRECTION: {
      return {
        ...commonAttributes,
        requestId: input.requestId
      }
    }
    case ActionType.REJECT:
    case ActionType.ARCHIVE:
    case ActionType.PRINT_CERTIFICATE:
    case ActionType.READ:
    case ActionType.CREATE:
    case ActionType.NOTIFY:
    case ActionType.DECLARE:
    case ActionType.VALIDATE:
    case ActionType.DUPLICATE_DETECTED:
    case ActionType.MARK_AS_NOT_DUPLICATE:
    case ActionType.MARK_AS_DUPLICATE:
    case ActionType.REQUEST_CORRECTION: {
      return {
        ...commonAttributes
      }
    }
  }
}

/**
 * Persists a new action for an event in the database.
 *
 * @param input - The action payload including type and related data.
 * @param options - Context for the action being added.
 * @param options.event - The event document the action belongs to.
 * @param options.user - The user performing the action.
 * @param options.token - Authentication token of the user.
 * @param options.status - The resulting status of the action e.g - Accepted, Requested.
 * @param options.configuration - Event configuration.
 *
 * @returns The updated event document with the new action included.
 */
export async function addAction(
  input: ActionInputWithType,
  {
    event,
    user,
    token,
    status,
    configuration
  }: {
    event: EventDocument
    user: TrpcUserContext
    token: TokenWithBearer
    status: ActionStatus
    configuration: EventConfig
  }
): Promise<EventDocument> {
  const eventId = event.id
  // @TODO: Check that this works after making sure data incldues only declaration fields.
  const fieldConfigs = getDeclarationFields(configuration)
  const fileValuesInCurrentAction = extractFileValues(
    input.declaration,
    fieldConfigs
  )

  for (const file of fileValuesInCurrentAction) {
    if (!(await fileExists(file.file.path, token))) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: `File not found: ${file.file.path}`
      })
    }
  }

  await eventsRepo.createAction(buildAction(input, status, user))

  // We want to unassign only if:
  // - ActionStatus is not requested
  // - Action is a write action, since we dont want to unassign from e.g. READ action
  // - Keep assignment is false
  // - User is not a system user, since system users dont partake in assignment
  const shouldUnassign =
    status !== ActionStatus.Requested &&
    isWriteAction(input.type) &&
    !input.keepAssignment &&
    user.type !== TokenUserType.enum.system

  if (shouldUnassign) {
    await eventsRepo.createAction(
      buildAction(
        {
          eventId: input.eventId,
          transactionId: input.transactionId,
          type: ActionType.UNASSIGN,
          declaration: {},
          assignedTo: null
        },
        ActionStatus.Accepted,
        user
      )
    )
  }

  const updatedEvent = await getEventById(eventId)

  if (input.type !== ActionType.READ && input.type !== ActionType.ASSIGN) {
    await draftsRepo.deleteDraftsByEventId(input.eventId)
  }

  await cleanupUnreferencedFiles(updatedEvent, token)

  return updatedEvent
}

function isEventIndexable(event: EventDocument) {
  return getStatusFromActions(event.actions) !== EventStatus.enum.CREATED
}

export async function ensureEventIndexed(
  event: EventDocument,
  configuration: EventConfig
) {
  if (isEventIndexable(event)) {
    await indexEvent(event, configuration)
  }
}

/**
 * Processes an action on an event:
 *  - Adds the given action to the event
 *  - Updates the event state accordingly
 *  - Record an event in the database
 *  - Indexes the event in Elasticsearch if it is no longer a draft
 *
 * Returns the updated event document.
 */
export async function processAction(
  input: ActionInputWithType,
  {
    event,
    user,
    token,
    status,
    configuration
  }: {
    event: EventDocument
    user: TrpcUserContext
    token: TokenWithBearer
    status: ActionStatus
    configuration: EventConfig
  }
): Promise<EventDocument> {
  const updatedEvent = await addAction(input, {
    event,
    user,
    token,
    status,
    configuration
  })

  // Only send the event to Elasticsearch if it is not a draft
  await ensureEventIndexed(updatedEvent, configuration)
  return updatedEvent
}

type AsyncRejectActionInput = Omit<
  z.infer<typeof AsyncRejectActionDocument>,
  'createdAt' | 'id' | 'status'
> & {
  transactionId: string
  eventId: UUID
  originalActionId: UUID
  createdAtLocation?: UUID
  createdByUserType: TokenUserType
  token: TokenWithBearer
  eventType: string
}

export async function addAsyncRejectAction({
  transactionId,
  eventId,
  type,
  originalActionId,
  createdBy,
  createdByRole,
  createdByUserType,
  createdAtLocation,
  eventType,
  token
}: AsyncRejectActionInput) {
  const configuration = await getEventConfigurationById({
    eventType,
    token
  })

  await eventsRepo.createAction({
    eventId,
    transactionId,
    actionType: type,
    status: ActionStatus.Rejected,
    originalActionId,
    createdBy,
    createdByRole,
    createdByUserType,
    createdAtLocation
  })

  const updatedEvent = await getEventById(eventId)
  await indexEvent(updatedEvent, configuration)
  await draftsRepo.deleteDraftsByEventId(eventId)

  return updatedEvent
}
