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
import {
  ActionBase,
  ActionDocument,
  ActionUpdate,
  ActionStatus
} from './ActionDocument'
import {
  ArchiveActionInput,
  AssignActionInput,
  DeclareActionInput,
  RegisterActionInput,
  RejectDeclarationActionInput,
  RequestCorrectionActionInput,
  UnassignActionInput,
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
  findRecordActionPages,
  getActionAnnotationFields,
  getDeclaration,
  getDeclarationFields,
  isPageVisible,
  isVerificationPage,
  omitHiddenFields,
  omitHiddenPaginatedFields
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

export function generateActionDeclarationInput(
  configuration: EventConfig,
  action: ActionType
) {
  const parsed = DeclarationUpdateActions.safeParse(action)
  if (parsed.success) {
    const fields = getDeclarationFields(configuration)

    const declarationConfig = getDeclaration(configuration)

    const declaration = fieldConfigsToActionPayload(fields)

    // Strip away hidden or disabled fields from mock action declaration
    // If this is not done, the mock data might contain hidden or disabled fields, which will cause validation errors
    return omitHiddenPaginatedFields(declarationConfig, declaration)
  }

  // eslint-disable-next-line no-console
  console.warn(`${action} is not a declaration action. Setting data as {}.`)

  return {}
}

export function generateActionAnnotationInput(
  configuration: EventConfig,
  action: ActionType
) {
  const actionConfig: ActionConfig | undefined = configuration.actions.find(
    (ac) => ac.type === action
  )

  const annotationFields = actionConfig
    ? getActionAnnotationFields(actionConfig)
    : []

  const annotation = fieldConfigsToActionPayload(annotationFields)

  const visibleVerificationPageIds = findRecordActionPages(
    configuration,
    action
  )
    .filter((page) => isVerificationPage(page))
    .filter((page) => isPageVisible(page, annotation))
    .map((page) => page.id)

  const visiblePageVerificationMap = visibleVerificationPageIds.reduce(
    (acc, pageId) => ({
      ...acc,
      [pageId]: true
    }),
    {}
  )

  const fieldBasedPayload = omitHiddenFields(annotationFields, annotation)

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
  draft: (
    { eventId, actionType }: { eventId: string; actionType: ActionType },
    input: Partial<Draft> = {}
  ): Draft =>
    merge(
      {
        id: getUUID(),
        eventId,
        createdAt: new Date().toISOString(),
        transactionId: getUUID(),
        action: {
          type: actionType,
          status: ActionStatus.Accepted,
          declaration: {
            'applicant.firstname': 'Max',
            'applicant.surname': 'McLaren',
            'applicant.dob': '2020-01-02',
            'recommender.none': true
          },
          annotation: {
            'correction.requester.relationship': 'ANOTHER_AGENT',
            'correction.request.reason': "Child's name was incorrect"
          },
          createdAt: new Date().toISOString(),
          createdBy: '@todo',
          createdAtLocation: '@todo'
        }
      } satisfies Draft,
      input
    ),
  actions: {
    declare: (
      eventId: string,
      input: Partial<
        Pick<DeclareActionInput, 'transactionId' | 'declaration' | 'annotation'>
      > = {}
    ) => ({
      type: ActionType.DECLARE,
      transactionId: input.transactionId ?? getUUID(),
      declaration:
        input.declaration ??
        generateActionDeclarationInput(
          tennisClubMembershipEvent,
          ActionType.DECLARE
        ),
      annotation:
        input.annotation ??
        generateActionAnnotationInput(
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
        declaration?: Partial<ActionUpdate>
      } = {}
    ) => {
      let declaration = input.declaration
      if (!declaration) {
        // Remove some fields to simulate incomplete data
        const partialDeclaration = omitBy(
          generateActionDeclarationInput(
            tennisClubMembershipEvent,
            ActionType.DECLARE
          ),
          isString
        )

        // Remove some fields to simulate incomplete data
        declaration = partialDeclaration
      }

      return {
        type: ActionType.NOTIFY,
        transactionId: input.transactionId ?? getUUID(),
        declaration,
        eventId
      }
    },
    validate: (
      eventId: string,
      input: Partial<
        Pick<
          ValidateActionInput,
          'transactionId' | 'declaration' | 'annotation'
        >
      > = {}
    ) => ({
      type: ActionType.VALIDATE,
      transactionId: input.transactionId ?? getUUID(),
      declaration:
        input.declaration ??
        generateActionDeclarationInput(
          tennisClubMembershipEvent,
          ActionType.VALIDATE
        ),
      annotation:
        input.annotation ??
        generateActionAnnotationInput(
          tennisClubMembershipEvent,
          ActionType.VALIDATE
        ),
      duplicates: [],
      eventId
    }),
    assign: (
      eventId: string,
      input: Partial<
        Pick<AssignActionInput, 'transactionId' | 'assignedTo'>
      > = {}
    ) => ({
      type: ActionType.ASSIGN,
      transactionId: input.transactionId ?? getUUID(),
      declaration: {},
      assignedTo: input.assignedTo ?? getUUID(),
      eventId
    }),
    unassign: (
      eventId: string,
      input: Partial<Pick<UnassignActionInput, 'transactionId'>> = {}
    ) => ({
      type: ActionType.UNASSIGN,
      transactionId: input.transactionId ?? getUUID(),
      declaration: {},
      assignedTo: null,
      eventId
    }),
    archive: (
      eventId: string,
      input: Partial<
        Pick<ArchiveActionInput, 'transactionId' | 'declaration'>
      > = {},
      isDuplicate?: boolean
    ) => ({
      type: ActionType.ARCHIVE,
      transactionId: input.transactionId ?? getUUID(),
      declaration: {},
      // @TODO: Check whether generator is needed?
      annotation: { isDuplicate: isDuplicate ?? false },
      duplicates: [],
      eventId
    }),
    reject: (
      eventId: string,
      input: Partial<
        Pick<RejectDeclarationActionInput, 'transactionId' | 'annotation'>
      > = {}
    ) => ({
      type: ActionType.REJECT,
      transactionId: input.transactionId ?? getUUID(),
      declaration: {},
      annotation:
        input.annotation ??
        generateActionAnnotationInput(
          tennisClubMembershipEvent,
          ActionType.REJECT
        ),
      duplicates: [],
      eventId
    }),
    register: (
      eventId: string,
      input: Partial<
        Pick<
          RegisterActionInput,
          'transactionId' | 'declaration' | 'annotation'
        >
      > = {}
    ) => ({
      type: ActionType.REGISTER,
      transactionId: input.transactionId ?? getUUID(),
      declaration:
        input.declaration ??
        generateActionDeclarationInput(
          tennisClubMembershipEvent,
          ActionType.REGISTER
        ),
      annotation:
        input.annotation ??
        generateActionAnnotationInput(
          tennisClubMembershipEvent,
          ActionType.REGISTER
        ),
      eventId
    }),
    printCertificate: (
      eventId: string,
      input: Partial<
        Pick<RegisterActionInput, 'transactionId' | 'annotation'>
      > = {}
    ) => ({
      type: ActionType.PRINT_CERTIFICATE,
      transactionId: input.transactionId ?? getUUID(),
      declaration: {},
      annotation:
        input.annotation ??
        generateActionAnnotationInput(
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
            'transactionId' | 'declaration' | 'annotation'
          >
        > = {}
      ) => ({
        type: ActionType.REQUEST_CORRECTION,
        transactionId: input.transactionId ?? getUUID(),
        declaration:
          input.declaration ??
          generateActionDeclarationInput(
            tennisClubMembershipEvent,
            ActionType.REQUEST_CORRECTION
          ),
        annotation:
          input.annotation ??
          generateActionAnnotationInput(
            tennisClubMembershipEvent,
            ActionType.REQUEST_CORRECTION
          ),
        eventId
      }),
      approve: (
        eventId: string,
        requestId: string,
        input: Partial<
          Pick<RequestCorrectionActionInput, 'transactionId' | 'annotation'>
        > = {}
      ) => ({
        type: ActionType.APPROVE_CORRECTION,
        transactionId: input.transactionId ?? getUUID(),
        declaration: {},
        annotation:
          input.annotation ??
          generateActionAnnotationInput(
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
          Pick<RequestCorrectionActionInput, 'transactionId' | 'annotation'>
        > = {}
      ) => ({
        type: ActionType.REJECT_CORRECTION,
        transactionId: input.transactionId ?? getUUID(),
        declaration: {},
        annotation:
          input.annotation ??
          generateActionAnnotationInput(
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
    declaration: generateActionDeclarationInput(configuration, action),
    annotation: {},
    ...defaults,
    status: ActionStatus.Accepted
  } satisfies ActionBase

  switch (action) {
    case ActionType.READ:
      return { ...actionBase, type: action }
    case ActionType.MARKED_AS_DUPLICATE:
      return { ...actionBase, type: action }
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
        type: action
      }

    case ActionType.DELETE:
    case ActionType.DETECT_DUPLICATE:
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
  declaration: Record<string, FieldValue> = {}
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
      declaration: {
        ...action.declaration,
        ...declaration
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
  declaration: overrides.declaration ?? {
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
