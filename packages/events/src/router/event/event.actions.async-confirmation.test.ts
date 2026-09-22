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
/* eslint-disable max-lines */

import { HttpResponse, http } from 'msw'
import {
  ActionStatus,
  ActionType,
  AddressType,
  encodeScope,
  EventDocument,
  getCurrentEventState,
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
import {
  mswServer,
  tennisClubMembershipEventWithCustomAction
} from '@events/tests/msw'
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

function flagsOf(event: EventDocument) {
  return getCurrentEventState(event, tennisClubMembershipEventWithCustomAction)
    .flags
}

function assignedToOf(event: EventDocument) {
  return getCurrentEventState(event, tennisClubMembershipEventWithCustomAction)
    .assignedTo
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
  const payload = generator.event.actions.notify(event.id, {
    waitFor: false
  })

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
        actionId,
        waitFor: false
      })
  }
}

async function requestPendingDeclare(): Promise<PendingAction> {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)
  const event = await client.event.create(generator.event.create())
  const payload = generator.event.actions.declare(event.id, {
    waitFor: false
  })

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
        actionId,
        waitFor: false
      })
  }
}

async function requestPendingEdit(): Promise<PendingAction> {
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
        actionId,
        waitFor: false
      })
  }
}

async function requestPendingReject(): Promise<PendingAction> {
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
        actionId,
        waitFor: false
      })
  }
}

async function requestPendingArchive(): Promise<PendingAction> {
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
        actionId,
        waitFor: false
      })
  }
}

async function requestPendingUnarchive(): Promise<PendingAction> {
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
        actionId,
        waitFor: false
      })
  }
}

async function requestPendingRegister(): Promise<PendingAction> {
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
        actionId,
        waitFor: false
      })
  }
}

async function requestPendingPrintCertificate(): Promise<PendingAction> {
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
        actionId,
        waitFor: false
      })
  }
}

async function requestPendingRequestCorrection(): Promise<PendingAction> {
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
        actionId,
        waitFor: false
      })
  }
}

async function requestPendingApproveCorrection(): Promise<PendingAction> {
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
        actionId,
        waitFor: false
      })
  }
}

async function requestPendingRejectCorrection(): Promise<PendingAction> {
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
        actionId,
        waitFor: false
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

      expect(flagsOf(response)).not.toContain(`${type.toLowerCase()}:requested`)
    })

    test('rejecting the pending action keeps the fields it carried', async () => {
      const pending = await requestPendingAction()

      const response = await pending.reject()
      const requested = getOrThrow(
        response.actions.find((action) => action.id === pending.actionId),
        'Could not find the requested action'
      )

      expect(
        response.actions.find(
          (action) =>
            action.type === type && action.status === ActionStatus.Rejected
        )
      ).toMatchObject({
        originalActionId: pending.actionId,
        ...('requestId' in requested ? { requestId: requested.requestId } : {}),
        ...('content' in requested ? { content: requested.content } : {})
      })

      expect(flagsOf(response)).toContain(`${type.toLowerCase()}:rejected`)
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

    test('rejecting twice records a single rejected action', async () => {
      const pending = await requestPendingAction()

      await pending.reject()
      const response = await pending.reject()

      expect(
        response.actions.filter(
          (action) =>
            action.type === type && action.status === ActionStatus.Rejected
        )
      ).toHaveLength(1)
    })
  }
)

/**
 * Assignment is out of the matrix above because it's not action-specific.
 * `requireAssignment` guards every accept and reject, the
 * async request releases the record in `defaultRequestHandler`, and `addAction`
 * skips the unassign for system clients. DECLARE runs all of this.
 */
describe('assignment on an async confirmation', () => {
  async function requestPendingDeclareFor() {
    const { user, generator } = await setupTestCase()
    const client = createTestClient(user)
    const event = await client.event.create(generator.event.create())
    const payload = generator.event.actions.declare(event.id, {
      waitFor: false
    })

    mockActionApi(ActionType.DECLARE, 202)

    const requested = await client.event.actions.declare.request(payload)

    return {
      client,
      generator,
      event,
      requested,
      payload,
      eventId: event.id,
      actionId: requestedActionId(requested, ActionType.DECLARE)
    }
  }

  function unassignCountOf(event: EventDocument) {
    return event.actions.filter((action) => action.type === ActionType.UNASSIGN)
      .length
  }

  test('the request releases the record once the confirmation goes async', async () => {
    const { requested } = await requestPendingDeclareFor()

    expect(assignedToOf(requested)).toBeUndefined()
  })

  test('a confirmation is refused while a user holds the record', async () => {
    const { client, generator, event, eventId, payload, actionId } =
      await requestPendingDeclareFor()

    // Someone picks the record up again while the confirmation is pending.
    await client.event.actions.assignment.assign(
      generator.event.actions.assign(eventId, {
        waitFor: false,
        assignedTo: getOrThrow(
          event.actions.find((action) => action.type === ActionType.CREATE)
            ?.createdBy,
          'Could not find the create action'
        )
      })
    )

    await expect(
      confirmer.event.actions.declare.accept({
        ...payload,
        eventId,
        actionId,
        transactionId: getUUID()
      })
    ).rejects.toMatchObject({
      code: 'CONFLICT',
      message: 'User is assigned to this event'
    })

    await expect(
      confirmer.event.actions.declare.reject({
        eventId,
        actionId,
        transactionId: getUUID(),
        waitFor: false
      })
    ).rejects.toMatchObject({
      code: 'CONFLICT',
      message: 'User is assigned to this event'
    })
  })

  test('rejecting records an unassign of its own and leaves nobody assigned', async () => {
    const { eventId, actionId } = await requestPendingDeclareFor()

    const response = await confirmer.event.actions.declare.reject({
      eventId,
      actionId,
      transactionId: getUUID(),
      waitFor: false
    })

    expect(unassignCountOf(response)).toBe(2)
    expect(assignedToOf(response)).toBeUndefined()
  })

  test("keepAssignment skips that unassign, the record is nobody's either way", async () => {
    const { eventId, actionId } = await requestPendingDeclareFor()

    const response = await confirmer.event.actions.declare.reject({
      eventId,
      actionId,
      transactionId: getUUID(),
      keepAssignment: true,
      waitFor: false
    })

    expect(unassignCountOf(response)).toBe(1)
    expect(assignedToOf(response)).toBeUndefined()
  })

  test('accepting never unassigns, a system client holds no assignment', async () => {
    const { requested, eventId, payload, actionId } =
      await requestPendingDeclareFor()

    const response = await confirmer.event.actions.declare.accept({
      ...payload,
      eventId,
      actionId,
      transactionId: getUUID()
    })

    expect(unassignCountOf(response)).toBe(unassignCountOf(requested))
    expect(assignedToOf(response)).toBeUndefined()
  })
})
