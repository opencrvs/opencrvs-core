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
import { ConfirmableActionType } from '@events/router/event/actions'
import {
  CONFIRMATION_SCOPES,
  createEvent,
  createSystemTestClient,
  createTestClient,
  setupTestCase,
  TEST_SYSTEM_ID
} from '@events/tests/utils'
import { mswServer } from '@events/tests/msw'
import { env } from '@events/environment'

type PendingAction = {
  actionId: UUID
  accept: () => Promise<EventDocument>
  reject: () => Promise<EventDocument>
}

const MOCK_REGISTRATION_NUMBER = '1MY2TEST3NRO'
const CUSTOM_ACTION_TYPE = 'CONFIRM_SENIOR_MEMBERSHIP'
const SENIOR_DATE_OF_BIRTH = '1949-05-10'

const confirmer = createSystemTestClient(TEST_SYSTEM_ID, CONFIRMATION_SCOPES)

function mockActionApi(action: ActionType, status: number) {
  return mswServer.use(
    http.post(
      `${env.COUNTRY_CONFIG_URL}/trigger/events/tennis-club-membership/actions/${action}`,
      () => HttpResponse.json({}, { status })
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

async function requestPendingNotify(): Promise<PendingAction> {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)
  const event = await client.event.create(generator.event.create())
  const payload = generator.event.actions.notify(event.id)

  mockActionApi(ActionType.NOTIFY, 202)

  const requested = await client.event.actions.notify.request(payload)
  const actionId = requestedActionId(requested, ActionType.NOTIFY)

  return {
    actionId,
    accept: async () =>
      confirmer.event.actions.notify.accept({
        ...payload,
        transactionId: getUUID(),
        actionId
      }),
    reject: async () =>
      confirmer.event.actions.notify.reject({
        eventId: event.id,
        transactionId: getUUID(),
        actionId
      })
  }
}

async function requestPendingDeclare(): Promise<PendingAction> {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)
  const event = await client.event.create(generator.event.create())
  const payload = generator.event.actions.declare(event.id)

  mockActionApi(ActionType.DECLARE, 202)

  const requested = await client.event.actions.declare.request(payload)
  const actionId = requestedActionId(requested, ActionType.DECLARE)

  return {
    actionId,
    accept: async () =>
      confirmer.event.actions.declare.accept({
        ...payload,
        transactionId: getUUID(),
        actionId
      }),
    reject: async () =>
      confirmer.event.actions.declare.reject({
        eventId: event.id,
        transactionId: getUUID(),
        actionId
      })
  }
}

async function requestPendingEdit(): Promise<PendingAction> {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)
  const event = await createEvent(client, generator, [ActionType.DECLARE])
  const payload = generator.event.actions.edit(event.id)

  mockActionApi(ActionType.EDIT, 202)

  const requested = await client.event.actions.edit.request(payload)
  const actionId = requestedActionId(requested, ActionType.EDIT)

  return {
    actionId,
    accept: async () =>
      confirmer.event.actions.edit.accept({
        ...payload,
        transactionId: getUUID(),
        actionId
      }),
    reject: async () =>
      confirmer.event.actions.edit.reject({
        eventId: event.id,
        transactionId: getUUID(),
        actionId
      })
  }
}

async function requestPendingReject(): Promise<PendingAction> {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)
  const event = await createEvent(client, generator, [ActionType.DECLARE])
  const payload = generator.event.actions.reject(event.id)

  mockActionApi(ActionType.REJECT, 202)

  const requested = await client.event.actions.reject.request(payload)
  const actionId = requestedActionId(requested, ActionType.REJECT)

  return {
    actionId,
    accept: async () =>
      confirmer.event.actions.reject.accept({
        ...payload,
        transactionId: getUUID(),
        actionId
      }),
    reject: async () =>
      confirmer.event.actions.reject.reject({
        eventId: event.id,
        transactionId: getUUID(),
        actionId
      })
  }
}

async function requestPendingArchive(): Promise<PendingAction> {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)
  const event = await createEvent(client, generator, [ActionType.DECLARE])
  const payload = generator.event.actions.archive(event.id)

  mockActionApi(ActionType.ARCHIVE, 202)

  const requested = await client.event.actions.archive.request(payload)
  const actionId = requestedActionId(requested, ActionType.ARCHIVE)

  return {
    actionId,
    accept: async () =>
      confirmer.event.actions.archive.accept({
        ...payload,
        transactionId: getUUID(),
        actionId
      }),
    reject: async () =>
      confirmer.event.actions.archive.reject({
        eventId: event.id,
        transactionId: getUUID(),
        actionId
      })
  }
}

async function requestPendingUnarchive(): Promise<PendingAction> {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)
  const event = await createEvent(client, generator, [
    ActionType.DECLARE,
    ActionType.ARCHIVE
  ])
  const payload = generator.event.actions.unarchive(event.id)

  mockActionApi(ActionType.UNARCHIVE, 202)

  const requested = await client.event.actions.unarchive.request(payload)
  const actionId = requestedActionId(requested, ActionType.UNARCHIVE)

  return {
    actionId,
    accept: async () =>
      confirmer.event.actions.unarchive.accept({
        ...payload,
        transactionId: getUUID(),
        actionId
      }),
    reject: async () =>
      confirmer.event.actions.unarchive.reject({
        eventId: event.id,
        transactionId: getUUID(),
        actionId
      })
  }
}

async function requestPendingRegister(): Promise<PendingAction> {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)
  const event = await createEvent(client, generator, [ActionType.DECLARE])
  const payload = generator.event.actions.register(event.id)

  mockActionApi(ActionType.REGISTER, 202)

  const requested = await client.event.actions.register.request(payload)
  const actionId = requestedActionId(requested, ActionType.REGISTER)

  return {
    actionId,
    accept: async () =>
      confirmer.event.actions.register.accept({
        ...payload,
        transactionId: getUUID(),
        actionId,
        registrationNumber: MOCK_REGISTRATION_NUMBER
      }),
    reject: async () =>
      confirmer.event.actions.register.reject({
        eventId: event.id,
        transactionId: getUUID(),
        actionId
      })
  }
}

async function requestPendingPrintCertificate(): Promise<PendingAction> {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)
  const event = await createEvent(client, generator, [
    ActionType.DECLARE,
    ActionType.REGISTER
  ])
  const payload = generator.event.actions.printCertificate(event.id)

  mockActionApi(ActionType.PRINT_CERTIFICATE, 202)

  const requested = await client.event.actions.printCertificate.request(payload)
  const actionId = requestedActionId(requested, ActionType.PRINT_CERTIFICATE)

  return {
    actionId,
    accept: async () =>
      confirmer.event.actions.printCertificate.accept({
        ...payload,
        transactionId: getUUID(),
        actionId
      }),
    reject: async () =>
      confirmer.event.actions.printCertificate.reject({
        eventId: event.id,
        transactionId: getUUID(),
        actionId
      })
  }
}

async function requestPendingRequestCorrection(): Promise<PendingAction> {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)
  const event = await createEvent(client, generator, [
    ActionType.DECLARE,
    ActionType.REGISTER
  ])
  const payload = generator.event.actions.correction.request(event.id)

  mockActionApi(ActionType.REQUEST_CORRECTION, 202)

  const requested =
    await client.event.actions.correction.request.request(payload)
  const actionId = requestedActionId(requested, ActionType.REQUEST_CORRECTION)

  return {
    actionId,
    accept: async () =>
      confirmer.event.actions.correction.request.accept({
        ...payload,
        transactionId: getUUID(),
        actionId
      }),
    reject: async () =>
      confirmer.event.actions.correction.request.reject({
        eventId: event.id,
        transactionId: getUUID(),
        actionId
      })
  }
}

async function requestPendingApproveCorrection(): Promise<PendingAction> {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)
  const event = await createEvent(client, generator, [
    ActionType.DECLARE,
    ActionType.REGISTER,
    ActionType.REQUEST_CORRECTION
  ])
  const payload = generator.event.actions.correction.approve(
    event.id,
    correctionRequestId(event)
  )

  mockActionApi(ActionType.APPROVE_CORRECTION, 202)

  const requested =
    await client.event.actions.correction.approve.request(payload)
  const actionId = requestedActionId(requested, ActionType.APPROVE_CORRECTION)

  return {
    actionId,
    accept: async () =>
      confirmer.event.actions.correction.approve.accept({
        ...payload,
        transactionId: getUUID(),
        actionId
      }),
    reject: async () =>
      confirmer.event.actions.correction.approve.reject({
        eventId: event.id,
        transactionId: getUUID(),
        actionId
      })
  }
}

async function requestPendingRejectCorrection(): Promise<PendingAction> {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)
  const event = await createEvent(client, generator, [
    ActionType.DECLARE,
    ActionType.REGISTER,
    ActionType.REQUEST_CORRECTION
  ])
  const payload = generator.event.actions.correction.reject(
    event.id,
    correctionRequestId(event),
    {}
  )

  mockActionApi(ActionType.REJECT_CORRECTION, 202)

  const requested =
    await client.event.actions.correction.reject.request(payload)
  const actionId = requestedActionId(requested, ActionType.REJECT_CORRECTION)

  return {
    actionId,
    accept: async () =>
      confirmer.event.actions.correction.reject.accept({
        ...payload,
        transactionId: getUUID(),
        actionId
      }),
    reject: async () =>
      confirmer.event.actions.correction.reject.reject({
        eventId: event.id,
        transactionId: getUUID(),
        actionId
      })
  }
}

async function requestPendingCustom(): Promise<PendingAction> {
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
    assignedTo: getOrThrow(
      event.actions.find((action) => action.type === ActionType.CREATE)
        ?.createdBy,
      'Could not find the create action'
    )
  })

  await client.event.actions.assignment.assign(assignment)
  await client.event.actions.declare.request(
    generator.event.actions.declare(event.id, {
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
    annotation: { notes: 'Confirmed membership' }
  }

  mockActionApi(ActionType.CUSTOM, 202)

  const requested = await client.event.actions.custom.request(payload)
  const actionId = requestedActionId(requested, ActionType.CUSTOM)

  return {
    actionId,
    accept: async () =>
      confirmer.event.actions.custom.accept({
        ...payload,
        transactionId: getUUID(),
        actionId
      }),
    reject: async () =>
      confirmer.event.actions.custom.reject({
        eventId: event.id,
        transactionId: getUUID(),
        actionId
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
} satisfies Record<ConfirmableActionType, () => Promise<PendingAction>>

describe.each(Object.entries(PENDING_ACTIONS))(
  '%s confirmation',
  (type, requestPendingAction) => {
    test('accepting the pending action records it as accepted', async () => {
      const pending = await requestPendingAction()

      const response = await pending.accept()

      expect(
        response.actions.find(
          (action) =>
            action.type === type && action.status === ActionStatus.Accepted
        )
      ).toMatchObject({ originalActionId: pending.actionId })
    })

    test('rejecting the pending action records it as rejected', async () => {
      const pending = await requestPendingAction()

      const response = await pending.reject()

      expect(
        response.actions.find(
          (action) =>
            action.type === type && action.status === ActionStatus.Rejected
        )
      ).toMatchObject({ originalActionId: pending.actionId })
    })

    test('rejecting an accepted action is refused', async () => {
      const pending = await requestPendingAction()

      await pending.accept()

      await expect(pending.reject()).rejects.toThrow(
        'Action has already been accepted.'
      )
    })

    test('accepting a rejected action is refused', async () => {
      const pending = await requestPendingAction()

      await pending.reject()

      await expect(pending.accept()).rejects.toMatchObject({
        code: 'BAD_REQUEST',
        message: 'Action has already been rejected.'
      })
    })

    test('accepting twice records a single accepted action', async () => {
      const pending = await requestPendingAction()

      await pending.accept()
      const response = await pending.accept()

      expect(
        response.actions.filter(
          (action) =>
            action.type === type && action.status === ActionStatus.Accepted
        )
      ).toHaveLength(1)
    })
  }
)
