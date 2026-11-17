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
import { ActionDocument, ActionStatus, ActionType } from '@opencrvs/commons'
import { createTestClient, setupTestCase } from '@events/tests/utils'
import { mswServer } from '@events/tests/msw'
import { env } from '@events/environment'

function mockDeclareApi(status: number, body: Record<string, unknown> = {}) {
  return mswServer.use(
    http.post(
      `${env.COUNTRY_CONFIG_URL}/trigger/events/tennis-club-membership/actions/DECLARE`,
      () =>
        HttpResponse.json(
          body,
          // @ts-expect-error - msw types complain about numeric status
          { status }
        )
    )
  )
}

function findDeclareAction(
  actions: { type: ActionType; status: ActionStatus }[],
  status: ActionStatus
) {
  return actions.find(
    (a): a is Extract<ActionDocument, { type: 'DECLARE' }> =>
      a.type === ActionType.DECLARE && a.status === status
  )
}

describe('Synchronous confirmation - keepAssignment flags', () => {
  test('keepAssignmentIfAccepted=true: assignment kept after sync accept', async () => {
    const { user, generator } = await setupTestCase()
    const client = createTestClient(user)
    const event = await client.event.create(generator.event.create())

    mockDeclareApi(200)

    const response = await client.event.actions.declare.request({
      ...generator.event.actions.declare(event.id),
      keepAssignmentIfAccepted: true
    })

    expect(response.actions.at(-1)?.type).not.toEqual(ActionType.UNASSIGN)
  })

  test('keepAssignmentIfAccepted=false: assignment dropped after sync accept', async () => {
    const { user, generator } = await setupTestCase()
    const client = createTestClient(user)
    const event = await client.event.create(generator.event.create())

    mockDeclareApi(200)

    const response = await client.event.actions.declare.request({
      ...generator.event.actions.declare(event.id),
      keepAssignmentIfAccepted: false
    })

    expect(response.actions.at(-1)?.type).toEqual(ActionType.UNASSIGN)
  })

  test('keepAssignmentIfRejected=true: assignment kept after sync reject', async () => {
    const { user, generator } = await setupTestCase()
    const client = createTestClient(user)
    const event = await client.event.create(generator.event.create())

    mockDeclareApi(400)

    const response = await client.event.actions.declare.request({
      ...generator.event.actions.declare(event.id),
      keepAssignmentIfRejected: true
    })

    expect(response.actions.at(-1)?.type).not.toEqual(ActionType.UNASSIGN)
  })

  test('keepAssignmentIfRejected=false: assignment dropped after sync reject', async () => {
    const { user, generator } = await setupTestCase()
    const client = createTestClient(user)
    const event = await client.event.create(generator.event.create())

    mockDeclareApi(400)

    const response = await client.event.actions.declare.request({
      ...generator.event.actions.declare(event.id),
      keepAssignmentIfRejected: false
    })

    expect(response.actions.at(-1)?.type).toEqual(ActionType.UNASSIGN)
  })

  test('keepAssignment=true fallback: assignment kept when keepAssignmentIfAccepted not set', async () => {
    const { user, generator } = await setupTestCase()
    const client = createTestClient(user)
    const event = await client.event.create(generator.event.create())

    mockDeclareApi(200)

    const response = await client.event.actions.declare.request(
      generator.event.actions.declare(event.id, { keepAssignment: true })
    )

    expect(response.actions.at(-1)?.type).not.toEqual(ActionType.UNASSIGN)
  })

  test('no flags: assignment dropped by default after sync accept', async () => {
    const { user, generator } = await setupTestCase()
    const client = createTestClient(user)
    const event = await client.event.create(generator.event.create())

    mockDeclareApi(200)

    const response = await client.event.actions.declare.request(
      generator.event.actions.declare(event.id)
    )

    expect(response.actions.at(-1)?.type).toEqual(ActionType.UNASSIGN)
  })

  test('keepAssignmentIfAccepted overrides keepAssignment on sync accept', async () => {
    const { user, generator } = await setupTestCase()
    const client = createTestClient(user)
    const event = await client.event.create(generator.event.create())

    mockDeclareApi(200)

    const response = await client.event.actions.declare.request({
      ...generator.event.actions.declare(event.id, { keepAssignment: true }),
      keepAssignmentIfAccepted: false
    })

    expect(response.actions.at(-1)?.type).toEqual(ActionType.UNASSIGN)
  })
})

describe('Synchronous confirmation - CC response payload', () => {
  test('CC sends declaration in sync accept: saved on accepted action', async () => {
    const { user, generator } = await setupTestCase()
    const client = createTestClient(user)
    const event = await client.event.create(generator.event.create())

    const ccDeclaration = {
      'applicant.name': { firstname: 'CC', surname: 'Sent' }
    }
    mockDeclareApi(200, { declaration: ccDeclaration })

    const response = await client.event.actions.declare.request(
      generator.event.actions.declare(event.id)
    )

    const acceptedAction = findDeclareAction(
      response.actions,
      ActionStatus.Accepted
    )

    expect(acceptedAction?.declaration).toEqual(ccDeclaration)
  })

  test('CC sends annotation in sync accept: saved on accepted action', async () => {
    const { user, generator } = await setupTestCase()
    const client = createTestClient(user)
    const event = await client.event.create(generator.event.create())

    const ccAnnotation = { 'review.comment': 'Approved by CC' }
    mockDeclareApi(200, { annotation: ccAnnotation })

    const response = await client.event.actions.declare.request(
      generator.event.actions.declare(event.id)
    )

    const acceptedAction = findDeclareAction(
      response.actions,
      ActionStatus.Accepted
    )

    expect(acceptedAction?.annotation).toEqual(ccAnnotation)
  })

  test('CC sends unknown field in sync accept: returns 500', async () => {
    const { user, generator } = await setupTestCase()
    const client = createTestClient(user)
    const event = await client.event.create(generator.event.create())

    mockDeclareApi(200, { unknownField: 'not-in-schema' })

    const response = await client.event.actions.declare.request(
      generator.event.actions.declare(event.id)
    )

    const acceptedAction = findDeclareAction(
      response.actions,
      ActionStatus.Accepted
    )

    expect(acceptedAction?.declaration).toEqual({})
  })

  test('CC sends body on sync reject: body ignored, action saved with empty declaration', async () => {
    const { user, generator } = await setupTestCase()
    const client = createTestClient(user)
    const event = await client.event.create(generator.event.create())

    mockDeclareApi(400, { someField: 'should-be-ignored' })

    const response = await client.event.actions.declare.request({
      ...generator.event.actions.declare(event.id),
      keepAssignmentIfRejected: true
    })

    const rejectedAction = findDeclareAction(
      response.actions,
      ActionStatus.Rejected
    )

    expect(rejectedAction?.status).toEqual(ActionStatus.Rejected)
    expect(rejectedAction?.declaration).toEqual({})
  })
})
