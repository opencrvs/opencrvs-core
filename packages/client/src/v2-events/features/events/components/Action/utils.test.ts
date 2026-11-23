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
  ActionStatus,
  ActionType,
  ActionUpdate,
  ConfirmableActions,
  EventDocument,
  generateEventDocument,
  tennisClubMembershipEvent
} from '@opencrvs/commons/client'
import { getAnnotationForActionType } from './utils'

/** `review.comment` is in the DECLARE review, `notifier.comment` is notify-only. */
const notifyAnnotation = {
  'review.comment': 'Comment given during notify',
  'notifier.comment': 'Notify-only comment'
}

function generateEvent(
  actions: {
    type: (typeof ConfirmableActions)[number]
    annotation: ActionUpdate
  }[]
): EventDocument {
  const event = generateEventDocument({
    configuration: tennisClubMembershipEvent,
    actions: [{ type: ActionType.CREATE }, ...actions]
  })

  // The annotation is carried by the Requested action, its Accepted counterpart has none.
  const requestedActions = event.actions.filter(
    ({ status }) => status === ActionStatus.Requested
  )

  return {
    ...event,
    actions: event.actions.map((action) => {
      const index = requestedActions.indexOf(action)
      if (index === -1) {
        // CREATE and Accepted copies are left as is
        return action
      }
      return { ...action, annotation: actions[index].annotation }
    })
  }
}

describe('getAnnotationForActionType()', () => {
  it('merges only the NOTIFY annotation of fields that the DECLARE review also has', () => {
    const event = generateEvent([
      { type: ActionType.NOTIFY, annotation: notifyAnnotation }
    ])

    expect(
      getAnnotationForActionType({
        event,
        eventConfiguration: tennisClubMembershipEvent,
        actionType: ActionType.DECLARE
      })
    ).toEqual({ 'review.comment': 'Comment given during notify' })
  })

  it('prefers the DECLARE annotation over the NOTIFY annotation', () => {
    const event = generateEvent([
      { type: ActionType.NOTIFY, annotation: notifyAnnotation },
      {
        type: ActionType.DECLARE,
        annotation: { 'review.comment': 'Comment given during declare' }
      }
    ])

    expect(
      getAnnotationForActionType({
        event,
        eventConfiguration: tennisClubMembershipEvent,
        actionType: ActionType.DECLARE
      })
    ).toEqual({ 'review.comment': 'Comment given during declare' })
  })
})
