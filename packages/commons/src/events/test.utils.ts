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
import { merge, omitBy, isString } from 'lodash'
import { tennisClubMembershipEvent } from '../fixtures'
import { getUUID } from '../uuid'
import { ActionBase, ActionDocument, ActionUpdate } from './ActionDocument'
import {
  ArchiveActionInput,
  DeclareActionInput,
  RegisterActionInput,
  RejectDeclarationActionInput,
  RequestCorrectionActionInput,
  ValidateActionInput
} from './ActionInput'
import { ActionType, DeclarationUpdateActions } from './ActionType'
import { Draft } from './Draft'
import { EventConfig } from './EventConfig'
import { EventDocument } from './EventDocument'
import { EventIndex } from './EventIndex'
import { EventInput } from './EventInput'
import { mapFieldTypeToMockValue } from './FieldTypeMapping'
import {
  findActiveActionPages,
  getActionMetadataFields,
  getActiveDeclarationFields,
  isPageVisible,
  isVerificationPage,
  stripHiddenFields
} from './utils'
import { FieldValue } from './FieldValue'
import { TranslationConfig } from './TranslationConfig'
import { FieldConfig } from './FieldConfig'
import { ActionConfig } from './ActionConfig'

function fieldConfigsToActionPayload(fields: FieldConfig[]) {
  return fields.reduce(
    (acc, field, i) => ({
      ...acc,
      [field.id]: mapFieldTypeToMockValue(field, i)
    }),
    {}
  )
}

export function generateActionInput(
  configuration: EventConfig,
  action: ActionType
) {
  const parsed = DeclarationUpdateActions.safeParse(action)
  if (parsed.success) {
    const fields = getActiveDeclarationFields(configuration)

    const data = fieldConfigsToActionPayload(fields)

    // Strip away hidden or disabled fields from mock action data
    // If this is not done, the mock data might contain hidden or disabled fields, which will cause validation errors
    return stripHiddenFields(fields, data)
  }

  // eslint-disable-next-line no-console
  console.warn(`${action} is not a declaration action. Setting data as {}.`)

  return {}
}

export function generateActionMetadataInput(
  configuration: EventConfig,
  action: ActionType
) {
  const actionConfig: ActionConfig | undefined = configuration.actions.find(
    (actionConfig) => actionConfig.type === action
  )

  const metadataFields = actionConfig
    ? getActionMetadataFields(actionConfig)
    : []

  const metadata = fieldConfigsToActionPayload(metadataFields)

  const visibleVerificationPageIds =
    (findActiveActionPages(configuration, action) ?? [])
      .filter((page) => isVerificationPage(page))
      .filter((page) => isPageVisible(page, metadata))
      .map((page) => page.id) ?? []

  const visiblePageVerificationMap = visibleVerificationPageIds.reduce(
    (acc, pageId) => ({
      ...acc,
      [pageId]: true
    }),
    {}
  )

  const fieldBasedPayload = stripHiddenFields(metadataFields, metadata)

  return {
    ...fieldBasedPayload,
    ...visiblePageVerificationMap
  }
}

export const eventPayloadGenerator = {
  create: (input: Partial<EventInput> = {}) => ({
    transactionId: input.transactionId ?? getUUID(),
    type: input.type ?? 'TENNIS_CLUB_MEMBERSHIP'
  }),
  patch: (id: string, input: Partial<EventInput> = {}) => ({
    transactionId: input.transactionId ?? getUUID(),
    type: input.type ?? 'TENNIS_CLUB_MEMBERSHIP',
    id
  }),
  draft: (eventId: string, input: Partial<Draft> = {}) =>
    merge(
      {
        id: getUUID(),
        eventId,
        createdAt: new Date().toISOString(),
        transactionId: getUUID(),
        action: {
          type: ActionType.REQUEST_CORRECTION,
          data: {
            'applicant.firstname': 'Max',
            'applicant.surname': 'McLaren',
            'applicant.dob': '2020-01-02',
            'recommender.none': true
          },
          metadata: {
            'correction.requester.relationship': 'ANOTHER_AGENT',
            'correction.request.reason': "Child's name was incorrect"
          },
          createdAt: new Date().toISOString(),
          createdBy: '@todo',
          createdAtLocation: '@todo'
        }
      },
      input
    ),
  actions: {
    declare: (
      eventId: string,
      input: Partial<
        Pick<DeclareActionInput, 'transactionId' | 'data' | 'metadata'>
      > = {}
    ) => ({
      type: ActionType.DECLARE,
      transactionId: input.transactionId ?? getUUID(),
      data:
        input.data ??
        generateActionInput(tennisClubMembershipEvent, ActionType.DECLARE),
      metadata:
        input.metadata ??
        generateActionMetadataInput(
          tennisClubMembershipEvent,
          ActionType.DECLARE
        ),
      eventId
    }),
    /**
     * Notify allows sending incomplete data. Think it as 'partial declare' for now.
     */
    notify: (
      eventId: string,
      input: {
        transactionId?: string
        data?: Partial<ActionUpdate>
      } = {}
    ) => {
      let data = input.data
      if (!data) {
        const declaration = generateActionInput(
          tennisClubMembershipEvent,
          ActionType.DECLARE
        )

        // Remove some fields to simulate incomplete data
        data = omitBy(declaration, isString)
      }

      return {
        type: ActionType.NOTIFY,
        transactionId: input.transactionId ?? getUUID(),
        data,
        eventId
      }
    },
    validate: (
      eventId: string,
      input: Partial<
        Pick<ValidateActionInput, 'transactionId' | 'data' | 'metadata'>
      > = {}
    ) => ({
      type: ActionType.VALIDATE,
      transactionId: input.transactionId ?? getUUID(),
      data:
        input.data ??
        generateActionInput(tennisClubMembershipEvent, ActionType.VALIDATE),
      metadata:
        input.metadata ??
        generateActionMetadataInput(
          tennisClubMembershipEvent,
          ActionType.VALIDATE
        ),
      duplicates: [],
      eventId
    }),
    archive: (
      eventId: string,
      input: Partial<Pick<ArchiveActionInput, 'transactionId' | 'data'>> = {},
      isDuplicate?: boolean
    ) => ({
      type: ActionType.ARCHIVE,
      transactionId: input.transactionId ?? getUUID(),
      data: {},
      // @TODO: Check whether generator is needed?
      metadata: { isDuplicate: isDuplicate ?? false },
      duplicates: [],
      eventId
    }),
    reject: (
      eventId: string,
      input: Partial<
        Pick<RejectDeclarationActionInput, 'transactionId' | 'metadata'>
      > = {}
    ) => ({
      type: ActionType.REJECT,
      transactionId: input.transactionId ?? getUUID(),
      data: {},
      metadata:
        input.metadata ??
        generateActionMetadataInput(
          tennisClubMembershipEvent,
          ActionType.REJECT
        ),
      duplicates: [],
      eventId
    }),
    register: (
      eventId: string,
      input: Partial<
        Pick<RegisterActionInput, 'transactionId' | 'data' | 'metadata'>
      > = {}
    ) => ({
      type: ActionType.REGISTER,
      transactionId: input.transactionId ?? getUUID(),
      data:
        input.data ??
        generateActionInput(tennisClubMembershipEvent, ActionType.REGISTER),
      metadata:
        input.metadata ??
        generateActionMetadataInput(
          tennisClubMembershipEvent,
          ActionType.REGISTER
        ),
      eventId
    }),
    printCertificate: (
      eventId: string,
      input: Partial<
        Pick<RegisterActionInput, 'transactionId' | 'metadata'>
      > = {}
    ) => ({
      type: ActionType.PRINT_CERTIFICATE,
      transactionId: input.transactionId ?? getUUID(),
      data: {},
      metadata:
        input.metadata ??
        generateActionMetadataInput(
          tennisClubMembershipEvent,
          ActionType.PRINT_CERTIFICATE
        ),
      eventId
    }),
    correction: {
      request: (
        eventId: string,
        input: Partial<
          Pick<
            RequestCorrectionActionInput,
            'transactionId' | 'data' | 'metadata'
          >
        > = {}
      ) => ({
        type: ActionType.REQUEST_CORRECTION,
        transactionId: input.transactionId ?? getUUID(),
        data:
          input.data ??
          generateActionInput(
            tennisClubMembershipEvent,
            ActionType.REQUEST_CORRECTION
          ),
        metadata:
          input.metadata ??
          generateActionMetadataInput(
            tennisClubMembershipEvent,
            ActionType.REQUEST_CORRECTION
          ),
        eventId
      }),
      approve: (
        eventId: string,
        requestId: string,
        input: Partial<
          Pick<RequestCorrectionActionInput, 'transactionId' | 'metadata'>
        > = {}
      ) => ({
        type: ActionType.APPROVE_CORRECTION,
        transactionId: input.transactionId ?? getUUID(),
        data: {},
        metadata:
          input.metadata ??
          generateActionMetadataInput(
            tennisClubMembershipEvent,
            ActionType.APPROVE_CORRECTION
          ),
        eventId,
        requestId
      }),
      reject: (
        eventId: string,
        requestId: string,
        input: Partial<
          Pick<RequestCorrectionActionInput, 'transactionId' | 'metadata'>
        > = {}
      ) => ({
        type: ActionType.REJECT_CORRECTION,
        transactionId: input.transactionId ?? getUUID(),
        data: {},
        metadata:
          input.metadata ??
          generateActionMetadataInput(
            tennisClubMembershipEvent,
            ActionType.REJECT_CORRECTION
          ),
        eventId,
        requestId
      })
    }
  }
}

export function generateActionDocument({
  configuration,
  action,
  defaults = {}
}: {
  configuration: EventConfig
  action: ActionType
  defaults?: Partial<ActionDocument>
}): ActionDocument {
  const actionBase = {
    // Offset is needed so the createdAt timestamps for events, actions and drafts make logical sense in storybook tests.
    // @TODO: This should be fixed in the future.
    createdAt: new Date(Date.now() - 500).toISOString(),
    createdBy: getUUID(),
    id: getUUID(),
    createdAtLocation: 'TODO',
    data: generateActionInput(configuration, action),
    metadata: {},
    ...defaults
  } satisfies ActionBase

  switch (action) {
    case ActionType.DECLARE:
      return { ...actionBase, type: action }
    case ActionType.UNASSIGN:
      return { ...actionBase, type: action }
    case ActionType.ASSIGN:
      return { ...actionBase, assignedTo: getUUID(), type: action }
    case ActionType.VALIDATE:
      return { ...actionBase, type: action }
    case ActionType.ARCHIVE:
      return { ...actionBase, type: action }
    case ActionType.REJECT:
      return { ...actionBase, type: action }
    case ActionType.CREATE:
      return { ...actionBase, type: action }
    case ActionType.NOTIFY:
      return { ...actionBase, type: action }
    case ActionType.PRINT_CERTIFICATE:
      return { ...actionBase, type: action }
    case ActionType.REQUEST_CORRECTION:
      return { ...actionBase, type: action }
    case ActionType.APPROVE_CORRECTION:
      return { ...actionBase, requestId: getUUID(), type: action }
    case ActionType.REJECT_CORRECTION:
      return { ...actionBase, requestId: getUUID(), type: action }
    case ActionType.REGISTER:
      return {
        ...actionBase,
        type: action,
        identifiers: { trackingId: getUUID(), registrationNumber: getUUID() }
      }

    default:
      throw new Error(`Unsupported action type: ${action}`)
  }
}

export function generateEventDocument({
  configuration,
  actions
}: {
  configuration: EventConfig
  actions: ActionType[]
}): EventDocument {
  return {
    trackingId: getUUID(),
    type: configuration.id,
    actions: actions.map((action) =>
      generateActionDocument({ configuration, action })
    ),
    // Offset is needed so the createdAt timestamps for events, actions and drafts make logical sense in storybook tests.
    // @TODO: This should be fixed in the future.
    createdAt: new Date(Date.now() - 1000).toISOString(),
    id: getUUID(),
    // Offset is needed so the createdAt timestamps for events, actions and drafts make logical sense in storybook tests.
    // @TODO: This should be fixed in the future.
    updatedAt: new Date(Date.now() - 1000).toISOString()
  }
}

export function generateEventDraftDocument(
  eventId: string,
  actionType: ActionType = ActionType.DECLARE,
  data: Record<string, FieldValue> = {}
): Draft {
  const action = generateActionDocument({
    configuration: tennisClubMembershipEvent,
    action: actionType
  })
  return {
    id: getUUID(),
    transactionId: getUUID(),
    action: {
      ...action,
      data: {
        ...action.data,
        ...data
      }
    },
    createdAt: new Date().toISOString(),
    eventId
  }
}

export const eventQueryDataGenerator = (
  overrides: Partial<EventIndex> = {}
): EventIndex => ({
  id: overrides.id ?? getUUID(),
  type: overrides.type ?? 'tennis-club-membership',
  status: overrides.status ?? 'REGISTERED',
  createdAt: overrides.createdAt ?? new Date().toISOString(),
  createdBy: overrides.createdBy ?? getUUID(),
  createdAtLocation: overrides.createdAtLocation ?? getUUID(),
  modifiedAt: overrides.modifiedAt ?? new Date().toISOString(),
  assignedTo: overrides.assignedTo ?? null,
  updatedBy: overrides.updatedBy ?? getUUID(),
  data: overrides.data ?? {
    'recommender.none': true,
    'applicant.firstname': 'Danny',
    'applicant.surname': 'Doe',
    'applicant.dob': '1999-11-11'
  },
  trackingId: overrides.trackingId ?? 'M3F8YQ'
})

export const generateTranslationConfig = (
  message: string
): TranslationConfig => ({
  defaultMessage: message,
  description: 'Description for ${message}',
  id: message
})
