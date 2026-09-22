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

import { HttpResponse, http } from 'msw'
import { ActionDocument, generateRegistrationNumber } from '@opencrvs/commons'
import {
  ActionStatus,
  ActionType,
  AddressType,
  encodeScope,
  EventDocument,
  getOrThrow,
  getUUID,
  UUID
} from '@opencrvs/commons'
import {
  createEvent,
  createSystemTestClient,
  createTestClient,
  setupTestCase,
  TEST_SYSTEM_ID,
  TEST_USER_DEFAULT_SCOPES
} from '@events/tests/utils'
import { mswServer } from '@events/tests/msw'
import { env } from '@events/environment'
import { ConfirmableActionType } from './actions'

// @TODO: import once pyry is merged in.
const CONFIRMATION_SCOPES = TEST_USER_DEFAULT_SCOPES

type PendingAction = {
  actionId: UUID
  eventId: UUID
  accept: (overridePayload?: Record<string, unknown>) => Promise<EventDocument>
  reject: (overridePayload?: Record<string, unknown>) => Promise<EventDocument>
}

const MOCK_REGISTRATION_NUMBER = '1MY2TEST3NRO'
const CUSTOM_ACTION_TYPE = 'CONFIRM_SENIOR_MEMBERSHIP'
const SENIOR_DATE_OF_BIRTH = '1949-05-10'

const confirmer = createSystemTestClient(TEST_SYSTEM_ID, CONFIRMATION_SCOPES)

function mockActionApi(
  action: ActionType,
  status: number,
  body: Record<string, unknown>
) {
  return mswServer.use(
    http.post(
      `${env.COUNTRY_CONFIG_URL}/trigger/events/tennis-club-membership/actions/${action}`,
      () => HttpResponse.json(body, { status })
    )
  )
}

function requestedActionId(event: EventDocument, type: ActionType) {
  return getOrThrow(
    event.actions.find(
      (action) =>
        action.type === type && action.status === ActionStatus.Requested
    )?.id,
    `Could not find a requested ${type} action`
  )
}

function correctionRequestId(event: EventDocument) {
  return getOrThrow(
    event.actions.find(
      (action) =>
        action.type === ActionType.REQUEST_CORRECTION &&
        action.status === ActionStatus.Accepted
    )?.id,
    'Could not find an accepted REQUEST_CORRECTION action'
  )
}

async function requestPendingNotify(
  status: number,
  syncPayload: Record<string, unknown>
): Promise<PendingAction> {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)
  const event = await client.event.create(generator.event.create())
  const payload = generator.event.actions.notify(event.id, {
    waitFor: false
  })

  mockActionApi(ActionType.NOTIFY, status, syncPayload)

  const requested = await client.event.actions.notify.request(payload)
  const actionId = requestedActionId(requested, ActionType.NOTIFY)

  return {
    actionId,
    eventId: event.id,
    accept: async (overridePayload?: Record<string, unknown>) =>
      confirmer.event.actions.notify.accept({
        ...(overridePayload ?? payload),
        eventId: event.id,
        transactionId: getUUID(),
        actionId
      }),
    reject: async (overridePayload?: Record<string, unknown>) =>
      confirmer.event.actions.notify.reject({
        ...(overridePayload ?? payload),
        eventId: event.id,
        transactionId: getUUID(),
        actionId,
        waitFor: false
      })
  }
}

async function requestPendingDeclare(
  status: number,
  syncPayload: Record<string, unknown>
): Promise<PendingAction> {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)
  const event = await client.event.create(generator.event.create())
  const payload = generator.event.actions.declare(event.id, {
    waitFor: false
  })

  mockActionApi(ActionType.DECLARE, status, syncPayload)

  const requested = await client.event.actions.declare.request(payload)
  const actionId = requestedActionId(requested, ActionType.DECLARE)

  return {
    actionId,
    eventId: event.id,
    accept: async (overridePayload?: Record<string, unknown>) =>
      confirmer.event.actions.declare.accept({
        ...(overridePayload ?? payload),
        eventId: event.id,
        transactionId: getUUID(),
        actionId
      }),
    reject: async (overridePayload?: Record<string, unknown>) =>
      confirmer.event.actions.declare.reject({
        ...(overridePayload ?? payload),
        eventId: event.id,
        transactionId: getUUID(),
        actionId,
        waitFor: false
      })
  }
}

async function requestPendingEdit(
  status: number,
  syncPayload: Record<string, unknown>
): Promise<PendingAction> {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)
  const event = await createEvent(
    client,
    generator,
    [ActionType.DECLARE],
    false
  )
  const payload = generator.event.actions.edit(event.id, {
    waitFor: false
  })

  mockActionApi(ActionType.EDIT, status, syncPayload)

  const requested = await client.event.actions.edit.request(payload)
  const actionId = requestedActionId(requested, ActionType.EDIT)

  return {
    actionId,
    eventId: event.id,
    accept: async (overridePayload?: Record<string, unknown>) =>
      confirmer.event.actions.edit.accept({
        ...(overridePayload ?? payload),
        eventId: event.id,
        transactionId: getUUID(),
        actionId
      }),
    reject: async (overridePayload?: Record<string, unknown>) =>
      confirmer.event.actions.edit.reject({
        ...(overridePayload ?? payload),
        eventId: event.id,
        transactionId: getUUID(),
        actionId,
        waitFor: false
      })
  }
}

async function requestPendingReject(
  status: number,
  syncPayload: Record<string, unknown>
): Promise<PendingAction> {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)
  const event = await createEvent(
    client,
    generator,
    [ActionType.DECLARE],
    false
  )
  const payload = generator.event.actions.reject(event.id, {
    waitFor: false
  })

  mockActionApi(ActionType.REJECT, status, syncPayload)

  const requested = await client.event.actions.reject.request(payload)
  const actionId = requestedActionId(requested, ActionType.REJECT)

  return {
    actionId,
    eventId: event.id,
    accept: async (overridePayload?: Record<string, unknown>) =>
      confirmer.event.actions.reject.accept({
        ...(overridePayload ?? payload),
        eventId: event.id,
        transactionId: getUUID(),
        actionId
      }),
    reject: async (overridePayload?: Record<string, unknown>) =>
      confirmer.event.actions.reject.reject({
        ...(overridePayload ?? payload),
        eventId: event.id,
        transactionId: getUUID(),
        actionId,
        waitFor: false
      })
  }
}

async function requestPendingArchive(
  status: number,
  syncPayload: Record<string, unknown>
): Promise<PendingAction> {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)
  const event = await createEvent(
    client,
    generator,
    [ActionType.DECLARE],
    false
  )
  const payload = generator.event.actions.archive(event.id, {
    waitFor: false
  })

  mockActionApi(ActionType.ARCHIVE, status, syncPayload)

  const requested = await client.event.actions.archive.request(payload)
  const actionId = requestedActionId(requested, ActionType.ARCHIVE)

  return {
    actionId,
    eventId: event.id,
    accept: async (overridePayload?: Record<string, unknown>) =>
      confirmer.event.actions.archive.accept({
        ...(overridePayload ?? payload),
        eventId: event.id,
        transactionId: getUUID(),
        actionId
      }),
    reject: async (overridePayload?: Record<string, unknown>) =>
      confirmer.event.actions.archive.reject({
        ...(overridePayload ?? payload),
        eventId: event.id,
        transactionId: getUUID(),
        actionId,
        waitFor: false
      })
  }
}

async function requestPendingUnarchive(
  status: number,
  syncPayload: Record<string, unknown>
): Promise<PendingAction> {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)
  const event = await createEvent(
    client,
    generator,
    [ActionType.DECLARE, ActionType.ARCHIVE],
    false
  )
  const payload = generator.event.actions.unarchive(event.id, {
    waitFor: false
  })

  mockActionApi(ActionType.UNARCHIVE, status, syncPayload)

  const requested = await client.event.actions.unarchive.request(payload)
  const actionId = requestedActionId(requested, ActionType.UNARCHIVE)

  return {
    actionId,
    eventId: event.id,
    accept: async (overridePayload?: Record<string, unknown>) =>
      confirmer.event.actions.unarchive.accept({
        ...(overridePayload ?? payload),
        eventId: event.id,
        transactionId: getUUID(),
        actionId
      }),
    reject: async (overridePayload?: Record<string, unknown>) =>
      confirmer.event.actions.unarchive.reject({
        ...(overridePayload ?? payload),
        eventId: event.id,
        transactionId: getUUID(),
        actionId,
        waitFor: false
      })
  }
}

async function requestPendingRegister(
  status: number,
  syncPayload: Record<string, unknown>
): Promise<PendingAction> {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)
  const event = await createEvent(
    client,
    generator,
    [ActionType.DECLARE],
    false
  )
  const payload = generator.event.actions.register(event.id, {
    waitFor: false
  })

  mockActionApi(ActionType.REGISTER, status, syncPayload)

  const requested = await client.event.actions.register.request(payload)
  const actionId = requestedActionId(requested, ActionType.REGISTER)

  return {
    actionId,
    eventId: event.id,
    accept: async (overridePayload?: Record<string, unknown>) =>
      confirmer.event.actions.register.accept({
        ...(overridePayload ?? payload),
        eventId: event.id,
        transactionId: getUUID(),
        actionId,
        registrationNumber: MOCK_REGISTRATION_NUMBER
      }),
    reject: async (overridePayload?: Record<string, unknown>) =>
      confirmer.event.actions.register.reject({
        ...(overridePayload ?? payload),
        eventId: event.id,
        transactionId: getUUID(),
        actionId,
        waitFor: false
      })
  }
}

async function requestPendingPrintCertificate(
  status: number,
  syncPayload: Record<string, unknown>
): Promise<PendingAction> {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)
  const event = await createEvent(
    client,
    generator,
    [ActionType.DECLARE, ActionType.REGISTER],
    false
  )
  const payload = generator.event.actions.printCertificate(event.id, {
    waitFor: false
  })

  mockActionApi(ActionType.PRINT_CERTIFICATE, status, syncPayload)

  const requested = await client.event.actions.printCertificate.request(payload)
  const actionId = requestedActionId(requested, ActionType.PRINT_CERTIFICATE)

  return {
    actionId,
    eventId: event.id,
    accept: async (overridePayload?: Record<string, unknown>) =>
      confirmer.event.actions.printCertificate.accept({
        ...(overridePayload ?? payload),
        eventId: event.id,
        transactionId: getUUID(),
        actionId
      }),
    reject: async (overridePayload?: Record<string, unknown>) =>
      confirmer.event.actions.printCertificate.reject({
        ...(overridePayload ?? payload),
        eventId: event.id,
        transactionId: getUUID(),
        actionId,
        waitFor: false
      })
  }
}

async function requestPendingRequestCorrection(
  status: number,
  syncPayload: Record<string, unknown>
): Promise<PendingAction> {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)
  const event = await createEvent(
    client,
    generator,
    [ActionType.DECLARE, ActionType.REGISTER],
    false
  )
  const payload = generator.event.actions.correction.request(event.id, {
    waitFor: false
  })

  mockActionApi(ActionType.REQUEST_CORRECTION, status, syncPayload)

  const requested =
    await client.event.actions.correction.request.request(payload)
  const actionId = requestedActionId(requested, ActionType.REQUEST_CORRECTION)

  return {
    actionId,
    eventId: event.id,
    accept: async (overridePayload?: Record<string, unknown>) =>
      confirmer.event.actions.correction.request.accept({
        ...(overridePayload ?? payload),
        eventId: event.id,
        transactionId: getUUID(),
        actionId
      }),
    reject: async (overridePayload?: Record<string, unknown>) =>
      confirmer.event.actions.correction.request.reject({
        ...(overridePayload ?? payload),
        eventId: event.id,
        transactionId: getUUID(),
        actionId,
        waitFor: false
      })
  }
}

async function requestPendingApproveCorrection(
  status: number,
  syncPayload: Record<string, unknown>
): Promise<PendingAction> {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)
  const event = await createEvent(
    client,
    generator,
    [ActionType.DECLARE, ActionType.REGISTER, ActionType.REQUEST_CORRECTION],
    false
  )
  const payload = generator.event.actions.correction.approve(
    event.id,
    correctionRequestId(event),
    { waitFor: false }
  )

  mockActionApi(ActionType.APPROVE_CORRECTION, status, syncPayload)

  const requested =
    await client.event.actions.correction.approve.request(payload)
  const actionId = requestedActionId(requested, ActionType.APPROVE_CORRECTION)

  return {
    actionId,
    eventId: event.id,
    accept: async (overridePayload?: Record<string, unknown>) =>
      confirmer.event.actions.correction.approve.accept({
        ...(overridePayload ?? payload),
        eventId: event.id,
        transactionId: getUUID(),
        actionId
      }),
    reject: async (overridePayload?: Record<string, unknown>) =>
      confirmer.event.actions.correction.approve.reject({
        ...(overridePayload ?? payload),
        eventId: event.id,
        transactionId: getUUID(),
        actionId,
        waitFor: false
      })
  }
}

async function requestPendingRejectCorrection(
  status: number,
  syncPayload: Record<string, unknown>
): Promise<PendingAction> {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)
  const event = await createEvent(
    client,
    generator,
    [ActionType.DECLARE, ActionType.REGISTER, ActionType.REQUEST_CORRECTION],
    false
  )
  const payload = generator.event.actions.correction.reject(
    event.id,
    correctionRequestId(event),
    { waitFor: false }
  )

  mockActionApi(ActionType.REJECT_CORRECTION, status, syncPayload)

  const requested =
    await client.event.actions.correction.reject.request(payload)
  const actionId = requestedActionId(requested, ActionType.REJECT_CORRECTION)

  return {
    actionId,
    eventId: event.id,
    accept: async (overridePayload?: Record<string, unknown>) =>
      confirmer.event.actions.correction.reject.accept({
        ...(overridePayload ?? payload),
        eventId: event.id,
        transactionId: getUUID(),
        actionId
      }),
    reject: async (overridePayload?: Record<string, unknown>) =>
      confirmer.event.actions.correction.reject.reject({
        ...(overridePayload ?? payload),
        eventId: event.id,
        transactionId: getUUID(),
        actionId,
        waitFor: false
      })
  }
}

async function requestPendingCustom(
  status: number,
  syncPayload: Record<string, unknown>
): Promise<PendingAction> {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user, [
    encodeScope({ type: 'record.create' }),
    encodeScope({ type: 'record.read' }),
    encodeScope({ type: 'record.declare' }),
    encodeScope({
      type: 'record.custom-action',
      options: { customActionTypes: [CUSTOM_ACTION_TYPE] }
    })
  ])

  const event = await client.event.create(generator.event.create())
  const assignment = generator.event.actions.assign(event.id, {
    waitFor: false,
    assignedTo: getOrThrow(
      event.actions.find((action) => action.type === ActionType.CREATE)
        ?.createdBy,
      'Could not find the create action'
    )
  })

  await client.event.actions.assignment.assign(assignment)
  await client.event.actions.declare.request(
    generator.event.actions.declare(event.id, {
      waitFor: false,
      declaration: {
        'applicant.dob': SENIOR_DATE_OF_BIRTH,
        'senior-pass.id': 'SP-123456',
        'senior-pass.recommender': false,
        'applicant.dobUnknown': false,
        'applicant.name': { firstname: 'John', surname: 'Doe' },
        'recommender.none': true,
        'applicant.address': {
          country: 'FAR',
          addressType: AddressType.DOMESTIC,
          administrativeArea: '27160bbd-32d1-4625-812f-860226bfb92a',
          streetLevelDetails: { state: 'state', district2: 'district2' }
        }
      }
    })
  )
  await client.event.actions.assignment.assign(assignment)

  const payload = {
    type: ActionType.CUSTOM,
    eventId: event.id,
    transactionId: getUUID(),
    customActionType: CUSTOM_ACTION_TYPE,
    annotation: { notes: 'Confirmed membership' },
    waitFor: false
  }

  mockActionApi(ActionType.CUSTOM, status, syncPayload)

  const requested = await client.event.actions.custom.request(payload)
  const actionId = requestedActionId(requested, ActionType.CUSTOM)

  return {
    actionId,
    eventId: event.id,
    accept: async (overridePayload?: Record<string, unknown>) =>
      confirmer.event.actions.custom.accept({
        ...(overridePayload ?? payload),
        eventId: event.id,
        transactionId: getUUID(),
        actionId
      }),
    reject: async (overridePayload?: Record<string, unknown>) =>
      confirmer.event.actions.custom.reject({
        ...(overridePayload ?? payload),
        eventId: event.id,
        transactionId: getUUID(),
        actionId,
        waitFor: false
      })
  }
}

const PENDING_ACTIONS = {
  [ActionType.NOTIFY]: requestPendingNotify,
  [ActionType.DECLARE]: requestPendingDeclare,
  [ActionType.EDIT]: requestPendingEdit,
  [ActionType.REJECT]: requestPendingReject,
  [ActionType.ARCHIVE]: requestPendingArchive,
  [ActionType.UNARCHIVE]: requestPendingUnarchive,
  [ActionType.REGISTER]: requestPendingRegister,
  [ActionType.PRINT_CERTIFICATE]: requestPendingPrintCertificate,
  [ActionType.REQUEST_CORRECTION]: requestPendingRequestCorrection,
  [ActionType.APPROVE_CORRECTION]: requestPendingApproveCorrection,
  [ActionType.REJECT_CORRECTION]: requestPendingRejectCorrection,
  [ActionType.CUSTOM]: requestPendingCustom
} satisfies Record<
  ConfirmableActionType,
  (status: number, payload: Record<string, unknown>) => Promise<PendingAction>
>

describe.each(Object.entries(PENDING_ACTIONS))(
  '%s reject',
  (type, requestPendingAction) => {
    test('synchronous declaration and annotation in response are ignored', async () => {
      const pending = await requestPendingAction(400, {
        declaration: {
          cat: 'kissa',
          'applicant.dob': 100
        },
        annotation: {
          dog: 'koira'
        }
      })

      const response = await confirmer.event.get({
        eventId: pending.eventId
      })

      const syncAction = getOrThrow(
        response.actions.find(
          (action) =>
            action.type === type && action.status === ActionStatus.Rejected
        ),
        'action not found'
      ) as ActionDocument

      expect(syncAction.declaration).toEqual({})
      expect(syncAction.annotation).toBeUndefined()
    })

    test('async declaration and annotation in reject payload are ignored', async () => {
      const pending = await requestPendingAction(202, {})

      const response = await pending.reject({
        declaration: {
          cat: 'kissa',
          'applicant.dob': 100
        },
        annotation: {
          dog: 'koira'
        },
        eventId: pending.eventId,
        waitFor: false
      })

      const syncAction = getOrThrow(
        response.actions.find(
          (action) =>
            action.type === type && action.status === ActionStatus.Rejected
        ),
        'action not found'
      ) as ActionDocument

      expect(syncAction.declaration).toEqual({})
      expect(syncAction.annotation).toBeUndefined()
    })
  }
)

describe.each(Object.entries(PENDING_ACTIONS))(
  '%s synchronous accept',
  (type, requestPendingAction) => {
    test('error is thrown when annotation or action includes bad data', async () => {
      const annotableActionError =
        '[{"message":"Unexpected field","id":"cat","value":"kissa"},{"message":"Invalid input","id":"applicant.dob","value":100},{"message":"Unexpected field","id":"dog","value":"koira"}]'

      const nonAnnotableActionError =
        '[{"message":"Unexpected field","id":"cat","value":"kissa"},{"message":"Invalid input","id":"applicant.dob","value":100}]'

      const nonAnnotableActions = [
        ActionType.EDIT,
        ActionType.REJECT_CORRECTION,
        ActionType.APPROVE_CORRECTION,
        ActionType.ARCHIVE,
        ActionType.UNARCHIVE
      ]
      await expect(
        requestPendingAction(200, {
          registrationNumber:
            type === ActionType.REGISTER
              ? generateRegistrationNumber(() => 0.1)
              : undefined,
          declaration: {
            cat: 'kissa',
            'applicant.dob': 100
          },
          annotation: {
            dog: 'koira'
          }
        })
      ).rejects.toThrow(
        nonAnnotableActions.some((na) => na === type)
          ? nonAnnotableActionError
          : annotableActionError
      )
    })
  }
)
