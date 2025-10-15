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
import { http, HttpResponse } from 'msw'
import { TRPCError } from '@trpc/server'
import {
  ActionStatus,
  ActionType,
  defineFormPage,
  EventConfig,
  FieldType,
  generateTransactionId,
  generateTranslationConfig,
  getCurrentEventState,
  getUUID,
  PageTypes,
  PrintCertificateAction,
  ActionUpdate,
  TestUserRole,
  AddressType,
  deepMerge
} from '@opencrvs/commons'
import { tennisClubMembershipEvent } from '@opencrvs/commons/fixtures'
import {
  createEvent,
  createTestClient,
  sanitizeForSnapshot,
  setupTestCase,
  TEST_USER_DEFAULT_SCOPES,
  UNSTABLE_EVENT_FIELDS
} from '@events/tests/utils'
import { mswServer } from '../../tests/msw'
import { env } from '../../environment'

describe('Adding actions', () => {
  test('actions can be added to created events', async () => {
    const { user, generator } = await setupTestCase()
    const client = createTestClient(user)

    const originalEvent = await client.event.create(generator.event.create())

    const event = await client.event.actions.declare.request(
      generator.event.actions.declare(originalEvent.id)
    )

    expect(event.actions).toEqual([
      expect.objectContaining({ type: ActionType.CREATE }),
      expect.objectContaining({ type: ActionType.ASSIGN }),
      expect.objectContaining({
        type: ActionType.DECLARE,
        status: ActionStatus.Requested
      }),
      expect.objectContaining({
        type: ActionType.DECLARE,
        status: ActionStatus.Accepted
      }),
      expect.objectContaining({ type: ActionType.UNASSIGN })
    ])
  })

  test('Event document contains all created actions', async () => {
    const { user, generator } = await setupTestCase()
    const client = createTestClient(user)

    const originalEvent = await client.event.create(generator.event.create())

    const generatedDeclaration = generator.event.actions.declare(
      originalEvent.id
    )
    await client.event.actions.declare.request(generatedDeclaration)

    const createAction = originalEvent.actions.filter(
      (action) => action.type === ActionType.CREATE
    )

    const assignmentInput = generator.event.actions.assign(originalEvent.id, {
      assignedTo: createAction[0].createdBy
    })

    await client.event.actions.assignment.assign(assignmentInput)

    const generatedValidation = generator.event.actions.validate(
      originalEvent.id
    )
    await client.event.actions.validate.request(generatedValidation)

    await client.event.actions.assignment.assign({
      ...assignmentInput,
      transactionId: getUUID()
    })

    const generatedRegistration = generator.event.actions.register(
      originalEvent.id
    )
    await client.event.actions.register.request(generatedRegistration)

    const updatedEvent = await client.event.get(originalEvent.id)

    expect(updatedEvent.actions).toEqual([
      expect.objectContaining({ type: ActionType.CREATE }),
      expect.objectContaining({ type: ActionType.ASSIGN }),
      expect.objectContaining({
        type: ActionType.DECLARE,
        status: ActionStatus.Requested
      }),
      expect.objectContaining({
        type: ActionType.DECLARE,
        status: ActionStatus.Accepted
      }),
      expect.objectContaining({ type: ActionType.UNASSIGN }),
      expect.objectContaining({ type: ActionType.ASSIGN }),
      expect.objectContaining({
        type: ActionType.VALIDATE,
        status: ActionStatus.Requested
      }),
      expect.objectContaining({
        type: ActionType.VALIDATE,
        status: ActionStatus.Accepted
      }),
      expect.objectContaining({ type: ActionType.UNASSIGN }),
      expect.objectContaining({ type: ActionType.ASSIGN }),
      expect.objectContaining({
        type: ActionType.REGISTER,
        status: ActionStatus.Requested
      }),
      expect.objectContaining({
        type: ActionType.REGISTER,
        status: ActionStatus.Accepted
      }),
      expect.objectContaining({ type: ActionType.UNASSIGN }),
      expect.objectContaining({ type: ActionType.READ })
    ])

    updatedEvent.actions.forEach((action) => {
      expect(action.createdAtLocation).toBe(user.primaryOfficeId)
      expect(action.createdByRole).toBe(user.role)
      expect(action.createdBySignature).toBe(user.signature)

      const actionsWithoutAnnotatation = [
        ActionType.CREATE,
        ActionType.READ,
        ActionType.ASSIGN,
        ActionType.UNASSIGN
      ]

      if (
        actionsWithoutAnnotatation.every((ac) => ac !== action.type) &&
        action.status !== ActionStatus.Accepted
      ) {
        expect(action).toHaveProperty('annotation')
      }
    })

    expect(
      sanitizeForSnapshot(updatedEvent, UNSTABLE_EVENT_FIELDS)
    ).toMatchSnapshot()
  })
})

describe('Action drafts', () => {
  test('READ action does not delete draft', async () => {
    const { user, generator } = await setupTestCase()
    const client = createTestClient(user)

    const originalEvent = await client.event.create(generator.event.create())

    const draftData = {
      type: ActionType.DECLARE,
      declaration: {
        ...generator.event.actions.declare(originalEvent.id).declaration,
        'applicant.image': {
          type: 'image/png',
          originalFilename: 'abcd.png',
          path: '/ocrvs/4f095fc4-4312-4de2-aa38-86dcc0f71044.png'
        }
      },
      transactionId: getUUID(),
      eventId: originalEvent.id,
      status: ActionStatus.Requested
    }

    await client.event.draft.create(draftData)

    const draftEvents = await client.event.draft.list()

    const event = await client.event.get(originalEvent.id)
    // this triggers READ action
    expect(event.actions.at(-1)?.type).toBe(ActionType.READ)

    const draftEventsAfterRead = await client.event.draft.list()

    expect(draftEvents).toEqual(draftEventsAfterRead)
  })

  test('Action other than READ deletes draft', async () => {
    const { user, generator } = await setupTestCase()
    const client = createTestClient(user)

    const originalEvent = await client.event.create(generator.event.create())

    const draftData = {
      type: ActionType.DECLARE,
      declaration: {
        ...generator.event.actions.declare(originalEvent.id).declaration,
        'applicant.image': {
          type: 'image/png',
          originalFilename: 'abcd.png',
          path: '/ocrvs/4f095fc4-4312-4de2-aa38-86dcc0f71044.png'
        }
      },
      transactionId: getUUID(),
      eventId: originalEvent.id,
      status: ActionStatus.Requested
    }

    await client.event.draft.create(draftData)

    const draftEvents = await client.event.draft.list()
    expect(draftEvents.length).toBe(1)

    await client.event.actions.declare.request(
      generator.event.actions.declare(originalEvent.id)
    )

    const draftEventsAfterRead = await client.event.draft.list()

    expect(draftEventsAfterRead.length).toBe(0)
  })
})

const multiFileConfig = {
  ...tennisClubMembershipEvent,
  id: 'death', // using existing event type id here, so that the user has the required scope to it
  declaration: {
    label: generateTranslationConfig('File club form'),
    pages: [
      defineFormPage({
        id: 'documents',
        type: PageTypes.enum.FORM,
        title: generateTranslationConfig('Upload supporting documents'),
        fields: [
          {
            id: 'documents.singleFile',
            type: FieldType.FILE,
            required: false,
            configuration: {},
            label: generateTranslationConfig('single file')
          },
          {
            id: 'documents.multiFile',
            type: FieldType.FILE_WITH_OPTIONS,
            required: false,
            label: generateTranslationConfig('multi file'),
            configuration: {},
            options: [
              {
                label: generateTranslationConfig('multi file option 1'),
                value: 'multifile1'
              },
              {
                label: generateTranslationConfig('multi file option 2'),
                value: 'multifile2'
              }
            ]
          }
        ]
      })
    ]
  },
  advancedSearch: []
} satisfies EventConfig

describe('Action updates', () => {
  const deleteFileMock = vi.fn()
  const fileExistsMock = vi.fn()

  beforeEach(() => {
    deleteFileMock.mockClear()
    fileExistsMock.mockClear()

    mswServer.use(
      http.get(`${env.COUNTRY_CONFIG_URL}/events`, () => {
        return HttpResponse.json([multiFileConfig, tennisClubMembershipEvent])
      }),
      http.head(`${env.DOCUMENTS_URL}/files/:filePath*`, (req) => {
        fileExistsMock(
          typeof req.params.filePath === 'string'
            ? req.params.filePath
            : req.params.filePath?.join('/')
        )
        return HttpResponse.json({ ok: true })
      }),
      http.delete(`${env.DOCUMENTS_URL}/files/:filePath*`, (req) => {
        deleteFileMock(
          typeof req.params.filePath === 'string'
            ? req.params.filePath
            : req.params.filePath?.join('/')
        )
        return HttpResponse.json({ ok: true })
      })
    )
  })

  const declarationWithFiles = {
    'documents.singleFile': {
      type: 'image/svg+xml',
      originalFilename: 'tree.svg',
      path: '/ocrvs/tree.svg'
    },
    'documents.multiFile': [
      {
        type: 'image/svg+xml',
        originalFilename: 'multi-file-1.svg',
        path: '/ocrvs/fish.svg',
        option: 'multifile1'
      },
      {
        type: 'image/svg+xml',
        originalFilename: 'multi-file-2.svg',
        path: '/ocrvs/mountain.svg',
        option: 'multifile2'
      }
    ]
  }

  it('partial declaration update accounts for conditional field values not in payload', async () => {
    const { user, generator } = await setupTestCase()
    const client = createTestClient(user)

    const originalEvent = await client.event.create(generator.event.create())

    await client.event.actions.declare.request(
      generator.event.actions.declare(originalEvent.id)
    )

    const createAction = originalEvent.actions.filter(
      (action) => action.type === ActionType.CREATE
    )

    await client.event.actions.assignment.assign(
      generator.event.actions.assign(originalEvent.id, {
        assignedTo: createAction[0].createdBy
      })
    )

    await client.event.actions.validate.request({
      type: ActionType.VALIDATE,
      declaration: {
        'applicant.dobUnknown': true,
        'applicant.age': 25
      },
      eventId: originalEvent.id,
      transactionId: getUUID()
    })

    const event = await client.event.get(originalEvent.id)
    const eventState = getCurrentEventState(event, tennisClubMembershipEvent)
    expect(eventState.declaration).toMatchSnapshot()
  })

  it('declaration including hidden fields throws error', async () => {
    const { user, generator } = await setupTestCase()
    const client = createTestClient(user)

    const originalEvent = await client.event.create(generator.event.create())

    const getDeclarationWithHiddenField = (declaration: ActionUpdate) => {
      return {
        ...declaration,
        'applicant.dobUnknown': true,
        'applicant.age': 19,
        'applicant.dob': '2000-01-01' // dob can't be known and unknown at the same time.
      }
    }

    const declarePayload = generator.event.actions.declare(originalEvent.id)
    const declarationWithHiddenField = getDeclarationWithHiddenField(
      declarePayload.declaration
    )

    const expectedError = new TRPCError({
      code: 'BAD_REQUEST',
      message: JSON.stringify([
        {
          message: 'Hidden or disabled field should not receive a value',
          id: 'applicant.dob',
          value: '2000-01-01'
        }
      ])
    })

    await expect(
      client.event.actions.declare.request({
        ...declarePayload,
        declaration: declarationWithHiddenField
      })
    ).rejects.toMatchObject(expectedError)

    const declaredEvent = await createEvent(client, generator, [
      ActionType.DECLARE
    ])
    const validatePayload = generator.event.actions.validate(declaredEvent.id)
    const validateDeclarationWithHiddenField = getDeclarationWithHiddenField(
      validatePayload.declaration
    )

    await expect(
      client.event.actions.validate.request({
        ...validatePayload,
        declaration: validateDeclarationWithHiddenField
      })
    ).rejects.toMatchObject(expectedError)

    const validatedEvent = await createEvent(client, generator, [
      ActionType.DECLARE,
      ActionType.VALIDATE
    ])

    const registerPayload = generator.event.actions.register(validatedEvent.id)
    const registerDeclarationWithHiddenField = getDeclarationWithHiddenField(
      registerPayload.declaration
    )

    await expect(
      client.event.actions.register.request({
        ...registerPayload,
        declaration: registerDeclarationWithHiddenField
      })
    ).rejects.toMatchObject(expectedError)
  })

  it('File references are removed with explicit null', async () => {
    const { user } = await setupTestCase()

    const client = createTestClient(user, [
      ...TEST_USER_DEFAULT_SCOPES,
      `search[event=${multiFileConfig.id},access=all]`
    ])

    const originalEvent = await client.event.create({
      transactionId: generateTransactionId(),
      type: multiFileConfig.id
    })

    await client.event.actions.declare.request({
      eventId: originalEvent.id,
      type: ActionType.DECLARE,
      declaration: declarationWithFiles,
      transactionId: generateTransactionId(),
      keepAssignment: true
    })

    const { results } = await client.event.search({
      query: {
        type: 'and',
        clauses: [
          {
            id: originalEvent.id,
            eventType: originalEvent.type
          }
        ]
      }
    })

    const [eventAfterDeclare] = results

    expect(eventAfterDeclare.declaration['documents.singleFile']).toBeDefined()
    expect(eventAfterDeclare.declaration['documents.multiFile']).toHaveLength(2)
    expect(eventAfterDeclare.declaration['documents.singleFile']).toBeDefined()

    await client.event.actions.validate.request({
      eventId: originalEvent.id,
      type: ActionType.VALIDATE,
      declaration: {
        'documents.multiFile': null,
        'documents.singleFile': null
      },

      transactionId: generateTransactionId(),
      keepAssignment: true
    })

    const { results: resultsAfterValidate } = await client.event.search({
      query: {
        type: 'and',
        clauses: [
          {
            id: originalEvent.id
          }
        ]
      }
    })

    const [eventAfterValidate] = resultsAfterValidate

    expect(
      eventAfterValidate.declaration['documents.singleFile']
    ).not.toBeDefined()
    expect(
      eventAfterValidate.declaration['documents.multiFile']
    ).not.toBeDefined()
  })

  it('file with option references are removed with empty array', async () => {
    const { user } = await setupTestCase()
    const client = createTestClient(user, [
      ...TEST_USER_DEFAULT_SCOPES,
      `search[event=${multiFileConfig.id},access=all]`
    ])
    const originalEvent = await client.event.create({
      transactionId: generateTransactionId(),
      type: multiFileConfig.id
    })

    await client.event.actions.declare.request({
      eventId: originalEvent.id,
      type: ActionType.DECLARE,
      declaration: declarationWithFiles,
      transactionId: generateTransactionId(),
      keepAssignment: true
    })

    const { results } = await client.event.search({
      query: {
        type: 'and',
        clauses: [
          {
            id: originalEvent.id
          }
        ]
      }
    })

    const [eventAfterDeclare] = results

    expect(eventAfterDeclare.declaration['documents.singleFile']).toBeDefined()
    expect(eventAfterDeclare.declaration['documents.multiFile']).toHaveLength(2)

    expect(fileExistsMock.mock.calls[0]).toEqual(['ocrvs/tree.svg'])

    await client.event.actions.validate.request({
      eventId: originalEvent.id,
      type: ActionType.VALIDATE,
      declaration: {
        'documents.multiFile': [],
        'documents.singleFile': null
      },
      transactionId: generateTransactionId(),
      keepAssignment: true
    })

    // No files should be deleted, only references removed
    expect(deleteFileMock.mock.calls).toHaveLength(0)

    const { results: resultsAfterValidate } = await client.event.search({
      query: {
        type: 'and',
        clauses: [
          {
            id: originalEvent.id
          }
        ]
      }
    })

    const [eventAfterValidate] = resultsAfterValidate
    expect(
      eventAfterValidate.declaration['documents.singleFile']
    ).not.toBeDefined()
    expect(eventAfterValidate.declaration['documents.multiFile']).toHaveLength(
      0
    )
  })
})

test('PRINT_CERTIFICATE action can include a valid content.templateId property in payload', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const originalEvent = await client.event.create(generator.event.create())

  await client.event.actions.declare.request(
    generator.event.actions.declare(originalEvent.id, { keepAssignment: true })
  )

  await client.event.actions.validate.request(
    generator.event.actions.validate(originalEvent.id, { keepAssignment: true })
  )

  await client.event.actions.register.request(
    generator.event.actions.register(originalEvent.id, { keepAssignment: true })
  )

  const basePrintAction = generator.event.actions.printCertificate(
    originalEvent.id,
    { keepAssignment: true }
  )
  const printActionWithDetails = {
    ...basePrintAction,
    content: {
      templateId: 'birth-certificate-template'
    }
  }

  const result = await client.event.actions.printCertificate.request(
    printActionWithDetails
  )
  expect(result).toBeDefined()

  const updatedEvent = await client.event.get(originalEvent.id)
  const printAction = updatedEvent.actions.find(
    (action) => action.type === ActionType.PRINT_CERTIFICATE
  ) as PrintCertificateAction
  expect(printAction.content?.templateId).toBeDefined()
})

test('REGISTER action throws when content property is in payload', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const originalEvent = await client.event.create(generator.event.create())

  await client.event.actions.declare.request(
    generator.event.actions.declare(originalEvent.id, { keepAssignment: true })
  )

  await client.event.actions.validate.request(
    generator.event.actions.validate(originalEvent.id, { keepAssignment: true })
  )

  const baseRegisterAction = generator.event.actions.register(originalEvent.id)
  const registerActionWithDetails = {
    ...baseRegisterAction,
    content: {
      templateId: 'some-template'
    }
  }

  await expect(
    client.event.actions.register.request(registerActionWithDetails)
  ).rejects.toThrow()
})

test('Can not add action with same [transactionId, type, status]', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const originalEvent = await client.event.create(generator.event.create())

  const createAction = originalEvent.actions.filter(
    (action) => action.type === ActionType.CREATE
  )
  const assignmentInput = generator.event.actions.assign(originalEvent.id, {
    assignedTo: createAction[0].createdBy
  })

  const declarePayload = generator.event.actions.declare(originalEvent.id)
  await client.event.actions.declare.request(declarePayload)

  await client.event.actions.assignment.assign({
    ...assignmentInput,
    transactionId: getUUID()
  })

  await client.event.actions.reject.request(
    generator.event.actions.reject(originalEvent.id)
  )

  const eventBeforeDuplicateAttempt =
    await client.event.actions.assignment.assign({
      ...assignmentInput,
      transactionId: getUUID()
    })

  const eventWithDuplicateAttempt = await client.event.actions.declare.request(
    generator.event.actions.declare(originalEvent.id, {
      transactionId: declarePayload.transactionId
    })
  )
  expect(eventBeforeDuplicateAttempt).toStrictEqual(eventWithDuplicateAttempt)

  const updatedEvent = await client.event.actions.declare.request({
    ...declarePayload,
    transactionId: getUUID()
  })

  expect(updatedEvent.actions).toStrictEqual([
    ...eventBeforeDuplicateAttempt.actions,
    expect.objectContaining({
      type: ActionType.DECLARE,
      status: ActionStatus.Requested
    }),
    expect.objectContaining({
      type: ActionType.DECLARE,
      status: ActionStatus.Accepted
    }),
    expect.objectContaining({ type: ActionType.UNASSIGN })
  ])
})

describe('Conditionals based on user role', () => {
  const baseDeclarationWithoutAddress = {
    'applicant.dob': '2025-07-22',
    'applicant.name': {
      surname: 'Feest',
      firstname: 'Jordan',
      middlename: 'Day'
    },
    'recommender.id': '123456789',
    'recommender.name': {
      surname: 'Feest',
      firstname: 'Jordan',
      middlename: 'Day'
    },
    'recommender.none': false,
    'applicant.isRecommendedByFieldAgent': true
  }

  it('SHOW Conditionals are evaluated for user roles', async () => {
    const { generator, seed, locations } = await setupTestCase()

    const declarationPayload = {
      ...baseDeclarationWithoutAddress,
      'applicant.address': {
        country: 'FAR',
        addressType: AddressType.DOMESTIC,
        administrativeArea: locations[0].id,
        streetLevelDetails: {
          town: 'Example Village'
        }
      }
    }

    const users = TestUserRole.options.map((role) => {
      return seed.user({
        primaryOfficeId: locations[0].id,
        name: [
          {
            use: 'en',
            family: role,
            given: ['John']
          }
        ],
        role
      })
    })

    expect(users).toHaveLength(7)
    for (const u of users) {
      const userClient = createTestClient(u)

      const event = await userClient.event.create(generator.event.create())

      if (u.role === TestUserRole.Enum.FIELD_AGENT) {
        await expect(
          userClient.event.actions.declare.request(
            generator.event.actions.declare(event.id, {
              declaration: declarationPayload
            })
          )
        ).resolves.toBeDefined()
      } else {
        await expect(
          userClient.event.actions.declare.request(
            generator.event.actions.declare(event.id, {
              declaration: declarationPayload
            })
          )
        ).rejects.toMatchObject(
          new TRPCError({
            code: 'BAD_REQUEST',
            message:
              '[{"message":"Hidden or disabled field should not receive a value","id":"applicant.isRecommendedByFieldAgent","value":true}]'
          })
        )
      }
    }
  })

  it('Indexed result is not affected by SHOW conditionals', async () => {
    const { generator, seed, locations } = await setupTestCase()
    const fieldAgent = seed.user({
      primaryOfficeId: locations[0].id,
      name: [
        {
          use: 'en',
          family: TestUserRole.Enum.FIELD_AGENT,
          given: ['John']
        }
      ],
      role: TestUserRole.Enum.FIELD_AGENT
    })

    const declarationPayload = deepMerge(baseDeclarationWithoutAddress, {
      'applicant.address': {
        country: 'FAR',
        addressType: AddressType.DOMESTIC,
        administrativeArea: locations[0].id,
        streetLevelDetails: {
          town: 'Example Village'
        }
      }
    })

    const fieldAgentClient = createTestClient(fieldAgent)

    const event = await fieldAgentClient.event.create(generator.event.create())

    await expect(
      fieldAgentClient.event.actions.declare.request(
        generator.event.actions.declare(event.id, {
          declaration: declarationPayload
        })
      )
    ).resolves.toBeDefined()

    const registrationAgent = seed.user({
      primaryOfficeId: locations[0].id,
      name: [
        {
          use: 'en',
          family: TestUserRole.Enum.REGISTRATION_AGENT,
          given: ['Jane']
        }
      ],
      role: TestUserRole.Enum.FIELD_AGENT
    })

    const registrationAgentClient = createTestClient(registrationAgent, [
      ...TEST_USER_DEFAULT_SCOPES,
      `search[event=${tennisClubMembershipEvent.id},access=all]`
    ])

    await registrationAgentClient.event.actions.assignment.assign({
      eventId: event.id,
      assignedTo: registrationAgent.id,
      transactionId: getUUID(),
      type: ActionType.ASSIGN
    })

    await expect(
      registrationAgentClient.event.actions.validate.request({
        type: ActionType.VALIDATE,
        declaration: {},
        eventId: event.id,
        transactionId: getUUID()
      })
    ).resolves.toBeDefined()

    const indexedEvent = await registrationAgentClient.event.search({
      query: {
        type: 'and',
        clauses: [
          {
            id: event.id
          }
        ]
      }
    })

    // Address is secured field.
    expect(indexedEvent.results[0].declaration).toEqual(
      baseDeclarationWithoutAddress
    )

    expect(
      indexedEvent.results[0].declaration['applicant.isRecommendedByFieldAgent']
    ).toEqual(true)
  })
})
