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
import { merge, omitBy, isString, omit, isEmpty } from 'lodash'
import { addDays } from 'date-fns'
import { tennisClubMembershipEvent } from '../fixtures'
import { getUUID, UUID } from '../uuid'
import {
  ActionBase,
  ActionDocument,
  ActionStatus,
  EventState,
  PrintCertificateAction,
  DuplicateDetectedAction,
  ActionUpdate
} from './ActionDocument'
import {
  ApproveCorrectionActionInput,
  ArchiveActionInput,
  AssignActionInput,
  DeclareActionInput,
  EditActionInput,
  MarkAsDuplicateActionInput,
  MarkNotDuplicateActionInput,
  NotifyActionInput,
  RegisterActionInput,
  RejectCorrectionActionInput,
  RejectDeclarationActionInput,
  RequestCorrectionActionInput,
  UnassignActionInput
} from './ActionInput'
import { ActionType, DeclarationUpdateActions } from './ActionType'
import { Draft } from './Draft'
import { EventConfig } from './EventConfig'
import { EventDocument } from './EventDocument'
import { EventIndex } from './EventIndex'
import { EventInput } from './EventInput'
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
import { Location, AdministrativeArea } from './locations'
import { EventStatus } from './EventMetadata'
import { defineWorkqueues, WorkqueueConfig } from './WorkqueueConfig'
import { TENNIS_CLUB_MEMBERSHIP } from './Constants'
import { FieldType } from './FieldType'
import {
  AddressType,
  FileFieldValue,
  HttpFieldValue
} from './CompositeFieldValue'
import { FieldValue, PlainDate } from './FieldValue'
import { TokenUserType } from '../authentication'
import * as z from 'zod/v4'
import { DocumentPath } from '../documents'
import { defineConfig } from './defineConfig'

/**
 * IANA timezone used in testing. Used for queries that expect similar results independent of the users location (e.g. when event was registered.)
 * Since we query by range, providing UTC offset will result to different results when DST changes during the range.
 */
export const TEST_SYSTEM_IANA_TIMEZONE = 'Asia/Dhaka'

/**
 * In real application, the roles are defined in the countryconfig.
 * These are just for testing purposes to generate realistic mock data.
 */
export const TestUserRole = z.enum([
  'FIELD_AGENT',
  'LOCAL_REGISTRAR',
  'LOCAL_SYSTEM_ADMIN',
  'NATIONAL_REGISTRAR',
  'REGISTRATION_AGENT',
  'NATIONAL_SYSTEM_ADMIN',
  'SOCIAL_WORKER',
  'COMMUNITY_LEADER',
  'PROVINCIAL_REGISTRAR'
])

export type TestUserRole = z.infer<typeof TestUserRole>

export function pickRandom<T>(rng: () => number, items: T[]): T {
  return items[Math.floor(rng() * items.length)]
}

export function generateRandomName(rng: () => number) {
  const firstnames = [
    'Danny',
    'John',
    'Jane',
    'Emily',
    'Michael',
    'Sarah',
    'Chris',
    'Jessica',
    'Sara',
    'Sarachella',
    'Sarandera',
    'Zara'
  ]

  const surnames = [
    'Doe',
    'Smith',
    'Johnson',
    'Brown',
    'Williams',
    'Jones',
    'Garcia',
    'Miller',
    'Saranen',
    'Sarajanen',
    'Sarthua',
    'Tsarakovski',
    'Salamander',
    'Zarathustra'
  ]

  return {
    firstname: pickRandom(rng, firstnames),
    surname: pickRandom(rng, surnames)
  }
}

export function generateUuid(rng: () => number = () => 0.1) {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.floor(rng() * 16)
    const v = c === 'x' ? r : (r & 0x3) | 0x8

    return v.toString(16)
  }) as UUID
}

export function generateTrackingId(rng: () => number): string {
  const uuid = generateUuid(rng).replace(/-/g, '')
  const trackingId = uuid.slice(0, 6).toUpperCase()
  return trackingId
}

export function generateRegistrationNumber(rng: () => number): string {
  const uuid = generateUuid(rng).replace(/-/g, '')
  const registrationNumber = uuid.slice(0, 12).toUpperCase()
  return registrationNumber
}

export function generateRandomSignature(rng: () => number): DocumentPath {
  return `${generateUuid(rng)}.png` as DocumentPath
}

/**
 * Quick-and-dirty mock data generator for event actions.
 */
function mapFieldTypeToMockValue(
  field: FieldConfig,
  i: number,
  rng: () => number,
  /**
   * Given hierarchy, ensures that related fields (e.g. location and administrative area) have valid values based on the hierarchy.
   */
  administrativeHierarchy?: {
    administrativeAreas: AdministrativeArea[]
    locations: Location[]
  }
): FieldValue {
  const leafLevelAdministrativeAreas =
    administrativeHierarchy?.administrativeAreas.filter((aa) =>
      administrativeHierarchy?.administrativeAreas.every(
        (other) => other.parentId !== aa.id
      )
    )

  switch (field.type) {
    case FieldType.DIVIDER:
    case FieldType.TEXT:
    case FieldType.TEXTAREA:
    case FieldType.BULLET_LIST:
    case FieldType.PAGE_HEADER:
    case FieldType.LOCATION:
    case FieldType.SELECT:
    case FieldType.SELECT_DATE_RANGE:
    case FieldType.COUNTRY:
    case FieldType.RADIO_GROUP:
    case FieldType.PARAGRAPH:
    case FieldType.HEADING:
    case FieldType.IMAGE_VIEW:
    case FieldType.ADMINISTRATIVE_AREA:
    case FieldType.PHONE:
    case FieldType.QUERY_PARAM_READER:
    case FieldType.ID:
    case FieldType.LINK_BUTTON:
    case FieldType.LOADER:
    case FieldType.ALPHA_HIDDEN:
      return `${field.id}-${field.type}-${i}`
    case FieldType.VERIFICATION_STATUS:
      return 'verified'
    case FieldType.FACILITY:
    case FieldType.OFFICE:
      return administrativeHierarchy?.locations
        ? pickRandom(rng, administrativeHierarchy.locations)?.id
        : ('a45b982a-5c7b-4bd9-8fd8-a42d0994054c' as UUID)

    case FieldType.NAME:
      return generateRandomName(rng)
    case FieldType.NUMBER:
      return 19
    case FieldType.NUMBER_WITH_UNIT:
      return {
        numericValue: 42,
        unit: 'Hours'
      }
    case FieldType.BUTTON:
      return 1
    case FieldType.EMAIL:
      return 'test@opencrvs.org'
    case FieldType.ADDRESS:
      return {
        country: 'FAR',
        addressType: AddressType.DOMESTIC,
        administrativeArea: leafLevelAdministrativeAreas
          ? pickRandom(rng, leafLevelAdministrativeAreas)?.id
          : ('27160bbd-32d1-4625-812f-860226bfb92a' as UUID),
        streetLevelDetails: {
          town: 'Example Town',
          residentialArea: 'Example Residential Area',
          street: 'Example Street',
          number: '55',
          zipCode: '123456',
          state: 'Example State',
          district2: 'Example District 2'
        }
      }
    case FieldType.DATE:
      return '2021-01-01'
    case FieldType.AGE:
      return {
        age: 19,
        asOfDateRef: 'applicant.dob'
      }
    case FieldType.TIME:
      return '09:33'
    case FieldType.ALPHA_PRINT_BUTTON:
      return undefined
    case FieldType.DATE_RANGE:
      return {
        start: PlainDate.parse('2021-01-01'),
        end: PlainDate.parse('2021-01-31')
      }
    case FieldType.CHECKBOX:
      return true
    case FieldType.SIGNATURE:
    case FieldType.FILE:
      return {
        path: '4f095fc4-4312-4de2-aa38-86dcc0f71044.png' as DocumentPath,
        originalFilename: 'abcd.png',
        type: 'image/png'
      } satisfies FileFieldValue
    case FieldType.SEARCH:
    case FieldType.HTTP:
      return {
        error: null,
        data: { nid: '1234567890' },
        loading: false
      } satisfies HttpFieldValue
    case FieldType.FILE_WITH_OPTIONS:
    case FieldType.DATA:
    case FieldType._EXPERIMENTAL_CUSTOM:
      return undefined
    case FieldType.QR_READER:
      return Object.create(null)
    case FieldType.ID_READER:
      return Object.create(null)
    case FieldType.USER_ROLE:
      return TestUserRole.enum.FIELD_AGENT
  }
}

export function fieldConfigsToActionPayload(
  fields: FieldConfig[],
  rng: () => number,
  /**
   * Given hierarchy, ensures that related fields (e.g. location and administrative area) have valid values based on the hierarchy.
   */
  administrativeHierarchy?: {
    administrativeAreas: AdministrativeArea[]
    locations: Location[]
  }
): ActionUpdate {
  return fields.reduce(
    (acc, field, i) => ({
      ...acc,
      [field.id]: mapFieldTypeToMockValue(
        field,
        i,
        rng,
        administrativeHierarchy
      )
    }),
    {}
  )
}

export function generateActionDeclarationInput(
  configuration: EventConfig,
  action: ActionType,
  rng: () => number,
  overrides?: ActionUpdate,
  /**
   * Given hierarchy, ensures that related fields (e.g. location and administrative area) have valid values based on the hierarchy.
   */
  administrativeHierarchy?: {
    administrativeAreas: AdministrativeArea[]
    locations: Location[]
  }
): ActionUpdate {
  const parsed = DeclarationUpdateActions.safeParse(action)

  if (isEmpty(overrides) && typeof overrides === 'object') {
    return {}
  }

  if (parsed.success) {
    const fields = getDeclarationFields(configuration)

    const declarationConfig = getDeclaration(configuration)

    const declaration = fieldConfigsToActionPayload(
      fields,
      rng,
      administrativeHierarchy
    )

    // Strip away hidden or disabled fields from mock action declaration
    // If this is not done, the mock data might contain hidden or disabled fields, which will cause validation errors
    return omitHiddenPaginatedFields(
      declarationConfig,
      {
        ...declaration,
        ...overrides
      },
      {}, // Intentionally empty. Allow generating fields with custom conditionals.
      true
    )
  }

  // eslint-disable-next-line no-console
  console.warn(`${action} is not a declaration action. Setting data as {}.`)

  return {}
}

/*
 * Overrides `dobUnknown` to be false so that the mock data
 * contains applicant dob
 */
export function generateActionDuplicateDeclarationInput(
  ...args: Parameters<typeof generateActionDeclarationInput>
): ReturnType<typeof generateActionDeclarationInput> {
  const [configuration, action, rng, overrides] = args
  return generateActionDeclarationInput(configuration, action, rng, {
    ...overrides,
    'applicant.dobUnknown': false
  })
}

function generateActionAnnotationInput(
  configuration: EventConfig,
  action: ActionType,
  rng: () => number
) {
  const actionConfig: ActionConfig | undefined = configuration.actions.find(
    (ac) => ac.type === action
  )

  const annotationFields = actionConfig
    ? getActionAnnotationFields(actionConfig)
    : []

  const annotation = fieldConfigsToActionPayload(annotationFields, rng)

  const visibleVerificationPageIds = getVisibleVerificationPageIds(
    findRecordActionPages(configuration, action),
    annotation,
    {}
  )

  const visiblePageVerificationMap = visibleVerificationPageIds.reduce(
    (acc, pageId) => ({
      ...acc,
      [pageId]: true
    }),
    {}
  )

  const fieldBasedPayload = omitHiddenFields(
    annotationFields,
    annotation,
    {} // Intentionally empty. Allow generating fields with custom conditionals.
  )

  return {
    ...fieldBasedPayload,
    ...visiblePageVerificationMap
  }
}

export function eventPayloadGenerator(
  rng: () => number,
  configuration: EventConfig = tennisClubMembershipEvent
) {
  return {
    create: (input: Partial<EventInput> = {}) => ({
      transactionId: input.transactionId ?? getUUID(),
      type: input.type ?? configuration.id
    }),
    patch: (id: string, input: Partial<EventInput> = {}) => ({
      transactionId: input.transactionId ?? getUUID(),
      type: input.type ?? configuration.id,
      id
    }),
    draft: (
      {
        eventId,
        actionType,
        annotation,
        omitFields = []
      }: {
        eventId: UUID
        actionType: Draft['action']['type'] // eslint-disable-next-line @typescript-eslint/no-explicit-any
        annotation?: Record<string, any>
        omitFields?: string[] // list of declaration fields to exclude
      },
      input: Partial<Draft> = {}
    ): Draft => {
      const base: Draft = {
        id: getUUID(),
        eventId,
        createdAt: new Date().toISOString(),
        transactionId: getUUID(),
        action: {
          transactionId: getUUID(),
          type: actionType,
          status: ActionStatus.Accepted,
          declaration: {
            'applicant.name': {
              firstname: 'Max',
              surname: 'McLaren'
            },
            'applicant.dob': '2020-01-02',
            'applicant.image': {
              path: 'e56d1dd3-2cd4-452a-b54e-bf3e2d830605.png' as DocumentPath,
              originalFilename: 'Screenshot.png',
              type: 'image/png'
            }
          },
          annotation: {
            'correction.requester.relationship': 'ANOTHER_AGENT',
            'correction.request.reason': "Child's name was incorrect",
            'identity-check': true,
            ...annotation
          },
          createdAt: new Date().toISOString(),
          createdBy: '@todo',
          createdByUserType: TokenUserType.enum.user,
          createdByRole: '@todo'
        }
      }

      base.action.declaration = omit(base.action.declaration, omitFields)
      return merge(base, input)
    },
    actions: {
      declare: (
        eventId: string,
        input: Partial<
          Pick<
            DeclareActionInput,
            'transactionId' | 'declaration' | 'annotation' | 'keepAssignment'
          >
        > = {}
      ) => ({
        type: ActionType.DECLARE,
        transactionId: input.transactionId ?? getUUID(),
        declaration:
          input.declaration ??
          generateActionDeclarationInput(
            configuration,
            ActionType.DECLARE,
            rng
          ),
        annotation:
          input.annotation ??
          generateActionAnnotationInput(configuration, ActionType.DECLARE, rng),
        eventId,
        ...input
      }),
      /**
       * Notify allows sending incomplete data. Think it as 'partial declare' for now.
       */
      notify: (
        eventId: string,
        input: Partial<
          Pick<
            NotifyActionInput,
            'transactionId' | 'declaration' | 'keepAssignment'
          >
        > = {}
      ) => {
        let declaration = input.declaration
        if (!declaration) {
          // Remove some fields to simulate incomplete data
          const partialDeclaration = omitBy(
            generateActionDeclarationInput(
              configuration,
              ActionType.NOTIFY,
              rng
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
          eventId,
          keepAssignment: input.keepAssignment
        }
      },
      edit: (
        eventId: string,
        input: Partial<
          Pick<
            EditActionInput,
            'transactionId' | 'declaration' | 'annotation' | 'keepAssignment'
          >
        > = {}
      ) => ({
        type: ActionType.EDIT,
        content: { comment: 'Test comment' },
        transactionId: input.transactionId ?? getUUID(),
        declaration:
          input.declaration ??
          generateActionDeclarationInput(configuration, ActionType.EDIT, rng),
        annotation:
          input.annotation ??
          generateActionAnnotationInput(configuration, ActionType.EDIT, rng),
        eventId,
        ...input
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
          Pick<
            ArchiveActionInput,
            'transactionId' | 'declaration' | 'keepAssignment'
          >
        > = {}
      ) => ({
        type: ActionType.ARCHIVE,
        transactionId: input.transactionId ?? getUUID(),
        declaration: {},
        annotation: {},
        eventId,
        content: {
          reason: `${ActionType.ARCHIVE}`
        },
        ...input
      }),
      reject: (
        eventId: string,
        input: Partial<
          Pick<
            RejectDeclarationActionInput,
            'transactionId' | 'annotation' | 'keepAssignment'
          >
        > = {}
      ) => ({
        type: ActionType.REJECT,
        transactionId: input.transactionId ?? getUUID(),
        declaration: {},
        annotation:
          input.annotation ??
          generateActionAnnotationInput(configuration, ActionType.REJECT, rng),
        eventId,
        content: { reason: `${ActionType.REJECT}` },
        ...input
      }),
      register: (
        eventId: string,
        input: Partial<
          Pick<
            RegisterActionInput,
            | 'transactionId'
            | 'declaration'
            | 'annotation'
            | 'keepAssignment'
            | 'registrationNumber'
          >
        > = {}
      ) => ({
        type: ActionType.REGISTER,
        transactionId: input.transactionId ?? getUUID(),
        declaration:
          input.declaration ??
          generateActionDeclarationInput(
            configuration,
            ActionType.REGISTER,
            rng
          ),
        annotation:
          input.annotation ??
          generateActionAnnotationInput(
            configuration,
            ActionType.REGISTER,
            rng
          ),
        eventId,
        ...input
      }),
      printCertificate: (
        eventId: string,
        input: Partial<
          Pick<
            RegisterActionInput,
            'transactionId' | 'annotation' | 'keepAssignment'
          >
        > = {}
      ) => ({
        type: ActionType.PRINT_CERTIFICATE,
        transactionId: input.transactionId ?? getUUID(),
        declaration: {},
        annotation:
          input.annotation ??
          generateActionAnnotationInput(
            configuration,
            ActionType.PRINT_CERTIFICATE,
            rng
          ),
        eventId,
        ...input
      }),
      correction: {
        request: (
          eventId: string,
          input: Partial<
            Pick<
              RequestCorrectionActionInput,
              'transactionId' | 'declaration' | 'annotation' | 'keepAssignment'
            >
          > = {}
        ) => ({
          type: ActionType.REQUEST_CORRECTION,
          transactionId: input.transactionId ?? getUUID(),
          declaration:
            input.declaration ??
            omit(
              generateActionDeclarationInput(
                configuration,
                ActionType.REQUEST_CORRECTION,
                rng
              ),
              ['applicant.email', 'applicant.image']
            ),
          annotation:
            input.annotation ??
            generateActionAnnotationInput(
              configuration,
              ActionType.REQUEST_CORRECTION,
              rng
            ),
          eventId,
          keepAssignment: input.keepAssignment
        }),
        approve: (
          eventId: string,
          requestId: string,
          input: Partial<
            Pick<
              ApproveCorrectionActionInput,
              'transactionId' | 'annotation' | 'keepAssignment'
            >
          > = {}
        ) => ({
          type: ActionType.APPROVE_CORRECTION,
          transactionId: input.transactionId ?? getUUID(),
          declaration: {},
          annotation:
            input.annotation ??
            generateActionAnnotationInput(
              configuration,
              ActionType.APPROVE_CORRECTION,
              rng
            ),
          eventId,
          requestId,
          keepAssignment: input.keepAssignment
        }),
        reject: (
          eventId: string,
          requestId: string,
          input: Partial<
            Pick<
              RejectCorrectionActionInput,
              'transactionId' | 'annotation' | 'keepAssignment' | 'content'
            >
          >
        ) => ({
          type: ActionType.REJECT_CORRECTION,
          transactionId: input.transactionId ?? getUUID(),
          declaration: {},
          annotation:
            input.annotation ??
            generateActionAnnotationInput(
              configuration,
              ActionType.REJECT_CORRECTION,
              rng
            ),
          eventId,
          requestId,
          keepAssignment: input.keepAssignment,
          content: input.content ?? { reason: '' }
        })
      },
      duplicate: {
        markAsDuplicate: (
          eventId: string,
          input: Partial<
            Pick<
              MarkAsDuplicateActionInput,
              'transactionId' | 'declaration' | 'annotation' | 'keepAssignment'
            >
          > = {}
        ) => ({
          type: ActionType.MARK_AS_DUPLICATE,
          transactionId: input.transactionId ?? getUUID(),
          declaration:
            input.declaration ??
            generateActionDeclarationInput(
              tennisClubMembershipEvent,
              ActionType.REGISTER,
              rng
            ),
          annotation:
            input.annotation ??
            generateActionAnnotationInput(
              tennisClubMembershipEvent,
              ActionType.REGISTER,
              rng
            ),
          eventId,
          keepAssignment: input.keepAssignment
        }),
        markNotDuplicate: (
          eventId: string,
          input: Partial<
            Pick<
              MarkNotDuplicateActionInput,
              'transactionId' | 'declaration' | 'annotation' | 'keepAssignment'
            >
          > = {}
        ) => ({
          type: ActionType.MARK_AS_NOT_DUPLICATE,
          transactionId: input.transactionId ?? getUUID(),
          declaration:
            input.declaration ??
            generateActionDeclarationInput(
              tennisClubMembershipEvent,
              ActionType.REGISTER,
              rng
            ),
          annotation:
            input.annotation ??
            generateActionAnnotationInput(
              tennisClubMembershipEvent,
              ActionType.REGISTER,
              rng
            ),
          eventId,
          keepAssignment: input.keepAssignment
        })
      }
    }
  }
}

export function generateActionDocument<T extends ActionType>({
  configuration,
  action,
  rng = () => 0.1,
  defaults,
  declarationOverrides
}: {
  configuration: EventConfig
  action: T
  rng?: () => number
  defaults?: Partial<Extract<ActionDocument, { type: T }>>
  declarationOverrides?: ActionUpdate
}): ActionDocument {
  const actionBase = {
    // Offset is needed so the createdAt timestamps for events, actions and drafts make logical sense in storybook tests.
    // @TODO: This should be fixed in the future.
    createdAt: new Date(Date.now() - 500).toISOString(),
    createdBy: generateUuid(rng),
    createdByUserType: TokenUserType.enum.user,
    createdByRole: TestUserRole.enum.FIELD_AGENT,
    id: getUUID(),
    createdAtLocation: 'a45b982a-5c7b-4bd9-8fd8-a42d0994054c' as UUID,
    declaration: generateActionDeclarationInput(
      configuration,
      action,
      rng,
      declarationOverrides
    ),
    annotation: {},
    status: ActionStatus.Accepted,
    transactionId: getUUID(),
    ...defaults
  } satisfies ActionBase

  switch (action) {
    case ActionType.READ:
    case ActionType.MARK_AS_NOT_DUPLICATE:
    case ActionType.DECLARE:
    case ActionType.UNASSIGN:
    case ActionType.CREATE:
    case ActionType.NOTIFY:
    case ActionType.REGISTER:
    case ActionType.REQUEST_CORRECTION:
      return { ...actionBase, type: action }
    case ActionType.EDIT:
      return {
        ...actionBase,
        type: action,
        content: { comment: 'Test comment' }
      }
    case ActionType.CUSTOM:
      return {
        ...actionBase,
        type: action,
        customActionType: 'CUSTOM_ACTION_TYPE'
      }
    case ActionType.MARK_AS_DUPLICATE:
      return { ...actionBase, type: action, content: undefined }
    case ActionType.ASSIGN: {
      const assignActionDefaults = defaults as
        | Partial<Extract<ActionDocument, { type: 'ASSIGN' }>>
        | undefined
      return {
        ...actionBase,
        assignedTo: assignActionDefaults?.assignedTo ?? getUUID(),
        type: action
      }
    }
    case ActionType.ARCHIVE:
      return { ...actionBase, type: action, content: { reason: 'Archive' } }
    case ActionType.REJECT:
      return { ...actionBase, type: action, content: { reason: 'Reject' } }

    case ActionType.PRINT_CERTIFICATE: {
      const printActionDefaults = defaults as
        | Partial<PrintCertificateAction>
        | undefined
      return {
        ...actionBase,
        type: action,
        content: printActionDefaults?.content
      }
    }
    case ActionType.APPROVE_CORRECTION:
      return { ...actionBase, requestId: getUUID(), type: action }
    case ActionType.REJECT_CORRECTION:
      return {
        ...actionBase,
        requestId: getUUID(),
        type: action,
        content: { reason: 'Correction rejection' }
      }
    case ActionType.DUPLICATE_DETECTED: {
      const duplicateActionDefaults = defaults as
        | Partial<DuplicateDetectedAction>
        | undefined
      return {
        ...actionBase,
        type: action,
        content: {
          duplicates: duplicateActionDefaults?.content?.duplicates ?? []
        }
      }
    }
    case ActionType.DELETE:
    default:
      throw new Error(`Unsupported action type: ${action}`)
  }
}

export function generateRandomDatetime(
  rng: () => number,
  start: Date,
  end: Date
): string {
  const range = end.getTime() - start.getTime()
  const offset = Math.floor(rng() * range)
  const randomDate = new Date(start.getTime() + offset)
  return randomDate.toISOString()
}

export function getRandomDate(rng: () => number, start: string, end: string) {
  const datetime = generateRandomDatetime(rng, new Date(start), new Date(end))

  return datetime.split('T')[0] // Return only the date part in YYYY-MM-DD format
}

export function generateEventDocument({
  configuration,
  actions,
  rng = () => 0.1,
  defaults = {}
}: {
  configuration: EventConfig
  actions: {
    type: ActionType
    /**
     * Overrides for default event state per action
     */
    declarationOverrides?: ActionUpdate
    user?: Partial<{
      signature: string
      primaryOfficeId: UUID
      role: TestUserRole
      id: string
      assignedTo: string
    }>
  }[]
  rng?: () => number
  defaults?: Partial<EventDocument>
}): EventDocument {
  return {
    trackingId: generateTrackingId(rng),
    type: configuration.id,
    actions: actions.map((action, i) =>
      generateActionDocument({
        configuration,
        action: action.type,
        defaults: {
          createdBy: action.user?.id,
          createdAtLocation: action.user?.primaryOfficeId,
          assignedTo: action.user?.assignedTo,
          createdByRole: action.user?.role,
          createdAt: addDays(
            new Date(
              generateRandomDatetime(
                rng,
                new Date(2025, 0, 1),
                new Date(2025, 11, 31)
              )
            ),
            i
          ).toISOString()
        },
        declarationOverrides: action.declarationOverrides
      })
    ),
    // Offset is needed so the createdAt timestamps for events, actions and drafts make logical sense in storybook tests.
    // @TODO: This should be fixed in the future.
    createdAt: new Date(Date.now() - 1000).toISOString(),
    id: getUUID(),
    // Offset is needed so the createdAt timestamps for events, actions and drafts make logical sense in storybook tests.
    // @TODO: This should be fixed in the future.
    updatedAt: new Date(Date.now() - 1000).toISOString(),
    ...defaults
  }
}

export function generateEventDraftDocument({
  eventId,
  actionType,
  rng = () => 0.1,
  declaration = {}
}: {
  eventId: UUID
  actionType: ActionType
  rng?: () => number
  declaration?: ActionUpdate
  annotation?: ActionUpdate
}): Draft {
  const action = generateActionDocument({
    configuration: tennisClubMembershipEvent,
    action: actionType,
    rng
  })

  return {
    id: getUUID(),
    transactionId: getUUID(),
    action: {
      ...action,
      declaration: {
        ...action.declaration,
        ...declaration
      },
      annotation: action.annotation
    },
    createdAt: new Date().toISOString(),
    eventId
  }
}

function generateRandomApplicant(rng: () => number): EventState {
  const { firstname, surname } = generateRandomName(rng)
  const randomDob = getRandomDate(rng, '1990-01-01', '2010-12-31')

  return {
    'recommender.none': true,
    'applicant.name': {
      firstname,
      surname
    },
    'applicant.dob': randomDob
  }
}

/**
 * Useful for testing when we need deterministic outcome.
 * @param seed - Seed value for the pseudo-random number generator
 *
 * @returns A function that generates pseudo-random numbers between 0 and 1 [0, 1)
 */
export function createPrng(seed: number) {
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

/**
 * @param overrides - Partial EventIndex object to override the default values.
 * @param seed - Seed value for the pseudo-random number generator.
 * @returns A mock EventIndex object with default values for tennis club
 * membership events.
 *
 * N.B. Unless a different seed is provided, the generated values will be
 * consistent across calls.
 *
 */
export const eventQueryDataGenerator = (
  overrides: Partial<EventIndex> = {},
  seed: number = 1
): EventIndex => {
  const rng = createPrng(seed)

  const createdAt = generateRandomDatetime(
    rng,
    new Date('2024-01-01'),
    new Date('2024-12-31')
  )

  return {
    id: overrides.id ?? generateUuid(rng),
    type: overrides.type ?? TENNIS_CLUB_MEMBERSHIP,
    status: overrides.status ?? pickRandom(rng, EventStatus.options),
    createdAt: overrides.createdAt ?? createdAt,
    createdByUserType: overrides.createdByUserType ?? 'user',
    createdBy: overrides.createdBy ?? generateUuid(rng),
    createdAtLocation: overrides.createdAtLocation ?? generateUuid(rng),
    updatedAtLocation: overrides.updatedAtLocation ?? generateUuid(rng),
    createdBySignature:
      overrides.createdBySignature ?? generateRandomSignature(rng),
    updatedAt:
      overrides.updatedAt ?? addDays(new Date(createdAt), 1).toISOString(),
    assignedTo: overrides.assignedTo ?? null,
    updatedBy: overrides.updatedBy ?? generateUuid(rng),
    updatedByUserRole: overrides.updatedByUserRole ?? 'FIELD_AGENT',
    flags: overrides.flags ?? [],
    potentialDuplicates: [],
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
  id: message.trim().replace(/\s+/g, '_').toLowerCase()
})

export const BearerTokenByUserType = {
  fieldAgent:
    'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJyZWNvcmQuZGVjbGFyYXRpb24tc3VibWl0LWZvci1yZXZpZXciLCJzZWFyY2guYmlydGgiLCJzZWFyY2guZGVhdGgiLCJzZWFyY2gubWFycmlhZ2UiLCJ3b3JrcXVldWVbaWQ9YWxsLWV2ZW50c3xhc3NpZ25lZC10by15b3V8cmVjZW50fHJlcXVpcmVzLXVwZGF0ZXN8c2VudC1mb3ItcmV2aWV3XSIsInR5cGU9cmVjb3JkLnNlYXJjaCZldmVudD1iaXJ0aCxkZWF0aCx0ZW5uaXMtY2x1Yi1tZW1iZXJzaGlwLGNoaWxkLW9uYm9hcmRpbmcsRk9PVEJBTExfQ0xVQl9NRU1CRVJTSElQIiwidHlwZT1yZWNvcmQuY3JlYXRlJmV2ZW50PWJpcnRoLGRlYXRoLHRlbm5pcy1jbHViLW1lbWJlcnNoaXAsY2hpbGQtb25ib2FyZGluZyIsInR5cGU9cmVjb3JkLnJlYWQmZXZlbnQ9YmlydGgsZGVhdGgsdGVubmlzLWNsdWItbWVtYmVyc2hpcCxjaGlsZC1vbmJvYXJkaW5nIiwicmVjb3JkLmRlY2xhcmVbZXZlbnQ9YmlydGh8ZGVhdGh8dGVubmlzLWNsdWItbWVtYmVyc2hpcHxjaGlsZC1vbmJvYXJkaW5nXSIsInJlY29yZC5ub3RpZnlbZXZlbnQ9YmlydGh8ZGVhdGh8dGVubmlzLWNsdWItbWVtYmVyc2hpcHxjaGlsZC1vbmJvYXJkaW5nXSIsInJlY29yZC5kZWNsYXJlZC5lZGl0W2V2ZW50PWJpcnRofGRlYXRofHRlbm5pcy1jbHViLW1lbWJlcnNoaXB8Y2hpbGQtb25ib2FyZGluZ10iXSwidXNlclR5cGUiOiJ1c2VyIiwicm9sZSI6IkZJRUxEX0FHRU5UIiwiaWF0IjoxNDg3MDc2NzA4LCJhdWQiOiJvcGVuY3J2czpnYXRld2F5LXVzZXIiLCJpc3MiOiJvcGVuY3J2czphdXRoLXNlcnZpY2UiLCJzdWIiOiI2N2VmN2Y4M2Q2YTljYjkyZTllZGFhOTkifQ.E8WIcdgqh_VCYgeOCXBupL9nZgiKtplHQfmwsxoONYfhGEQHilffsFV5nX610McorETRQRQ7ZNY-6v9YaAJVFfHiHTBB4US6D3qS6yI7HicUR2Evh9N10rNm81kXquum58kEqOIfrMkr-CGqIrVS15Qz0LAPGyCq_5t1arEXOL_Lonc54GFV-Q2fhR5hh9oZ3Aconen0V4tbX9MX7iCJ3qjDraeGVrhnjG5yLtl2e7TjpU2kN8nltxokyvUiiRh71Vl786yF9ULb_UWjJXoQPO0SnVyfZti936piAuLhEXhlK-qsUBB8kmz7qScgrt8dZQMoVBuwxSfStMLGkCHu-OwzeryACRd8Iei0SR9mq4rqpX1NAQBwMGUYJqYoWYGjDjUMa11pTDiWsSw0H5R4i7LnGQP7H5wbM57t09vxX8XL9msBrCD7-vtTvjafvYSpekVwI8hZP-w8Bzb0QuL9y_bf6Hae0AJDyZ1y1NXAvUbyRvgSs5wbGldu6CB9k9ZPN7KS4aPaYlWzNhF0_D-U4zU1fRTFOxd_x5DyciYTRPMpL69WieNtlRYwk4QgN-AGXxuYlJ2mK716rw9QXSGDepEYvKU2rBVkZEgBPbIO_J6Hrg30mEnQqhrsrHVwhZ3FDdONJOcqy3ELkdWjUjMnXOORcgQTYnaTjOTKvpJlbts',
  registrationAgent:
    'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJyZWNvcmQuZGVjbGFyYXRpb24tZWRpdCIsInJlY29yZC5kZWNsYXJhdGlvbi1yZWluc3RhdGUiLCJwZXJmb3JtYW5jZS5yZWFkIiwicGVyZm9ybWFuY2UucmVhZC1kYXNoYm9hcmRzIiwib3JnYW5pc2F0aW9uLnJlYWQtbG9jYXRpb25zOm15LW9mZmljZSIsInVzZXIucmVhZDpvbmx5LW15LWF1ZGl0Iiwic2VhcmNoLmJpcnRoIiwic2VhcmNoLmRlYXRoIiwic2VhcmNoLm1hcnJpYWdlIiwid29ya3F1ZXVlW2lkPWFsbC1ldmVudHN8YXNzaWduZWQtdG8teW91fHJlY2VudHxyZXF1aXJlcy1jb21wbGV0aW9ufHJlcXVpcmVzLXVwZGF0ZXN8aW4tcmV2aWV3fHNlbnQtZm9yLWFwcHJvdmFsfGluLWV4dGVybmFsLXZhbGlkYXRpb258cmVhZHktdG8tcHJpbnR8cmVhZHktdG8taXNzdWVdIiwidHlwZT1yZWNvcmQuc2VhcmNoJmV2ZW50PWJpcnRoLGRlYXRoLHRlbm5pcy1jbHViLW1lbWJlcnNoaXAsY2hpbGQtb25ib2FyZGluZyxGT09UQkFMTF9DTFVCX01FTUJFUlNISVAiLCJ0eXBlPXJlY29yZC5jcmVhdGUmZXZlbnQ9YmlydGgsZGVhdGgsdGVubmlzLWNsdWItbWVtYmVyc2hpcCxjaGlsZC1vbmJvYXJkaW5nIiwidHlwZT1yZWNvcmQucmVhZCZldmVudD1iaXJ0aCxkZWF0aCx0ZW5uaXMtY2x1Yi1tZW1iZXJzaGlwLGNoaWxkLW9uYm9hcmRpbmciLCJyZWNvcmQuZGVjbGFyZVtldmVudD1iaXJ0aHxkZWF0aHx0ZW5uaXMtY2x1Yi1tZW1iZXJzaGlwfGNoaWxkLW9uYm9hcmRpbmddIiwicmVjb3JkLmRlY2xhcmVkLnJlamVjdFtldmVudD1iaXJ0aHxkZWF0aHx0ZW5uaXMtY2x1Yi1tZW1iZXJzaGlwfGNoaWxkLW9uYm9hcmRpbmddIiwicmVjb3JkLmRlY2xhcmVkLmVkaXRbZXZlbnQ9YmlydGh8ZGVhdGh8dGVubmlzLWNsdWItbWVtYmVyc2hpcHxjaGlsZC1vbmJvYXJkaW5nXSIsInJlY29yZC5kZWNsYXJlZC5hcmNoaXZlW2V2ZW50PWJpcnRofGRlYXRofHRlbm5pcy1jbHViLW1lbWJlcnNoaXB8Y2hpbGQtb25ib2FyZGluZ10iLCJyZWNvcmQucmVnaXN0ZXJlZC5wcmludC1jZXJ0aWZpZWQtY29waWVzW2V2ZW50PWJpcnRofGRlYXRofHRlbm5pcy1jbHViLW1lbWJlcnNoaXB8Y2hpbGQtb25ib2FyZGluZ10iLCJyZWNvcmQucmVnaXN0ZXJlZC5yZXF1ZXN0LWNvcnJlY3Rpb25bZXZlbnQ9YmlydGh8ZGVhdGh8dGVubmlzLWNsdWItbWVtYmVyc2hpcHxjaGlsZC1vbmJvYXJkaW5nXSJdLCJ1c2VyVHlwZSI6InVzZXIiLCJyb2xlIjoiUkVHSVNUUkFUSU9OX0FHRU5UIiwiaWF0IjoxNDg3MDc2NzA4LCJhdWQiOiJvcGVuY3J2czpnYXRld2F5LXVzZXIiLCJpc3MiOiJvcGVuY3J2czphdXRoLXNlcnZpY2UiLCJzdWIiOiI2N2VmN2Y4M2Q2YTljYjkyZTllZGFhYTEifQ.SQ6gC8Fpmm9LBgUc0Ae-ABiEx8MeBHAXBZhIImbL_i6u81zD25-5Tbfxj_75ZzzeZYCDj8npO-a6BwQqzejgACrK_U3CPhMTrO9z4lTSHJRjIQBWnuhwEhJyPH4zxHflT5xOIsGfhYK-Ois41E9qdeRj8XhDVdbSFt3NZbog9odcXOlUml0OgX34Y_2bHYnHiUEowoUAQMTJGT2DVrQo2Z5uf1XPr3rD67WafZucttlDwW_Xo75QtT9Bvvt-ORL0xGtn0XOftHXLbD0IzdCckFZDXo0FK6FNixxj0DazM1Mi69A-BjdmB1WGTrtrnhYMlJpWn9-aJl51CIpRS0vhL2qsSq3rKjtY6K3M1sbyOGZ5HVS8xPxo2ZVfbWmBX1jiJGN9heoXnoPq3yuAa_fS2_kwAfEeFwv7OiYGc_HiSDJnY2fALVtE9Szx_LJjDmjYDpTAdg0YFMOafrl6Cl9zMBMSi8P8Lv7ZNIKOq0x8sak4-fsgpfdYlMJGRP4Am97lhQG3Tod2ca43iS0YmudszhVlbP3Sv-dx4OSbQ1EqWvaajKZQ9cvqAESH_UIbH_2cYnsnUkQoJJa-j4EBLpibDsWt36dlmgPxBoKpO3ib5FFNEXNY6ac-obfkZmWw33ihCY8sFMkfaddvg_01O_fFHPFVzJ3GnUmHTO8t2mFVi3Q',
  localRegistrar:
    'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJyZWNvcmQuZGVjbGFyYXRpb24tZWRpdCIsInJlY29yZC5yZXZpZXctZHVwbGljYXRlcyIsInJlY29yZC5kZWNsYXJhdGlvbi1yZWluc3RhdGUiLCJyZWNvcmQuY29uZmlybS1yZWdpc3RyYXRpb24iLCJyZWNvcmQucmVqZWN0LXJlZ2lzdHJhdGlvbiIsInBlcmZvcm1hbmNlLnJlYWQiLCJwZXJmb3JtYW5jZS5yZWFkLWRhc2hib2FyZHMiLCJwcm9maWxlLmVsZWN0cm9uaWMtc2lnbmF0dXJlIiwib3JnYW5pc2F0aW9uLnJlYWQtbG9jYXRpb25zOm15LW9mZmljZSIsInNlYXJjaC5iaXJ0aCIsInNlYXJjaC5kZWF0aCIsInNlYXJjaC5tYXJyaWFnZSIsIndvcmtxdWV1ZVtpZD1hbGwtZXZlbnRzfGFzc2lnbmVkLXRvLXlvdXxyZWNlbnR8cmVxdWlyZXMtY29tcGxldGlvbnxyZXF1aXJlcy11cGRhdGVzfGluLXJldmlldy1hbGx8aW4tZXh0ZXJuYWwtdmFsaWRhdGlvbnxyZWFkeS10by1wcmludHxyZWFkeS10by1pc3N1ZV0iLCJ0eXBlPXJlY29yZC5zZWFyY2gmZXZlbnQ9YmlydGgsZGVhdGgsdGVubmlzLWNsdWItbWVtYmVyc2hpcCxjaGlsZC1vbmJvYXJkaW5nLEZPT1RCQUxMX0NMVUJfTUVNQkVSU0hJUCIsInVzZXIucmVhZDpvbmx5LW15LWF1ZGl0IiwidHlwZT1yZWNvcmQuY3JlYXRlJmV2ZW50PWJpcnRoLGRlYXRoLHRlbm5pcy1jbHViLW1lbWJlcnNoaXAsY2hpbGQtb25ib2FyZGluZyIsInR5cGU9cmVjb3JkLnJlYWQmZXZlbnQ9YmlydGgsZGVhdGgsdGVubmlzLWNsdWItbWVtYmVyc2hpcCxjaGlsZC1vbmJvYXJkaW5nIiwicmVjb3JkLmRlY2xhcmVbZXZlbnQ9YmlydGh8ZGVhdGh8dGVubmlzLWNsdWItbWVtYmVyc2hpcHxjaGlsZC1vbmJvYXJkaW5nXSIsInJlY29yZC5kZWNsYXJlZC5yZWplY3RbZXZlbnQ9YmlydGh8ZGVhdGh8dGVubmlzLWNsdWItbWVtYmVyc2hpcHxjaGlsZC1vbmJvYXJkaW5nXSIsInJlY29yZC5kZWNsYXJlZC5hcmNoaXZlW2V2ZW50PWJpcnRofGRlYXRofHRlbm5pcy1jbHViLW1lbWJlcnNoaXB8Y2hpbGQtb25ib2FyZGluZ10iLCJyZWNvcmQucmVnaXN0ZXJbZXZlbnQ9YmlydGh8ZGVhdGh8dGVubmlzLWNsdWItbWVtYmVyc2hpcHxjaGlsZC1vbmJvYXJkaW5nXSIsInJlY29yZC5kZWNsYXJlZC5lZGl0W2V2ZW50PWJpcnRofGRlYXRofHRlbm5pcy1jbHViLW1lbWJlcnNoaXB8Y2hpbGQtb25ib2FyZGluZ10iLCJyZWNvcmQucmVnaXN0ZXJlZC5wcmludC1jZXJ0aWZpZWQtY29waWVzW2V2ZW50PWJpcnRofGRlYXRofHRlbm5pcy1jbHViLW1lbWJlcnNoaXB8Y2hpbGQtb25ib2FyZGluZ10iLCJyZWNvcmQucmVnaXN0ZXJlZC5jb3JyZWN0W2V2ZW50PWJpcnRofGRlYXRofHRlbm5pcy1jbHViLW1lbWJlcnNoaXB8Y2hpbGQtb25ib2FyZGluZ10iLCJyZWNvcmQudW5hc3NpZ24tb3RoZXJzW2V2ZW50PWJpcnRofGRlYXRofHRlbm5pcy1jbHViLW1lbWJlcnNoaXB8Y2hpbGQtb25ib2FyZGluZ10iLCJyZWNvcmQuZGVjbGFyZWQucmV2aWV3LWR1cGxpY2F0ZXNbZXZlbnQ9YmlydGh8ZGVhdGh8dGVubmlzLWNsdWItbWVtYmVyc2hpcHxjaGlsZC1vbmJvYXJkaW5nXSIsInJlY29yZC5jdXN0b20tYWN0aW9uW2V2ZW50PXRlbm5pcy1jbHViLW1lbWJlcnNoaXAsY3VzdG9tQWN0aW9uVHlwZT1BcHByb3ZlXSJdLCJ1c2VyVHlwZSI6InVzZXIiLCJyb2xlIjoiTE9DQUxfUkVHSVNUUkFSIiwiaWF0IjoxNDg3MDc2NzA4LCJhdWQiOiJvcGVuY3J2czpnYXRld2F5LXVzZXIiLCJpc3MiOiJvcGVuY3J2czphdXRoLXNlcnZpY2UiLCJzdWIiOiI2ODIxYzE3NWRjZTRkNzg4NmQ0ZTgyMTAifQ.HqPFpOLxTlhr9QARUgWuWpiSxbNVxOiW7tGzz_EoGlZWckoxy23i9Cp0oyjF-GCJbGTT2zfdWROAzvcuD43l1wFiYRMy8rOP3o0PH_k5eAijuMfI1Y9oXuMsZZaMBaDqrx4hHAF5uyitJ8qeAKXGF8ifryKFRdC2iSPrlBhjvKJwT-aaj4MThT_rNFrsVHlW1n-hJ78nyhUKTbgb4qmY92rxVxfJzW1vDy2bhxiJCIoPtluCvUjq6fGJOcaw9f4VuLqnt7b4fke7LN-av-eExPAXijDHyYr5L2vNIQ_4AjKQse6PM_t_7qUbOAzdkfySDsSNFLwjsy0cX8xovPJFr2E1S20-NmA6moiMghi34proGzDBs8750Wk724hSTwuFrvj3cT1nekCgkVa41b7b5E88ys5d6A48fkracYUrn0DwPs3Fbm8d6Z2kMnNAELQ_xPbBAkN8-ySwxS1dhTKtAG3gXbbIOG2jpnVQaugZaaCSZTCFA26Tw5x9wYOtR_GCeGI1lU2zd8_zjxlJA8g5zs186sPkkyWRy_J_xP2KIKfK4vBQ4FpcCDeoUh6B5sT4Bq_38PwzsC2gshzl4Np9oh9bVWbZC5Z7SLqE4TJzXDOWaoKRt6wFEfZhJjG7MYnAD2PD0YzTWyPKFn4sqZI7-zNajHfUDC-yXyIiiohQNkI'
}

export const generateWorkqueues = (
  slug: string = 'all-events'
): WorkqueueConfig[] =>
  defineWorkqueues([
    {
      slug,
      name: {
        id: 'workqueues.inProgress.title',
        defaultMessage:
          slug.charAt(0).toUpperCase() + slug.slice(1).split('-').join(' '),
        description: 'Title of in progress workqueue'
      },
      query: {
        type: 'and',
        clauses: [{ eventType: tennisClubMembershipEvent.id }]
      },
      action: { type: ActionType.READ },
      icon: 'Draft'
    }
  ])

/**
 * Backend focused event config generator for testing fields in a lightweight way.
 *
 * @param id - The unique identifier for the event.
 * @param fields - Field configurations to include in the event declaration. Everything in a single page.
 * @param placeOfEventId - Optional place of event field id.
 * @param dateOfEventId - Optional date of event field id.
 */
export const generateEventConfig = ({
  id,
  fields,
  placeOfEventId,
  dateOfEventId
}: {
  id: string
  fields: FieldConfig[]
  placeOfEventId?: string
  dateOfEventId?: string
}): EventConfig => {
  return defineConfig({
    id,
    label: generateTranslationConfig(id),
    title: generateTranslationConfig(`${id} Event`),
    summary: {
      fields: []
    },
    placeOfEvent: placeOfEventId ? { $$field: placeOfEventId } : undefined,
    dateOfEvent: dateOfEventId ? { $$field: dateOfEventId } : undefined,
    declaration: {
      label: generateTranslationConfig(`${id} Declaration`),
      pages: [
        {
          id: 'page1',
          title: generateTranslationConfig('Page 1'),
          fields
        }
      ]
    },
    actions: [
      {
        type: ActionType.READ,
        label: generateTranslationConfig('Read'),
        review: {
          title: generateTranslationConfig('Review Read Action'),
          fields: []
        }
      },
      {
        type: ActionType.DECLARE,
        label: generateTranslationConfig('Declare'),
        review: {
          title: generateTranslationConfig('Review Declare Action'),
          fields: []
        }
      }
    ]
  })
}
