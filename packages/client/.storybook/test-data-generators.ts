import {
  ActionType,
  DeclareActionInput,
  EventConfig,
  EventInput,
  findActiveActionFields,
  getUUID,
  mapFieldTypeToMockValue,
  RegisterActionInput,
  RequestCorrectionActionInput,
  stripHiddenOrDisabledFields,
  ValidateActionInput
} from '@opencrvs/commons/client'
import { tennisClubMembershipEvent } from '../src/v2-events/features/events/fixtures'
import { FetchUserQuery, Status } from '../src/utils/gateway'

export function generateActionInput(
  configuration: EventConfig,
  action: ActionType
) {
  const fields = findActiveActionFields(configuration, action) ?? []

  const data = fields.reduce(
    (acc, field, i) => ({
      ...acc,
      [field.id]: mapFieldTypeToMockValue(field, i)
    }),
    {}
  )

  // Strip away hidden or disabled fields from mock action data
  // If this is not done, the mock data might contain hidden or disabled fields, which will cause validation errors
  return stripHiddenOrDisabledFields(action, configuration, data)
}
/**
 * @returns a payload generator for creating events and actions with sensible defaults.
 */
/**
 * @returns a payload generator for creating events and actions with sensible defaults.
 */
export function payloadGenerator() {
  const event = {
    create: (input: Partial<EventInput> = {}) => ({
      transactionId: input.transactionId ?? getUUID(),
      type: input.type ?? 'TENNIS_CLUB_MEMBERSHIP'
    }),
    patch: (id: string, input: Partial<EventInput> = {}) => ({
      transactionId: input.transactionId ?? getUUID(),
      type: input.type ?? 'TENNIS_CLUB_MEMBERSHIP',
      id
    }),
    actions: {
      declare: (
        eventId: string,
        input: Partial<Pick<DeclareActionInput, 'transactionId' | 'data'>> = {}
      ) => ({
        type: ActionType.DECLARE,
        transactionId: input.transactionId ?? getUUID(),
        data:
          input.data ??
          generateActionInput(tennisClubMembershipEvent, ActionType.DECLARE),
        eventId
      }),
      validate: (
        eventId: string,
        input: Partial<Pick<ValidateActionInput, 'transactionId' | 'data'>> = {}
      ) => ({
        type: ActionType.VALIDATE,
        transactionId: input.transactionId ?? getUUID(),
        data: input.data ?? {},
        duplicates: [],
        eventId
      }),
      register: (
        eventId: string,
        input: Partial<Pick<RegisterActionInput, 'transactionId' | 'data'>> = {}
      ) => ({
        type: ActionType.REGISTER,
        transactionId: input.transactionId ?? getUUID(),
        data:
          input.data ??
          generateActionInput(tennisClubMembershipEvent, ActionType.REGISTER),
        eventId
      }),
      printCertificate: (
        eventId: string,
        input: Partial<Pick<RegisterActionInput, 'transactionId' | 'data'>> = {}
      ) => ({
        type: ActionType.PRINT_CERTIFICATE,
        transactionId: input.transactionId ?? getUUID(),
        data:
          input.data ??
          generateActionInput(
            tennisClubMembershipEvent,
            ActionType.PRINT_CERTIFICATE
          ),
        eventId
      }),
      correction: {
        request: (
          eventId: string,
          input: Partial<
            Pick<RequestCorrectionActionInput, 'transactionId' | 'data'>
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
          metadata: {},
          eventId
        }),
        approve: (
          eventId: string,
          requestId: string,
          input: Partial<
            Pick<RequestCorrectionActionInput, 'transactionId' | 'data'>
          > = {}
        ) => ({
          type: ActionType.APPROVE_CORRECTION,
          transactionId: input.transactionId ?? getUUID(),
          data:
            input.data ??
            generateActionInput(
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
            Pick<RequestCorrectionActionInput, 'transactionId' | 'data'>
          > = {}
        ) => ({
          type: ActionType.REJECT_CORRECTION,
          transactionId: input.transactionId ?? getUUID(),
          data:
            input.data ??
            generateActionInput(
              tennisClubMembershipEvent,
              ActionType.REJECT_CORRECTION
            ),
          eventId,
          requestId
        })
      }
    }
  }

  const user = {
    localRegistrar: () =>
      ({
        id: getUUID(),
        userMgntUserID: getUUID(),
        creationDate: '1737725915295',
        username: 'k.mweene',
        practitionerId: getUUID(),
        mobile: '+260933333333',
        email: 'kalushabwalya1.7@gmail.com',
        role: {
          label: {
            id: 'userRole.localRegistrar',
            defaultMessage: 'Local Registrar',
            description: 'Name for user role Local Registrar',
            __typename: 'I18nMessage'
          },
          __typename: 'UserRole'
        },
        status: Status.Active,
        name: [
          {
            use: 'en',
            firstNames: 'Kennedy',
            familyName: 'Mweene',
            __typename: 'HumanName'
          }
        ],
        primaryOffice: {
          id: 'dfcd1cbc-30c7-41a4-afd2-020515b4d78b',
          name: 'Ibombo District Office',
          alias: ['Ibombo District Office'],
          status: 'active',
          __typename: 'Location'
        },
        localRegistrar: {
          name: [
            {
              use: 'en',
              firstNames: 'Kennedy',
              familyName: 'Mweene',
              __typename: 'HumanName'
            }
          ],
          role: 'LOCAL_REGISTRAR',
          signature: null,
          __typename: 'LocalRegistrar'
        },
        avatar: null,
        searches: [],
        __typename: 'User'
      } satisfies FetchUserQuery['getUser'])
  }

  return { event, user }
}
