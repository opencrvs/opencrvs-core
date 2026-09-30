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
import {
  ActionType,
  EventStatus,
  generateEventDocument,
  InherentFlags,
  tennisClubMembershipEvent
} from '@opencrvs/commons/client'
import { resolveEventValidatorContext } from './useValidatorContext'

const configs = [tennisClubMembershipEvent]

function documentWithActions(actions: ActionType[]) {
  return generateEventDocument({
    configuration: tennisClubMembershipEvent,
    actions: actions.map((type) => ({ type }))
  })
}

describe('resolveEventValidatorContext', () => {
  it('returns undefined when there is no event', () => {
    expect(resolveEventValidatorContext(configs)).toBeUndefined()
  })

  it('returns undefined when no configuration matches the event type', () => {
    const document = documentWithActions([ActionType.CREATE])

    expect(resolveEventValidatorContext([], document)).toBeUndefined()
  })

  it('pairs the document with its aggregated state', () => {
    const document = documentWithActions([
      ActionType.CREATE,
      ActionType.DECLARE
    ])

    const resolved = resolveEventValidatorContext(configs, document)

    expect(resolved?.document).toBe(document)
    expect(resolved?.state.id).toBe(document.id)
    expect(resolved?.state.status).toBe(EventStatus.enum.DECLARED)
  })

  /*
   * The whole point of carrying the state: `flag(...)` conditionals read
   * `state.flags`, so an unresolved state silently evaluates as unflagged.
   */
  it('resolves flags from the action history', () => {
    const notified = documentWithActions([ActionType.CREATE, ActionType.NOTIFY])
    const declared = documentWithActions([
      ActionType.CREATE,
      ActionType.NOTIFY,
      ActionType.DECLARE
    ])

    expect(
      resolveEventValidatorContext(configs, notified)?.state.flags
    ).toEqual(expect.arrayContaining([InherentFlags.INCOMPLETE]))

    // DECLARE clears INCOMPLETE, so the same flag must not linger.
    expect(
      resolveEventValidatorContext(configs, declared)?.state.flags
    ).not.toContain(InherentFlags.INCOMPLETE)
  })
})
