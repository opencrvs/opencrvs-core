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
  ActionDocument,
  ActionStatus,
  ActionType,
  AddressType,
  encodeScope,
  EventDocument,
  generateRegistrationNumber,
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
  eventId: UUID
  accept: (overridePayload?: Record<string, unknown>) => Promise<EventDocument>
  reject: (overridePayload?: Record<string, unknown>) => Promise<EventDocument>
}

const MOCK_REGISTRATION_NUMBER = '1MY2TEST3NRO'
const CUSTOM_ACTION_TYPE = 'CONFIRM_SENIOR_MEMBERSHIP'
const SENIOR_DATE_OF_BIRTH = '1949-05-10'

/**
 * An override replaces only the fields it names. The rest of the original
 * payload is kept so that fields identifying the action — `requestId`
 * (correction approve/reject), `content` (reject) and `customActionType`
 * (CUSTOM) — aren't dropped, which would fail the request on a missing field
 * instead of on whatever the test is asserting.
 */
function withOverride<T extends object>(
  payload: T,
  overridePayload?: Record<string, unknown>
): T {
  return (overridePayload ? { ...payload, ...overridePayload } : payload) as T
}

const confirmer = createSystemTestClient(TEST_SYSTEM_ID, [
  ...CONFIRMATION_SCOPES,
  encodeScope({ type: 'record.read' })
])

function mockActionApi(
  action: ActionType,
  status: number,
  body: Record<string, unknown> = {}
) {
  return mswServer.use(
    http.post(
      `${env.COUNTRY_CONFIG_URL}/trigger/events/tennis-club-membership/actions/${action}`,
      () => HttpResponse.json(body, { status })
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
        ...withOverride(payload, overridePayload),
        eventId: event.id,
        transactionId: getUUID(),
        actionId
      }),
    reject: async (overridePayload?: Record<string, unknown>) =>
      confirmer.event.actions.notify.reject({
        ...withOverride(payload, overridePayload),
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
        ...withOverride(payload, overridePayload),
        eventId: event.id,
        transactionId: getUUID(),
        actionId
      }),
    reject: async (overridePayload?: Record<string, unknown>) =>
      confirmer.event.actions.declare.reject({
        ...withOverride(payload, overridePayload),
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
        ...withOverride(payload, overridePayload),
        eventId: event.id,
        transactionId: getUUID(),
        actionId
      }),
    reject: async (overridePayload?: Record<string, unknown>) =>
      confirmer.event.actions.edit.reject({
        ...withOverride(payload, overridePayload),
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
        ...withOverride(payload, overridePayload),
        eventId: event.id,
        transactionId: getUUID(),
        actionId
      }),
    reject: async (overridePayload?: Record<string, unknown>) =>
      confirmer.event.actions.reject.reject({
        ...withOverride(payload, overridePayload),
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
        ...withOverride(payload, overridePayload),
        eventId: event.id,
        transactionId: getUUID(),
        actionId
      }),
    reject: async (overridePayload?: Record<string, unknown>) =>
      confirmer.event.actions.archive.reject({
        ...withOverride(payload, overridePayload),
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
        ...withOverride(payload, overridePayload),
        eventId: event.id,
        transactionId: getUUID(),
        actionId
      }),
    reject: async (overridePayload?: Record<string, unknown>) =>
      confirmer.event.actions.unarchive.reject({
        ...withOverride(payload, overridePayload),
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
        ...withOverride(payload, overridePayload),
        eventId: event.id,
        transactionId: getUUID(),
        actionId,
        registrationNumber: MOCK_REGISTRATION_NUMBER
      }),
    reject: async (overridePayload?: Record<string, unknown>) =>
      confirmer.event.actions.register.reject({
        ...withOverride(payload, overridePayload),
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
        ...withOverride(payload, overridePayload),
        eventId: event.id,
        transactionId: getUUID(),
        actionId
      }),
    reject: async (overridePayload?: Record<string, unknown>) =>
      confirmer.event.actions.printCertificate.reject({
        ...withOverride(payload, overridePayload),
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
        ...withOverride(payload, overridePayload),
        eventId: event.id,
        transactionId: getUUID(),
        actionId
      }),
    reject: async (overridePayload?: Record<string, unknown>) =>
      confirmer.event.actions.correction.request.reject({
        ...withOverride(payload, overridePayload),
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
        ...withOverride(payload, overridePayload),
        eventId: event.id,
        transactionId: getUUID(),
        actionId
      }),
    reject: async (overridePayload?: Record<string, unknown>) =>
      confirmer.event.actions.correction.approve.reject({
        ...withOverride(payload, overridePayload),
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
        ...withOverride(payload, overridePayload),
        eventId: event.id,
        transactionId: getUUID(),
        actionId
      }),
    reject: async (overridePayload?: Record<string, unknown>) =>
      confirmer.event.actions.correction.reject.reject({
        ...withOverride(payload, overridePayload),
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
        ...withOverride(payload, overridePayload),
        eventId: event.id,
        transactionId: getUUID(),
        actionId
      }),
    reject: async (overridePayload?: Record<string, unknown>) =>
      confirmer.event.actions.custom.reject({
        ...withOverride(payload, overridePayload),
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
  '%s confirmation',
  (type, requestPendingAction) => {
    test('accepting the pending action records it as accepted', async () => {
      const pending = await requestPendingAction(202, {})

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
      const pending = await requestPendingAction(202, {})

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
      const pending = await requestPendingAction(202, {})

      await pending.accept()

      await expect(pending.reject()).rejects.toThrow(
        'Action has already been accepted.'
      )
    })

    test('accepting a rejected action is refused', async () => {
      const pending = await requestPendingAction(202, {})

      await pending.reject()

      await expect(pending.accept()).rejects.toMatchObject({
        code: 'BAD_REQUEST',
        message: 'Action has already been rejected.'
      })
    })

    test('accepting twice records a single accepted action', async () => {
      const pending = await requestPendingAction(202, {})

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
      const pending = await requestPendingAction(202, {})

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

const BAD_DECLARATION = {
  cat: 'kissa',
  'applicant.dob': 100
}

const BAD_ANNOTATION = {
  dog: 'koira'
}

describe.each(Object.entries(PENDING_ACTIONS))(
  '%s reject',
  (type, requestPendingAction) => {
    test('synchronous declaration and annotation in response are ignored', async () => {
      const pending = await requestPendingAction(400, {
        declaration: BAD_DECLARATION,
        annotation: BAD_ANNOTATION
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
        declaration: BAD_DECLARATION,
        annotation: BAD_ANNOTATION,
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

      if (type === ActionType.CUSTOM) {
        expect(syncAction.declaration).toBeUndefined()
      } else {
        expect(syncAction.declaration).toEqual({})
      }
      expect(syncAction.annotation).toBeUndefined()
    })
  }
)

describe.each(Object.entries(PENDING_ACTIONS))(
  '%s accept',
  (type, requestPendingAction) => {
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

    const expectedError = nonAnnotableActions.some((na) => na === type)
      ? nonAnnotableActionError
      : annotableActionError

    test('error is thrown when synchronous response annotation or declaration includes bad data', async () => {
      await expect(
        requestPendingAction(200, {
          registrationNumber:
            type === ActionType.REGISTER
              ? generateRegistrationNumber(() => 0.1)
              : undefined,
          declaration: BAD_DECLARATION,
          annotation: BAD_ANNOTATION
        })
      ).rejects.toThrow(expectedError)
    })

    test('error is thrown when asynchronous request declaration or annotation includes bad data', async () => {
      const pending = await requestPendingAction(202, {})

      await expect(
        pending.accept({
          declaration: BAD_DECLARATION,
          annotation: BAD_ANNOTATION
        })
      ).rejects.toThrow(expectedError)
    })
  }
)
