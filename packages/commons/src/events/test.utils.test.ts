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
import { tennisClubMembershipEvent } from '../fixtures'
import { UUID } from '../uuid'
import { ActionStatus } from './ActionDocument'
import { ActionType } from './ActionType'
import { generateActionDocument, generateActionDocuments } from './test.utils'

describe('generateActionDocuments()', () => {
  it('returns a single Accepted action for a non-confirmable action', () => {
    const actions = generateActionDocuments({
      configuration: tennisClubMembershipEvent,
      action: ActionType.ASSIGN
    })

    expect(actions).toHaveLength(1)
    expect(actions[0].status).toBe(ActionStatus.Accepted)
  })

  it('returns a Requested and Accepted pair by default', () => {
    const [request, accept] = generateActionDocuments({
      configuration: tennisClubMembershipEvent,
      action: ActionType.DECLARE
    })

    expect(request.status).toBe(ActionStatus.Requested)
    expect(request).toHaveProperty(['declaration', 'applicant.name'])
    expect(accept).toMatchObject({
      status: ActionStatus.Accepted,
      originalActionId: request.id,
      declaration: {},
      annotation: {}
    })
  })

  it('returns a Requested and Rejected pair', () => {
    const [request, reject] = generateActionDocuments({
      configuration: tennisClubMembershipEvent,
      action: ActionType.REGISTER,
      confirmation: { status: ActionStatus.Rejected }
    })

    expect(request.status).toBe(ActionStatus.Requested)
    expect(reject).toMatchObject({
      status: ActionStatus.Rejected,
      originalActionId: request.id
    })
    expect(reject).not.toHaveProperty('declaration')
    expect(reject).not.toHaveProperty('annotation')
  })

  it('returns only the Requested action when the confirmation is pending', () => {
    const actions = generateActionDocuments({
      configuration: tennisClubMembershipEvent,
      action: ActionType.REGISTER,
      confirmation: { status: ActionStatus.Requested }
    })

    expect(actions).toHaveLength(1)
    expect(actions[0].status).toBe(ActionStatus.Requested)
  })

  it('confirms synchronously within the same transaction by default', () => {
    const [request, accept] = generateActionDocuments({
      configuration: tennisClubMembershipEvent,
      action: ActionType.REGISTER
    })

    expect(accept.transactionId).toBe(request.transactionId)
  })

  it('applies confirmation defaults to the confirming action only', () => {
    const [request, accept] = generateActionDocuments({
      configuration: tennisClubMembershipEvent,
      action: ActionType.REGISTER,
      defaults: { createdBy: 'registrar' },
      confirmation: { defaults: { createdBy: 'system' } }
    })

    expect(request.createdBy).toBe('registrar')
    expect(accept.createdBy).toBe('system')
  })

  it('keeps the given id on the confirming action', () => {
    const id = 'c8a4c4cf-0b7e-4b5c-a0a5-0f5c1b5b2a10' as UUID
    const [request, accept] = generateActionDocuments({
      configuration: tennisClubMembershipEvent,
      action: ActionType.REQUEST_CORRECTION,
      defaults: { id }
    })

    expect(request.id).not.toBe(id)
    expect(accept.id).toBe(id)
  })
})

describe('generateActionDocument()', () => {
  it('keeps the given requestId of a correction approval', () => {
    const requestId = 'c8a4c4cf-0b7e-4b5c-a0a5-0f5c1b5b2a10' as UUID
    const approval = generateActionDocument({
      configuration: tennisClubMembershipEvent,
      action: ActionType.APPROVE_CORRECTION,
      defaults: { requestId }
    })

    expect(approval).toMatchObject({ requestId })
  })
})
