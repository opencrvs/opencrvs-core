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
  PrintCertificateAction
} from '@opencrvs/commons'
import { tennisClubMembershipEvent } from '@opencrvs/commons/fixtures'
import {
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
  id: 'multi-file-event',
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

const scopes = [
  ...TEST_USER_DEFAULT_SCOPES.filter(
    (scope) => !scope.startsWith('record.declare')
  ),
  `record.declare[event=${multiFileConfig.id}]`
]

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
      http.post(
        `${env.COUNTRY_CONFIG_URL}/events/multi-file-event/actions/:action`,
        (ctx) => {
          const payload =
            ctx.params.action === ActionType.REGISTER
              ? { registrationNumber: `ABC${Number(new Date())}` }
              : {}

          return HttpResponse.json(payload)
        }
      ),
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

    const assignmentInput = generator.event.actions.assign(originalEvent.id, {
      assignedTo: createAction[0].createdBy
    })

    await client.event.actions.assignment.assign(assignmentInput)

    await client.event.actions.validate.request({
      type: ActionType.VALIDATE,
      duplicates: [],
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

  it('File references are removed with explicit null', async () => {
    const { user } = await setupTestCase()
    const client = createTestClient(user, scopes)

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

    const [eventAfterDeclare] = await client.event.list()

    expect(eventAfterDeclare.declaration['documents.singleFile']).toBeDefined()
    expect(eventAfterDeclare.declaration['documents.multiFile']).toHaveLength(2)
    expect(eventAfterDeclare.declaration['documents.singleFile']).toBeDefined()

    await client.event.actions.validate.request({
      eventId: originalEvent.id,
      type: ActionType.VALIDATE,
      duplicates: [],
      declaration: {
        'documents.multiFile': null,
        'documents.singleFile': null
      },

      transactionId: generateTransactionId(),
      keepAssignment: true
    })

    const [eventAfterValidate] = await client.event.list()

    expect(
      eventAfterValidate.declaration['documents.singleFile']
    ).not.toBeDefined()
    expect(
      eventAfterValidate.declaration['documents.multiFile']
    ).not.toBeDefined()
  })

  it('file with option references are removed with empty array', async () => {
    const { user } = await setupTestCase()
    const client = createTestClient(user, scopes)

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

    const [eventAfterDeclare] = await client.event.list()

    expect(eventAfterDeclare.declaration['documents.singleFile']).toBeDefined()
    expect(eventAfterDeclare.declaration['documents.multiFile']).toHaveLength(2)

    expect(fileExistsMock.mock.calls[0]).toEqual(['ocrvs/tree.svg'])

    await client.event.actions.validate.request({
      eventId: originalEvent.id,
      type: ActionType.VALIDATE,
      duplicates: [],
      declaration: {
        'documents.multiFile': [],
        'documents.singleFile': null
      },
      transactionId: generateTransactionId(),
      keepAssignment: true
    })

    // No files should be deleted, only references removed
    expect(deleteFileMock.mock.calls).toHaveLength(0)
    const [eventAfterValidate] = await client.event.list()

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
