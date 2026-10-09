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
  getEventValidatorContext,
  ValidatorContext
} from '../conditionals/validate'
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
  UnarchiveActionInput,
  UnassignActionInput
} from './ActionInput'
import { ActionType, DeclarationUpdateActions } from './ActionType'
import { Draft } from './Draft'
import { EventConfig, EventConfigInput } from './EventConfig'
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
import { DeclarationFormConfig } from './FormConfig'
import { ActionConfig } from './ActionConfig'
import {
  LocationVersion,
  SetLocationPayload,
  SetAdministrativeAreaPayload,
  ClientAdministrativeArea
} from './locations'
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
import {
  EncodedScope,
  encodeScope,
  ITokenPayload,
  TokenUserType
} from '../authentication'
import * as z from 'zod/v4'
import { DocumentPath } from '../documents'
import { defineConfig } from './defineConfig'
import { V2_DEFAULT_MOCK_ADMINISTRATIVE_AREAS_MAP } from './mocks.test.utils'

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
 * Builds one element of a location / administrative area `versions` history.
 * Every field is defaulted so a call names only what its assertion is about —
 * an `effectiveFrom`, a `name`, or an explicit `versionId` when the test needs
 * to control version identity.
 */
export function locationVersion(
  overrides: Partial<LocationVersion> = {},
  rng?: () => number
): LocationVersion {
  return {
    versionId: generateUuid(rng),
    effectiveFrom: '0001-01-01',
    name: 'Location name',
    externalId: null,
    status: 'active',
    ...overrides
  }
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
    administrativeAreas: SetAdministrativeAreaPayload[]
    locations: SetLocationPayload[]
  }
): FieldValue {
  const leafLevelAdministrativeAreas =
    administrativeHierarchy?.administrativeAreas.filter((aa) =>
      administrativeHierarchy?.administrativeAreas.every(
        (other) => other.parentId !== aa.id
      )
    )

  switch (field.type) {
    case FieldType.FIELD_GROUP: {
      const nestedValue: Record<string, FieldValue> = field.fields.reduce(
        (acc, subfield, index) => ({
          ...acc,
          [subfield.id]: mapFieldTypeToMockValue(
            subfield,
            i * 1000 + index,
            rng
          )
        }),
        {}
      )
      return nestedValue
    }
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
    case FieldType.AUTOCOMPLETE:
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
    administrativeAreas: SetAdministrativeAreaPayload[]
    locations: SetLocationPayload[]
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
    administrativeAreas: SetAdministrativeAreaPayload[]
    locations: SetLocationPayload[]
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
            | 'transactionId'
            | 'declaration'
            | 'annotation'
            | 'keepAssignment'
            | 'keepAssignmentIfAccepted'
            | 'keepAssignmentIfRejected'
            | 'waitFor'
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
            | 'transactionId'
            | 'declaration'
            | 'keepAssignment'
            | 'keepAssignmentIfRejected'
            | 'keepAssignmentIfAccepted'
            | 'waitFor'
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
          keepAssignment: input.keepAssignment,
          keepAssignmentIfAccepted: input.keepAssignmentIfAccepted,
          keepAssignmentIfRejected: input.keepAssignmentIfRejected,
          waitFor: input.waitFor
        }
      },
      edit: (
        eventId: string,
        input: Partial<
          Pick<
            EditActionInput,
            | 'transactionId'
            | 'declaration'
            | 'annotation'
            | 'keepAssignment'
            | 'keepAssignmentIfAccepted'
            | 'keepAssignmentIfRejected'
            | 'waitFor'
          >
        > = {}
      ) => ({
        type: ActionType.EDIT,
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
          Pick<AssignActionInput, 'transactionId' | 'assignedTo' | 'waitFor'>
        > = {}
      ) => ({
        type: ActionType.ASSIGN,
        transactionId: input.transactionId ?? getUUID(),
        declaration: {},
        assignedTo: input.assignedTo ?? getUUID(),
        eventId,
        waitFor: input.waitFor
      }),
      unassign: (
        eventId: string,
        input: Partial<
          Pick<UnassignActionInput, 'transactionId' | 'waitFor'>
        > = {}
      ) => ({
        type: ActionType.UNASSIGN,
        transactionId: input.transactionId ?? getUUID(),
        declaration: {},
        assignedTo: null,
        eventId,
        waitFor: input.waitFor
      }),
      archive: (
        eventId: string,
        input: Partial<
          Pick<
            ArchiveActionInput,
            | 'transactionId'
            | 'declaration'
            | 'keepAssignment'
            | 'keepAssignmentIfRejected'
            | 'keepAssignmentIfAccepted'
            | 'waitFor'
          >
        > = {}
      ) => ({
        type: ActionType.ARCHIVE,
        transactionId: input.transactionId ?? getUUID(),
        declaration: {},
        annotation: {},
        eventId,
        ...input
      }),
      unarchive: (
        eventId: string,
        input: Partial<
          Pick<
            UnarchiveActionInput,
            | 'transactionId'
            | 'declaration'
            | 'keepAssignment'
            | 'keepAssignmentIfRejected'
            | 'keepAssignmentIfAccepted'
            | 'waitFor'
          >
        > = {}
      ) => ({
        type: ActionType.UNARCHIVE,
        transactionId: input.transactionId ?? getUUID(),
        declaration: {},
        annotation: {},
        eventId,
        ...input
      }),
      reject: (
        eventId: string,
        input: Partial<
          Pick<
            RejectDeclarationActionInput,
            | 'transactionId'
            | 'annotation'
            | 'keepAssignment'
            | 'keepAssignmentIfAccepted'
            | 'keepAssignmentIfRejected'
            | 'waitFor'
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
            | 'keepAssignmentIfAccepted'
            | 'keepAssignmentIfRejected'
            | 'waitFor'
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
            | 'transactionId'
            | 'annotation'
            | 'keepAssignment'
            | 'keepAssignmentIfRejected'
            | 'keepAssignmentIfAccepted'
            | 'waitFor'
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
              | 'transactionId'
              | 'declaration'
              | 'annotation'
              | 'keepAssignment'
              | 'keepAssignmentIfRejected'
              | 'keepAssignmentIfAccepted'
              | 'waitFor'
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
          keepAssignment: input.keepAssignment,
          keepAssignmentIfAccepted: input.keepAssignmentIfAccepted,
          keepAssignmentIfRejected: input.keepAssignmentIfRejected,
          waitFor: input.waitFor
        }),
        approve: (
          eventId: string,
          requestId: string,
          input: Partial<
            Pick<
              ApproveCorrectionActionInput,
              | 'transactionId'
              | 'annotation'
              | 'keepAssignment'
              | 'keepAssignmentIfRejected'
              | 'keepAssignmentIfAccepted'
              | 'waitFor'
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
          keepAssignment: input.keepAssignment,
          keepAssignmentIfAccepted: input.keepAssignmentIfAccepted,
          keepAssignmentIfRejected: input.keepAssignmentIfRejected,
          waitFor: input.waitFor
        }),
        reject: (
          eventId: string,
          requestId: string,
          input: Partial<
            Pick<
              RejectCorrectionActionInput,
              | 'transactionId'
              | 'annotation'
              | 'content'
              | 'keepAssignment'
              | 'keepAssignmentIfRejected'
              | 'keepAssignmentIfAccepted'
              | 'waitFor'
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
          content: input.content ?? { reason: 'too late' },
          keepAssignment: input.keepAssignment,
          keepAssignmentIfAccepted: input.keepAssignmentIfAccepted,
          keepAssignmentIfRejected: input.keepAssignmentIfRejected,
          waitFor: input.waitFor
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
    case ActionType.UNARCHIVE:
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
  dateOfEventId,
  actions = []
}: {
  id: string
  fields: FieldConfig[]
  placeOfEventId?: string
  dateOfEventId?: string
  /** Extra actions appended to the default READ + DECLARE pair, e.g. a REQUEST_CORRECTION action with its own correctionForm. */
  actions?: EventConfigInput['actions']
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
      },
      ...actions
    ]
  })
}

/**
 * The notification form is dropped, since it may refer to fields of the replaced declaration.
 * `getNotificationForm` then derives it from the new declaration.
 *
 * @returns a copy of the configuration with the DECLARE action's declaration replaced.
 */
export function withDeclaration(
  configuration: EventConfig,
  declaration: DeclarationFormConfig
): EventConfig {
  return {
    ...configuration,
    actions: configuration.actions.map((action) => {
      if (action.type === ActionType.DECLARE) {
        return { ...action, declaration }
      }

      if (action.type === ActionType.NOTIFY) {
        const { notificationForm: _notificationForm, ...notifyAction } = action
        return notifyAction
      }

      return action
    })
  }
}

/**
 * Get the leaf administrative area IDs from a list of administrative areas.
 *
 * A leaf administrative area is defined as an administrative area that does not have any children in the provided list.
 * AdministrativeArea  might have a CRVS_OFFICE as children, but is still considered to be a leaf administrative area.
 *
 * @param administrativeAreas - The list of administrative areas to search.
 * @returns The list of leaf administrative area IDs.
 */
export function getLeafAdministrativeAreaIds(
  administrativeAreas: Map<UUID, ClientAdministrativeArea>
): Array<{ id: UUID }> {
  const nonLeafAdministrativeAreaIds = new Set<string>()

  for (const [, location] of administrativeAreas) {
    if (location.parentId) {
      nonLeafAdministrativeAreaIds.add(location.parentId)
    }
  }

  const result: { id: UUID }[] = []
  for (const [id] of administrativeAreas) {
    if (!nonLeafAdministrativeAreaIds.has(id)) {
      result.push({ id })
    }
  }

  return result
}

/**
 *
 * @returns TokenPayload. Useful for building test setup for ValidatorContext
 */
function generateUserTokenPayload({
  role,
  scope
}: {
  role?: TestUserRole
  scope?: EncodedScope[]
}): ITokenPayload {
  return {
    // @TODO: Validate which fields are necessary https://github.com/opencrvs/opencrvs-core/issues/13530
    sub: generateUuid(),
    algorithm: 'RS256',
    exp: '1787221786',
    role: role ?? TestUserRole.enum.FIELD_AGENT,
    scope: scope ?? [
      encodeScope({
        type: 'record.read'
      })
    ],
    userType: TokenUserType.enum.user
  }
}

export function generateTestValidatorContext(
  userRole?: TestUserRole,
  eventWithConfig?: { event: EventDocument; eventConfig: EventConfig }
): ValidatorContext {
  const user = generateUserTokenPayload({ role: userRole })

  const leafAdminStructureLocationIds = getLeafAdministrativeAreaIds(
    V2_DEFAULT_MOCK_ADMINISTRATIVE_AREAS_MAP
  )

  if (!eventWithConfig) {
    return { user, leafAdminStructureLocationIds }
  }

  const { event, eventConfig } = eventWithConfig

  return {
    user,
    leafAdminStructureLocationIds,
    event: getEventValidatorContext(event, eventConfig)
  }
}
