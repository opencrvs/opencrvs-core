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
  tennisClubMembershipEvent,
  ValidateActionInput
} from '@opencrvs/commons/client'

import { FetchUserQuery, Status } from '@client/utils/gateway'

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
export function testDataGenerator() {
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
    token: {
      fieldAgent:
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJyZWNvcmQuZGVjbGFyZS1iaXJ0aCIsInJlY29yZC5kZWNsYXJlLWRlYXRoIiwicmVjb3JkLmRlY2xhcmUtbWFycmlhZ2UiLCJyZWNvcmQuZGVjbGFyYXRpb24tc3VibWl0LWluY29tcGxldGUiLCJyZWNvcmQuZGVjbGFyYXRpb24tc3VibWl0LWZvci1yZXZpZXciLCJzZWFyY2guYmlydGgiLCJzZWFyY2guZGVhdGgiLCJzZWFyY2gubWFycmlhZ2UiLCJkZW1vIl0sImlhdCI6MTc0MDQwODQyNCwiZXhwIjoxNzQxMDEzMjI0LCJhdWQiOlsib3BlbmNydnM6YXV0aC11c2VyIiwib3BlbmNydnM6dXNlci1tZ250LXVzZXIiLCJvcGVuY3J2czpoZWFydGgtdXNlciIsIm9wZW5jcnZzOmdhdGV3YXktdXNlciIsIm9wZW5jcnZzOm5vdGlmaWNhdGlvbi11c2VyIiwib3BlbmNydnM6d29ya2Zsb3ctdXNlciIsIm9wZW5jcnZzOnNlYXJjaC11c2VyIiwib3BlbmNydnM6bWV0cmljcy11c2VyIiwib3BlbmNydnM6Y291bnRyeWNvbmZpZy11c2VyIiwib3BlbmNydnM6d2ViaG9va3MtdXNlciIsIm9wZW5jcnZzOmNvbmZpZy11c2VyIiwib3BlbmNydnM6ZG9jdW1lbnRzLXVzZXIiXSwiaXNzIjoib3BlbmNydnM6YXV0aC1zZXJ2aWNlIiwic3ViIjoiNjc3ZmIwODYzMGYzYWJmYTMzMDcyNzBmIn0.QcfnY1ZNysfvMr3RJBtZTiXNRWPZi2FUg41X_Iiz9uyMaZt8796Qg6tLZ9xD4dZEbFEau7ZfjrdUAq2l5utwJTBuBg5J_ksyy-S884PaZM4UFtbVDaV_6KKS0qJmrHivuEu-gNOazxnA_FsKtDTGWNqxofakLeuIG1OmvfbKv1uoKfKjdbbPSKH_HCl70fcY5IRJKRRyUaR_1FHcVHpB6-nFoQfvc-THZ-Idb5IMIADAdom3EYIetjFIOIFCgTo3IPSj2NmsHvtnLoWy-eiVCK5YM4pr2C6ioFRfclaWvb6irBTz-nB_gUTlYh7mHd-HdFDfzACW5DXRAuGtvvquVA',
      registrationAgent:
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJyZWNvcmQuZGVjbGFyZS1iaXJ0aCIsInJlY29yZC5kZWNsYXJlLWRlYXRoIiwicmVjb3JkLmRlY2xhcmUtbWFycmlhZ2UiLCJyZWNvcmQuZGVjbGFyYXRpb24tZWRpdCIsInJlY29yZC5kZWNsYXJhdGlvbi1zdWJtaXQtZm9yLWFwcHJvdmFsIiwicmVjb3JkLmRlY2xhcmF0aW9uLXN1Ym1pdC1mb3ItdXBkYXRlcyIsInJlY29yZC5kZWNsYXJhdGlvbi1hcmNoaXZlIiwicmVjb3JkLmRlY2xhcmF0aW9uLXJlaW5zdGF0ZSIsInJlY29yZC5yZWdpc3RyYXRpb24tcmVxdWVzdC1jb3JyZWN0aW9uIiwicmVjb3JkLmRlY2xhcmF0aW9uLXByaW50LXN1cHBvcnRpbmctZG9jdW1lbnRzIiwicmVjb3JkLmV4cG9ydC1yZWNvcmRzIiwicmVjb3JkLnJlZ2lzdHJhdGlvbi1wcmludCZpc3N1ZS1jZXJ0aWZpZWQtY29waWVzIiwicGVyZm9ybWFuY2UucmVhZCIsInBlcmZvcm1hbmNlLnJlYWQtZGFzaGJvYXJkcyIsIm9yZ2FuaXNhdGlvbi5yZWFkLWxvY2F0aW9uczpteS1vZmZpY2UiLCJzZWFyY2guYmlydGgiLCJzZWFyY2guZGVhdGgiLCJzZWFyY2gubWFycmlhZ2UiLCJkZW1vIl0sImlhdCI6MTc0MDQwNTYwMiwiZXhwIjoxNzQxMDEwNDAyLCJhdWQiOlsib3BlbmNydnM6YXV0aC11c2VyIiwib3BlbmNydnM6dXNlci1tZ250LXVzZXIiLCJvcGVuY3J2czpoZWFydGgtdXNlciIsIm9wZW5jcnZzOmdhdGV3YXktdXNlciIsIm9wZW5jcnZzOm5vdGlmaWNhdGlvbi11c2VyIiwib3BlbmNydnM6d29ya2Zsb3ctdXNlciIsIm9wZW5jcnZzOnNlYXJjaC11c2VyIiwib3BlbmNydnM6bWV0cmljcy11c2VyIiwib3BlbmNydnM6Y291bnRyeWNvbmZpZy11c2VyIiwib3BlbmNydnM6d2ViaG9va3MtdXNlciIsIm9wZW5jcnZzOmNvbmZpZy11c2VyIiwib3BlbmNydnM6ZG9jdW1lbnRzLXVzZXIiXSwiaXNzIjoib3BlbmNydnM6YXV0aC1zZXJ2aWNlIiwic3ViIjoiNjc3ZmIwODYzMGYzYWJmYTMzMDcyNzE4In0.NLFxHqIJj9lpO5BL6Pa7oIu4Obll2fmWLrg_5zIaT8HmggGHTa0wQwVG0BTPpwNmPCuQqTZPq9BSFeGUAFjyxJ2PHlwFl0rHGozDyp8HeMZLVwZqQMqW8MPyrTiTdnvC5MeQrCoC9fpK9PLmEd5FZ_JOQntaHDTgKP1DfbDurzS-_C_pnX2WBuVdEfklyvSKtV7nUp026DQd9drHyZs8kwwjwoSxhsdH72aRCWNBlSEx54GFQRmttP9VN7eSkxt-DedA9xyRZRPEkIEWdz-Dh-BFZggTYd423hntEYbldZl9LqjqPAPB-jrqebkgwjlYo-beSTMsmaq9fAc95uFf8A',
      localRegistrar:
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJyZWNvcmQuZGVjbGFyZS1iaXJ0aCIsInJlY29yZC5kZWNsYXJlLWRlYXRoIiwicmVjb3JkLmRlY2xhcmUtbWFycmlhZ2UiLCJyZWNvcmQuZGVjbGFyYXRpb24tZWRpdCIsInJlY29yZC5kZWNsYXJhdGlvbi1zdWJtaXQtZm9yLXVwZGF0ZXMiLCJyZWNvcmQucmV2aWV3LWR1cGxpY2F0ZXMiLCJyZWNvcmQuZGVjbGFyYXRpb24tYXJjaGl2ZSIsInJlY29yZC5kZWNsYXJhdGlvbi1yZWluc3RhdGUiLCJyZWNvcmQucmVnaXN0ZXIiLCJyZWNvcmQucmVnaXN0cmF0aW9uLWNvcnJlY3QiLCJyZWNvcmQuZGVjbGFyYXRpb24tcHJpbnQtc3VwcG9ydGluZy1kb2N1bWVudHMiLCJyZWNvcmQuZXhwb3J0LXJlY29yZHMiLCJyZWNvcmQudW5hc3NpZ24tb3RoZXJzIiwicmVjb3JkLnJlZ2lzdHJhdGlvbi1wcmludCZpc3N1ZS1jZXJ0aWZpZWQtY29waWVzIiwicmVjb3JkLmNvbmZpcm0tcmVnaXN0cmF0aW9uIiwicmVjb3JkLnJlamVjdC1yZWdpc3RyYXRpb24iLCJwZXJmb3JtYW5jZS5yZWFkIiwicGVyZm9ybWFuY2UucmVhZC1kYXNoYm9hcmRzIiwicHJvZmlsZS5lbGVjdHJvbmljLXNpZ25hdHVyZSIsIm9yZ2FuaXNhdGlvbi5yZWFkLWxvY2F0aW9uczpteS1vZmZpY2UiLCJzZWFyY2guYmlydGgiLCJzZWFyY2guZGVhdGgiLCJzZWFyY2gubWFycmlhZ2UiLCJkZW1vIl0sImlhdCI6MTczNzcyODc1MCwiZXhwIjoxNzM4MzMzNTUwLCJhdWQiOlsib3BlbmNydnM6YXV0aC11c2VyIiwib3BlbmNydnM6dXNlci1tZ250LXVzZXIiLCJvcGVuY3J2czpoZWFydGgtdXNlciIsIm9wZW5jcnZzOmdhdGV3YXktdXNlciIsIm9wZW5jcnZzOm5vdGlmaWNhdGlvbi11c2VyIiwib3BlbmNydnM6d29ya2Zsb3ctdXNlciIsIm9wZW5jcnZzOnNlYXJjaC11c2VyIiwib3BlbmNydnM6bWV0cmljcy11c2VyIiwib3BlbmNydnM6Y291bnRyeWNvbmZpZy11c2VyIiwib3BlbmNydnM6d2ViaG9va3MtdXNlciIsIm9wZW5jcnZzOmNvbmZpZy11c2VyIiwib3BlbmNydnM6ZG9jdW1lbnRzLXVzZXIiXSwiaXNzIjoib3BlbmNydnM6YXV0aC1zZXJ2aWNlIiwic3ViIjoiNjc5M2EyZDdmYWQ4NmRhOTQ3YmFjY2YxIn0.I9n81VBdwjgyDh9rK7noCa2F4pl9WPbQJttHN6DI3pD6Xu5pPK25j9FdlQ6JiYG47cWji-J6UzsiZ_Nk7kz9paBlJyS2qts0otuSaz95B-vSRIN18MeF45CoM6ZmNJj2qbk8Enn8ZXs8VB4XH6cN8h30KWsa7-117dGc-Zmm62dkAFS61QR3hmXomexPVFtf5t_w4AOOiAfyyUI6qQHevDA6xXCWdfE2UaIXs5p2_5Hh7qUHLH258PCEgvo__qjmVo3FFAKL6bvmSIPVGwu8pMQK6R0y5ILe1rG-ZFb7nhpvVjywCiN4N4GtRbnQ3beBWG5Up8oKxwovxk9gVCbinw'
    },
    fieldAgent: () =>
      ({
        id: getUUID(),
        userMgntUserID: getUUID(),
        creationDate: '1736421510056',
        username: 'k.bwalya',
        practitionerId: getUUID(),
        mobile: '+260911111111',
        email: 'kalushabwalya17@gmail.com',
        role: {
          label: {
            id: 'userRole.socialWorker',
            defaultMessage: 'Social Worker',
            description: 'Name for user role Social Worker',
            __typename: 'I18nMessage'
          },
          __typename: 'UserRole'
        },
        status: Status.Active,
        name: [
          {
            use: 'en',
            firstNames: 'Kalusha',
            familyName: 'Bwalya',
            __typename: 'HumanName'
          }
        ],
        primaryOffice: {
          id: '657f43f7-4e85-40bf-a447-13d85de01084',
          name: 'Ibombo District Office',
          alias: ['Ibombo District Office'],
          status: 'active',
          __typename: 'Location'
        },
        localRegistrar: null,
        avatar: null,
        searches: [],
        __typename: 'User'
      } satisfies FetchUserQuery['getUser']),
    registrationAgent: () =>
      ({
        id: getUUID(),
        userMgntUserID: getUUID(),
        creationDate: '1736421510209',
        username: 'f.katongo',
        practitionerId: getUUID(),
        mobile: '+260922222222',
        email: 'kalushabwalya17+@gmail.com',
        role: {
          label: {
            id: 'userRole.registrationAgent',
            defaultMessage: 'Registration Agent',
            description: 'Name for user role Registration Agent',
            __typename: 'I18nMessage'
          },
          __typename: 'UserRole'
        },
        status: Status.Active,
        name: [
          {
            use: 'en',
            firstNames: 'Felix',
            familyName: 'Katongo',
            __typename: 'HumanName'
          }
        ],
        primaryOffice: {
          id: '657f43f7-4e85-40bf-a447-13d85de01084',
          name: 'Ibombo District Office',
          alias: ['Ibombo District Office'],
          status: 'active',
          __typename: 'Location'
        },
        localRegistrar: null,
        avatar: null,
        searches: [],
        __typename: 'User'
      } satisfies FetchUserQuery['getUser']),
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
