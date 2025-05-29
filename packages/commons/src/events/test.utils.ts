/* eslint-disable max-lines */
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
import addDays from 'date-fns/addDays'
import { tennisClubMembershipEvent } from '../fixtures'
import { getUUID } from '../uuid'
import {
  ActionBase,
  ActionDocument,
  ActionUpdate,
  ActionStatus,
  EventState
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
  getVisibleVerificationPageIds,
  omitHiddenFields,
  omitHiddenPaginatedFields
} from './utils'
import { TranslationConfig } from './TranslationConfig'
import { FieldConfig } from './FieldConfig'
import { ActionConfig } from './ActionConfig'
import { eventStatuses } from './EventMetadata'

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
): EventState {
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

  const visibleVerificationPageIds = getVisibleVerificationPageIds(
    findRecordActionPages(configuration, action),
    annotation
  )

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
          transactionId: getUUID(),
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
          createdByRole: '@todo',
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
    createdByRole: 'FIELD_AGENT',
    id: getUUID(),
    createdAtLocation: 'a45b982a-5c7b-4bd9-8fd8-a42d0994054c',
    declaration: generateActionDeclarationInput(configuration, action),
    annotation: {},
    status: ActionStatus.Accepted,
    transactionId: getUUID(),
    ...defaults
  } satisfies ActionBase

  switch (action) {
    case ActionType.READ:
      return { ...actionBase, type: action }
    case ActionType.MARKED_AS_DUPLICATE:
      return { ...actionBase, type: action }
    case ActionType.DECLARE:
      return { ...actionBase, type: action }
    case ActionType.UNASSIGN:
      return {
        ...actionBase,
        type: action,
        assignedTo: null
      }
    case ActionType.ASSIGN:
      return {
        ...actionBase,
        assignedTo: getUUID(),
        type: action
      }
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
    updatedAt: new Date(Date.now() - 1000).toISOString(),
    dateOfEvent: configuration.dateOfEvent
  }
}

export function generateEventDraftDocument(
  eventId: string,
  actionType: ActionType = ActionType.DECLARE,
  declaration: EventState = {}
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

function pickRandom<T>(rng: () => number, items: T[]): T {
  return items[Math.floor(rng() * items.length)]
}

export function getRandomDatetime(
  rng: () => number,
  start: Date,
  end: Date
): string {
  const range = end.getTime() - start.getTime()
  const offset = Math.floor(rng() * range)
  const randomDate = new Date(start.getTime() + offset)
  return randomDate.toISOString()
}

function generateRandomApplicant(
  rng: () => number
): Record<string, string | boolean> {
  const firstNames = [
    'Danny',
    'John',
    'Jane',
    'Emily',
    'Michael',
    'Sarah',
    'Chris',
    'Jessica'
  ]

  const surnames = [
    'Doe',
    'Smith',
    'Johnson',
    'Brown',
    'Williams',
    'Jones',
    'Garcia',
    'Miller'
  ]

  const randomFirstName = pickRandom(rng, firstNames)
  const randomSurname = pickRandom(rng, surnames)
  const randomDob = getRandomDatetime(
    rng,
    new Date('1990-01-01'),
    new Date('2010-12-31')
  ).split('T')[0]

  return {
    'recommender.none': true,
    'applicant.firstname': randomFirstName,
    'applicant.surname': randomSurname,
    'applicant.dob': randomDob
  }
}

/**
 * Useful for testing when we need deterministic outcome.
 * @param seed - Seed value for the pseudo-random number generator
 *
 * @returns A function that generates pseudo-random numbers between 0 and 1
 */
function createPseudoRandomNumberGenerator(seed: number) {
  // Parameters are not arbirary. Reference: https://en.wikipedia.org/wiki/Linear_congruential_generator
  const MODULUS = 2 ** 32
  const MULTIPLIER = 1664525
  const INCREMENT = 1013904223

  // converts seed to 32-bit unsigned integer (It needs to fit in to MODULUS)
  let state = seed >>> 0

  return () => {
    state = (MULTIPLIER * state + INCREMENT) % MODULUS
    return state / MODULUS
  }
}

function generateUuid(rng: () => number): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.floor(rng() * 16)
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

function generateTrackingId(rng: () => number): string {
  const uuid = generateUuid(rng).replace(/-/g, '')
  const trackingId = uuid.slice(0, 6).toUpperCase()
  return trackingId
}

export const eventQueryDataGenerator = (
  overrides: Partial<EventIndex> = {},
  seed: number = 1
): EventIndex => {
  const rng = createPseudoRandomNumberGenerator(seed)

  const createdAt = getRandomDatetime(
    rng,
    new Date('2024-01-01'),
    new Date('2024-12-31')
  )

  return {
    id: overrides.id ?? generateUuid(rng),
    type: overrides.type ?? 'TENNIS_CLUB_MEMBERSHIP',
    status: overrides.status ?? pickRandom(rng, eventStatuses),
    createdAt: overrides.createdAt ?? createdAt,
    createdBy: overrides.createdBy ?? generateUuid(rng),
    createdAtLocation: overrides.createdAtLocation ?? generateUuid(rng),
    updatedAtLocation: overrides.updatedAtLocation ?? generateUuid(rng),
    updatedAt:
      overrides.updatedAt ?? addDays(new Date(createdAt), 1).toISOString(),
    assignedTo: overrides.assignedTo ?? null,
    updatedBy: overrides.updatedBy ?? generateUuid(rng),
    updatedByUserRole: overrides.updatedByUserRole ?? 'FIELD_AGENT',
    flags: [],
    legalStatuses: overrides.legalStatuses ?? {},
    declaration: overrides.declaration ?? generateRandomApplicant(rng),
    trackingId: overrides.trackingId ?? generateTrackingId(rng)
  }
}

export const generateTranslationConfig = (
  message: string
): TranslationConfig => ({
  defaultMessage: message,
  description: 'Description for ${message}',
  id: message
})

export const BearerTokenByUserType = {
  fieldAgent:
    'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJyZWNvcmQuZGVjbGFyZS1iaXJ0aCIsInJlY29yZC5kZWNsYXJlLWRlYXRoIiwicmVjb3JkLmRlY2xhcmUtbWFycmlhZ2UiLCJyZWNvcmQuZGVjbGFyYXRpb24tc3VibWl0LWluY29tcGxldGUiLCJyZWNvcmQuZGVjbGFyYXRpb24tc3VibWl0LWZvci1yZXZpZXciLCJzZWFyY2guYmlydGgiLCJzZWFyY2guZGVhdGgiLCJzZWFyY2gubWFycmlhZ2UiLCJkZW1vIl0sInVzZXJUeXBlIjoidXNlciIsImlhdCI6MTc0ODUyNjQ4OCwiZXhwIjoxNzQ5MTMxMjg4LCJhdWQiOlsib3BlbmNydnM6YXV0aC11c2VyIiwib3BlbmNydnM6dXNlci1tZ250LXVzZXIiLCJvcGVuY3J2czpoZWFydGgtdXNlciIsIm9wZW5jcnZzOmdhdGV3YXktdXNlciIsIm9wZW5jcnZzOm5vdGlmaWNhdGlvbi11c2VyIiwib3BlbmNydnM6d29ya2Zsb3ctdXNlciIsIm9wZW5jcnZzOnNlYXJjaC11c2VyIiwib3BlbmNydnM6bWV0cmljcy11c2VyIiwib3BlbmNydnM6Y291bnRyeWNvbmZpZy11c2VyIiwib3BlbmNydnM6d2ViaG9va3MtdXNlciIsIm9wZW5jcnZzOmNvbmZpZy11c2VyIiwib3BlbmNydnM6ZG9jdW1lbnRzLXVzZXIiXSwiaXNzIjoib3BlbmNydnM6YXV0aC1zZXJ2aWNlIiwic3ViIjoiNjc3ZmIwODYzMGYzYWJmYTMzMDcyNzBmIn0.qLif2TmTPpqfbSUWR3TSfWf5syyCtRRJV-fDOZBtN9th-gdT0sUPZp5PB_t2QHHCLes7JLDlSA9CGNIbVvRR8a7EedXTAf0T7pwiE96PgljHSKI9jLMCYb_rhqnl8BwfsxAU3qv8EBYM9rDlcabl5iKnAOM-YLMv63CRMQxZOZ0O3Wl1Xil82dp6PqW_Lom5Qd-Esftt9BWXk5gxmqq-YegT8qU9n3hDXEsOvmIyYQvPDwmUOB-xp74CKJk_o3eBuq4TVCMYxY-tS9qkkn2A7Txhh-bzWMVNrQjQ1Yumvs8gi_F-XYTi89QbZVz8PzJ9kT8w3jshYwmAy7be9M-EQg',
  registrationAgent:
    'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJyZWNvcmQucmVhZCIsInJlY29yZC5kZWNsYXJlLWJpcnRoIiwicmVjb3JkLmRlY2xhcmUtZGVhdGgiLCJyZWNvcmQuZGVjbGFyZS1tYXJyaWFnZSIsInJlY29yZC5kZWNsYXJhdGlvbi1lZGl0IiwicmVjb3JkLmRlY2xhcmF0aW9uLXN1Ym1pdC1mb3ItYXBwcm92YWwiLCJyZWNvcmQuZGVjbGFyYXRpb24tc3VibWl0LWZvci11cGRhdGVzIiwicmVjb3JkLmRlY2xhcmF0aW9uLWFyY2hpdmUiLCJyZWNvcmQuZGVjbGFyYXRpb24tcmVpbnN0YXRlIiwicmVjb3JkLnJlZ2lzdHJhdGlvbi1yZXF1ZXN0LWNvcnJlY3Rpb24iLCJyZWNvcmQuZGVjbGFyYXRpb24tcHJpbnQtc3VwcG9ydGluZy1kb2N1bWVudHMiLCJyZWNvcmQuZXhwb3J0LXJlY29yZHMiLCJyZWNvcmQucmVnaXN0cmF0aW9uLXByaW50Jmlzc3VlLWNlcnRpZmllZC1jb3BpZXMiLCJwZXJmb3JtYW5jZS5yZWFkIiwicGVyZm9ybWFuY2UucmVhZC1kYXNoYm9hcmRzIiwib3JnYW5pc2F0aW9uLnJlYWQtbG9jYXRpb25zOm15LW9mZmljZSIsInNlYXJjaC5iaXJ0aCIsInNlYXJjaC5kZWF0aCIsInNlYXJjaC5tYXJyaWFnZSIsImRlbW8iXSwidXNlclR5cGUiOiJ1c2VyIiwiaWF0IjoxNzQ4NTI2NDY4LCJleHAiOjE3NDkxMzEyNjgsImF1ZCI6WyJvcGVuY3J2czphdXRoLXVzZXIiLCJvcGVuY3J2czp1c2VyLW1nbnQtdXNlciIsIm9wZW5jcnZzOmhlYXJ0aC11c2VyIiwib3BlbmNydnM6Z2F0ZXdheS11c2VyIiwib3BlbmNydnM6bm90aWZpY2F0aW9uLXVzZXIiLCJvcGVuY3J2czp3b3JrZmxvdy11c2VyIiwib3BlbmNydnM6c2VhcmNoLXVzZXIiLCJvcGVuY3J2czptZXRyaWNzLXVzZXIiLCJvcGVuY3J2czpjb3VudHJ5Y29uZmlnLXVzZXIiLCJvcGVuY3J2czp3ZWJob29rcy11c2VyIiwib3BlbmNydnM6Y29uZmlnLXVzZXIiLCJvcGVuY3J2czpkb2N1bWVudHMtdXNlciJdLCJpc3MiOiJvcGVuY3J2czphdXRoLXNlcnZpY2UiLCJzdWIiOiI2NzdmYjA4NjMwZjNhYmZhMzMwNzI3MTgifQ.C0R3cda9tczdJyadyJzk_wjVx79yiQ4r2BZbrF5VMTol97CwqMk1cPKVv5xZR1fHW5nhYl1X_vsmTYx-p9oSmcAYVud-4Z24TrA3oZ214zCB8RW_RmmFzJSczwe-9Son-96JOpRJTz2F-F_SSmblF0cjndJ-iXCAbOn1hmQ1q45NqaV-oFaFWigvAaRoBFcEvGufQxss_NjRmG12ooENSfWQl0tYM9BmTw4JQo2xerwJcgaJTrtDgRagkuiR7zhVNjcoT64AQiSRp5KmWRhbU4ozlJ2tfy1ccD9jJkbQTf1AZT2pl1diusjstJYFuM9QPFPOyCO0umaxYfgSer_Hmg',
  localRegistrar:
    'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJyZWNvcmQucmVhZCIsInJlY29yZC5kZWNsYXJlLWJpcnRoIiwicmVjb3JkLmRlY2xhcmUtZGVhdGgiLCJyZWNvcmQuZGVjbGFyZS1tYXJyaWFnZSIsInJlY29yZC5kZWNsYXJhdGlvbi1lZGl0IiwicmVjb3JkLmRlY2xhcmF0aW9uLXN1Ym1pdC1mb3ItdXBkYXRlcyIsInJlY29yZC5yZXZpZXctZHVwbGljYXRlcyIsInJlY29yZC5kZWNsYXJhdGlvbi1hcmNoaXZlIiwicmVjb3JkLmRlY2xhcmF0aW9uLXJlaW5zdGF0ZSIsInJlY29yZC5yZWdpc3RlciIsInJlY29yZC5yZWdpc3RyYXRpb24tY29ycmVjdCIsInJlY29yZC5kZWNsYXJhdGlvbi1wcmludC1zdXBwb3J0aW5nLWRvY3VtZW50cyIsInJlY29yZC5leHBvcnQtcmVjb3JkcyIsInJlY29yZC51bmFzc2lnbi1vdGhlcnMiLCJyZWNvcmQucmVnaXN0cmF0aW9uLXByaW50Jmlzc3VlLWNlcnRpZmllZC1jb3BpZXMiLCJyZWNvcmQuY29uZmlybS1yZWdpc3RyYXRpb24iLCJyZWNvcmQucmVqZWN0LXJlZ2lzdHJhdGlvbiIsInBlcmZvcm1hbmNlLnJlYWQiLCJwZXJmb3JtYW5jZS5yZWFkLWRhc2hib2FyZHMiLCJwcm9maWxlLmVsZWN0cm9uaWMtc2lnbmF0dXJlIiwib3JnYW5pc2F0aW9uLnJlYWQtbG9jYXRpb25zOm15LW9mZmljZSIsInNlYXJjaC5iaXJ0aCIsInNlYXJjaC5kZWF0aCIsInNlYXJjaC5tYXJyaWFnZSIsImRlbW8iXSwidXNlclR5cGUiOiJ1c2VyIiwiaWF0IjoxNzQ4NTI2NDIwLCJleHAiOjE3NDkxMzEyMjAsImF1ZCI6WyJvcGVuY3J2czphdXRoLXVzZXIiLCJvcGVuY3J2czp1c2VyLW1nbnQtdXNlciIsIm9wZW5jcnZzOmhlYXJ0aC11c2VyIiwib3BlbmNydnM6Z2F0ZXdheS11c2VyIiwib3BlbmNydnM6bm90aWZpY2F0aW9uLXVzZXIiLCJvcGVuY3J2czp3b3JrZmxvdy11c2VyIiwib3BlbmNydnM6c2VhcmNoLXVzZXIiLCJvcGVuY3J2czptZXRyaWNzLXVzZXIiLCJvcGVuY3J2czpjb3VudHJ5Y29uZmlnLXVzZXIiLCJvcGVuY3J2czp3ZWJob29rcy11c2VyIiwib3BlbmNydnM6Y29uZmlnLXVzZXIiLCJvcGVuY3J2czpkb2N1bWVudHMtdXNlciJdLCJpc3MiOiJvcGVuY3J2czphdXRoLXNlcnZpY2UiLCJzdWIiOiI2NzdmYjA4NjMwZjNhYmZhMzMwNzI3MjEifQ.Exwojy_1lsoPmp-kQ79SMWI0eQy8Qt7yO_ynGvb_oIVdqSwTxFkkNr9x4UxhBA-o0P6LkMZ2ELKOlSzBr3PRJ8IQnfMQ7Db8oG8HAPsY8sKqra_L6ryV088NW2e2LqAjoOX0dXRIqYMolUhF_OOuZpHW5K8nvog5SLlnJ1gKysQ1EuWBg2dcKbjkkB16v-9NGz4XHye3vcoZlalyha5OOujzbPhkmr9UGiksSIXFNbanBhkQdt-EJlLX9SXvQ4ACJWPKFb_f4gv8p84jdLiryzQux46zHPpTicZHzg0nZtoKKIH1AyFtqWfBFm4y8qWC3ht9TAk93NAXTfkS0wzxKA'
}
