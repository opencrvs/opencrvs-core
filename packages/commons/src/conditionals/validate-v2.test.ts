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
import { ActionType } from '../events/ActionType'
import { EventStatus } from '../events/EventStatus'
import { getCurrentEventState } from '../events/state'
import { generateEventDocument } from '../events/test.utils'
import { tennisClubMembershipEvent } from '../fixtures'
import { resolveEventState } from './validate-v2'

describe('resolveEventState', () => {
  const declaredDocument = generateEventDocument({
    configuration: tennisClubMembershipEvent,
    actions: [ActionType.CREATE, ActionType.DECLARE].map((type) => ({ type }))
  })

  test('returns the same object for the same document and configuration', () => {
    const context = {
      eventDocument: declaredDocument,
      eventConfig: tennisClubMembershipEvent
    }

    const first = resolveEventState(context)
    const second = resolveEventState({ ...context })

    expect(second).toBe(first)
  })

  test('returns the state that getCurrentEventState calculates', () => {
    expect(
      resolveEventState({
        eventDocument: declaredDocument,
        eventConfig: tennisClubMembershipEvent
      })
    ).toEqual(getCurrentEventState(declaredDocument, tennisClubMembershipEvent))
  })

  test('returns a new object for a different document object with the same content', () => {
    const first = resolveEventState({
      eventDocument: declaredDocument,
      eventConfig: tennisClubMembershipEvent
    })
    const second = resolveEventState({
      eventDocument: { ...declaredDocument },
      eventConfig: tennisClubMembershipEvent
    })

    expect(second).not.toBe(first)
    expect(second).toEqual(first)
  })

  test('returns a new object for a different configuration object', () => {
    const first = resolveEventState({
      eventDocument: declaredDocument,
      eventConfig: tennisClubMembershipEvent
    })
    const second = resolveEventState({
      eventDocument: declaredDocument,
      eventConfig: { ...tennisClubMembershipEvent }
    })

    expect(second).not.toBe(first)
    expect(second).toEqual(first)
  })

  test('returns the new state when a new document object has more actions', () => {
    const createdDocument = generateEventDocument({
      configuration: tennisClubMembershipEvent,
      actions: [{ type: ActionType.CREATE }]
    })

    expect(
      resolveEventState({
        eventDocument: createdDocument,
        eventConfig: tennisClubMembershipEvent
      }).status
    ).toBe(EventStatus.enum.CREATED)

    expect(
      resolveEventState({
        eventDocument: declaredDocument,
        eventConfig: tennisClubMembershipEvent
      }).status
    ).toBe(EventStatus.enum.DECLARED)
  })
})
