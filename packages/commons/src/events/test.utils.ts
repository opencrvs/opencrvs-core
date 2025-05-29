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
    'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJyZWNvcmQuZGVjbGFyZS1iaXJ0aCIsInJlY29yZC5kZWNsYXJlLWRlYXRoIiwicmVjb3JkLmRlY2xhcmUtbWFycmlhZ2UiLCJyZWNvcmQuZGVjbGFyYXRpb24tc3VibWl0LWluY29tcGxldGUiLCJyZWNvcmQuZGVjbGFyYXRpb24tc3VibWl0LWZvci1yZXZpZXciLCJzZWFyY2guYmlydGgiLCJzZWFyY2guZGVhdGgiLCJzZWFyY2gubWFycmlhZ2UiLCJkZW1vIl0sImlhdCI6MTc0Mzc2NTY1NywiZXhwIjoxNzQ0MzcwNDU3LCJhdWQiOlsib3BlbmNydnM6YXV0aC11c2VyIiwib3BlbmNydnM6dXNlci1tZ250LXVzZXIiLCJvcGVuY3J2czpoZWFydGgtdXNlciIsIm9wZW5jcnZzOmdhdGV3YXktdXNlciIsIm9wZW5jcnZzOm5vdGlmaWNhdGlvbi11c2VyIiwib3BlbmNydnM6d29ya2Zsb3ctdXNlciIsIm9wZW5jcnZzOnNlYXJjaC11c2VyIiwib3BlbmNydnM6bWV0cmljcy11c2VyIiwib3BlbmNydnM6Y291bnRyeWNvbmZpZy11c2VyIiwib3BlbmNydnM6d2ViaG9va3MtdXNlciIsIm9wZW5jcnZzOmNvbmZpZy11c2VyIiwib3BlbmNydnM6ZG9jdW1lbnRzLXVzZXIiXSwiaXNzIjoib3BlbmNydnM6YXV0aC1zZXJ2aWNlIiwic3ViIjoiNjdlZjdmODNkNmE5Y2I5MmU5ZWRhYTk5In0.dGtl7zhEeMWK05KSJqGjRzHVxjSOV1d-5naUEENTTU_iA7NeCKaKXAbiJRWDTqyQgmnF_Rl1WCxrVYgmwZWWkRZ1FuPDwEOIuYcf5ZtLamiR-Bs0cS0V3D9xXuzAnawB5hWOlZYbopihXVeI0tOAy7_Zd3KCzUisDcGEi1I6m8jZ11jUdOevM1wWLDmr69pz4ZgSnGbBxqyXis138xnqL6-kExExzvG8o59-1sn98NO83PL7vole9-EZbZj8VKlJ8YKYA6GYNEeJZdKTh960JNMJrjBHn87JfeGH-nnBv3RGmyNYv7d7FEIRJacSyKBRz_gD6RWzLvzjWWYRbJ294A',
  registrationAgent:
    'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJyZWNvcmQucmVhZCIsInJlY29yZC5kZWNsYXJlLWJpcnRoIiwicmVjb3JkLmRlY2xhcmUtZGVhdGgiLCJyZWNvcmQuZGVjbGFyZS1tYXJyaWFnZSIsInJlY29yZC5kZWNsYXJhdGlvbi1lZGl0IiwicmVjb3JkLmRlY2xhcmF0aW9uLXN1Ym1pdC1mb3ItYXBwcm92YWwiLCJyZWNvcmQuZGVjbGFyYXRpb24tc3VibWl0LWZvci11cGRhdGVzIiwicmVjb3JkLmRlY2xhcmF0aW9uLWFyY2hpdmUiLCJyZWNvcmQuZGVjbGFyYXRpb24tcmVpbnN0YXRlIiwicmVjb3JkLnJlZ2lzdHJhdGlvbi1yZXF1ZXN0LWNvcnJlY3Rpb24iLCJyZWNvcmQuZGVjbGFyYXRpb24tcHJpbnQtc3VwcG9ydGluZy1kb2N1bWVudHMiLCJyZWNvcmQuZXhwb3J0LXJlY29yZHMiLCJyZWNvcmQucmVnaXN0cmF0aW9uLXByaW50Jmlzc3VlLWNlcnRpZmllZC1jb3BpZXMiLCJwZXJmb3JtYW5jZS5yZWFkIiwicGVyZm9ybWFuY2UucmVhZC1kYXNoYm9hcmRzIiwib3JnYW5pc2F0aW9uLnJlYWQtbG9jYXRpb25zOm15LW9mZmljZSIsInNlYXJjaC5iaXJ0aCIsInNlYXJjaC5kZWF0aCIsInNlYXJjaC5tYXJyaWFnZSIsImRlbW8iXSwiaWF0IjoxNzQzNzY1NTc3LCJleHAiOjE3NDQzNzAzNzcsImF1ZCI6WyJvcGVuY3J2czphdXRoLXVzZXIiLCJvcGVuY3J2czp1c2VyLW1nbnQtdXNlciIsIm9wZW5jcnZzOmhlYXJ0aC11c2VyIiwib3BlbmNydnM6Z2F0ZXdheS11c2VyIiwib3BlbmNydnM6bm90aWZpY2F0aW9uLXVzZXIiLCJvcGVuY3J2czp3b3JrZmxvdy11c2VyIiwib3BlbmNydnM6c2VhcmNoLXVzZXIiLCJvcGVuY3J2czptZXRyaWNzLXVzZXIiLCJvcGVuY3J2czpjb3VudHJ5Y29uZmlnLXVzZXIiLCJvcGVuY3J2czp3ZWJob29rcy11c2VyIiwib3BlbmNydnM6Y29uZmlnLXVzZXIiLCJvcGVuY3J2czpkb2N1bWVudHMtdXNlciJdLCJpc3MiOiJvcGVuY3J2czphdXRoLXNlcnZpY2UiLCJzdWIiOiI2N2VmN2Y4M2Q2YTljYjkyZTllZGFhYTEifQ.cuRti6UG2ZyvI3zeGRv3ke0Vp1L1aK1jJiIQoHZF4YrZcLyvkeYDV6T0B0lPq9MRCe29NWm6gK5iJgwGwGX8eXjDMs-BlNjB07gojVrHSQfoRt7eAQOUgwY7g9o3CXQuGlr1pawVaWbJXyrLjXruZDpty_guSLideFiECXAwA_TnCk3Vl3xs32wiXI_QO55dfRx7jYc4sWcoTf3pk7oEBPuBz4XERjkDA9h9rw08LMFILAUJdVKapYqdvTNQ6qw1dsmdCZKYYA7sZsQuESYm8pi0JpD3WHARZzS_ZiLi7Ni4DavV7xIyABAcxmYUTNWZ02osFsmFLxyi43zCC_ufTQ',
  localRegistrar:
    'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJyZWNvcmQucmVhZCIsInJlY29yZC5kZWNsYXJlLWJpcnRoIiwicmVjb3JkLmRlY2xhcmUtZGVhdGgiLCJyZWNvcmQuZGVjbGFyZS1tYXJyaWFnZSIsInJlY29yZC5kZWNsYXJhdGlvbi1lZGl0IiwicmVjb3JkLmRlY2xhcmF0aW9uLXN1Ym1pdC1mb3ItdXBkYXRlcyIsInJlY29yZC5yZXZpZXctZHVwbGljYXRlcyIsInJlY29yZC5kZWNsYXJhdGlvbi1hcmNoaXZlIiwicmVjb3JkLmRlY2xhcmF0aW9uLXJlaW5zdGF0ZSIsInJlY29yZC5yZWdpc3RlciIsInJlY29yZC5yZWdpc3RyYXRpb24tY29ycmVjdCIsInJlY29yZC5kZWNsYXJhdGlvbi1wcmludC1zdXBwb3J0aW5nLWRvY3VtZW50cyIsInJlY29yZC5leHBvcnQtcmVjb3JkcyIsInJlY29yZC51bmFzc2lnbi1vdGhlcnMiLCJyZWNvcmQucmVnaXN0cmF0aW9uLXByaW50Jmlzc3VlLWNlcnRpZmllZC1jb3BpZXMiLCJyZWNvcmQuY29uZmlybS1yZWdpc3RyYXRpb24iLCJyZWNvcmQucmVqZWN0LXJlZ2lzdHJhdGlvbiIsInBlcmZvcm1hbmNlLnJlYWQiLCJwZXJmb3JtYW5jZS5yZWFkLWRhc2hib2FyZHMiLCJwcm9maWxlLmVsZWN0cm9uaWMtc2lnbmF0dXJlIiwib3JnYW5pc2F0aW9uLnJlYWQtbG9jYXRpb25zOm15LW9mZmljZSIsInVzZXIucmVhZDpteS1vZmZpY2UiLCJzZWFyY2guYmlydGgiLCJzZWFyY2guZGVhdGgiLCJzZWFyY2gubWFycmlhZ2UiLCJkZW1vIl0sImlhdCI6MTc0Mzc0OTAxMSwiZXhwIjoxNzQ0MzUzODExLCJhdWQiOlsib3BlbmNydnM6YXV0aC11c2VyIiwib3BlbmNydnM6dXNlci1tZ250LXVzZXIiLCJvcGVuY3J2czpoZWFydGgtdXNlciIsIm9wZW5jcnZzOmdhdGV3YXktdXNlciIsIm9wZW5jcnZzOm5vdGlmaWNhdGlvbi11c2VyIiwib3BlbmNydnM6d29ya2Zsb3ctdXNlciIsIm9wZW5jcnZzOnNlYXJjaC11c2VyIiwib3BlbmNydnM6bWV0cmljcy11c2VyIiwib3BlbmNydnM6Y291bnRyeWNvbmZpZy11c2VyIiwib3BlbmNydnM6d2ViaG9va3MtdXNlciIsIm9wZW5jcnZzOmNvbmZpZy11c2VyIiwib3BlbmNydnM6ZG9jdW1lbnRzLXVzZXIiXSwiaXNzIjoib3BlbmNydnM6YXV0aC1zZXJ2aWNlIiwic3ViIjoiNjdlZjdmODNkNmE5Y2I5MmU5ZWRhYWE5In0.Vn92CQoFto9QTH9YFjtzDAGcATlX37iviVLb6OBeiBzmsDSQZKO2ZGvhQBmjQS01O-SZ0f1D4qlgMaMkgyjKq-8QuwbxTHDG35wRIwBe_1NJ7VQFbhDJx-Sz70Pb4LgQdNaRpZBTOGaEkNNOWlO_Z4z5a9IW1SXg52ApprpwLHvpiQDalZ-sRWlmyjObqx8qdcNMCtxWaPRJaoR4Y7TM4MbKuS-Sx74P2UK5jel8QsHP6qG2iM7cTnq0L1PVAYrf5gT3IHqQGDwt4HrlZV-NyfId9FyRQCTjYrvgYM4gnHddtf7oaDk3fB5b5zc73HRYotvRibm99ncjD7-iOvyJtA'
}
