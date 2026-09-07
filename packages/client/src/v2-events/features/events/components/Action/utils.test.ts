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
  EventDocument,
  generateEventDocument,
  tennisClubMembershipEvent
} from '@opencrvs/commons/client'
import { getAnnotationForActionType } from './utils'

describe('getAnnotationForActionType', () => {
  const notifySignature = {
    path: 'notify-signature.png',
    originalFilename: 'notify.png',
    type: 'image/png'
  }
  const declareSignature = {
    path: 'declare-signature.png',
    originalFilename: 'declare.png',
    type: 'image/png'
  }

  /** NOTIFY carries one signature, the later DECLARE (an edit) carries another. */
  function notifiedThenEditedEvent(): EventDocument {
    const event = generateEventDocument({
      configuration: tennisClubMembershipEvent,
      actions: [
        { type: ActionType.CREATE },
        { type: ActionType.NOTIFY },
        { type: ActionType.DECLARE }
      ]
    })

    return {
      ...event,
      actions: event.actions.map((action) => {
        if (action.type === ActionType.NOTIFY) {
          return {
            ...action,
            annotation: { 'review.signature': notifySignature }
          }
        }
        if (action.type === ActionType.DECLARE) {
          return {
            ...action,
            annotation: { 'review.signature': declareSignature }
          }
        }
        return action
      })
    } as EventDocument
  }

  it('prefers the edited DECLARE signature over the original NOTIFY one (#13693)', () => {
    // A record notified with one signature and later edited (DECLARE) with a
    // new one must surface the newer, edited signature — not the original.
    const annotation = getAnnotationForActionType({
      event: notifiedThenEditedEvent(),
      actionType: ActionType.DECLARE
    })

    expect(annotation['review.signature']).toEqual(declareSignature)
  })

  it('falls back to the NOTIFY signature when the DECLARE did not touch it', () => {
    const event = generateEventDocument({
      configuration: tennisClubMembershipEvent,
      actions: [
        { type: ActionType.CREATE },
        { type: ActionType.NOTIFY },
        { type: ActionType.DECLARE }
      ]
    })
    const withNotifyOnlySignature = {
      ...event,
      actions: event.actions.map((action) => {
        if (action.type === ActionType.NOTIFY) {
          return {
            ...action,
            annotation: { 'review.signature': notifySignature }
          }
        }
        // The edit left the signature untouched, so its DECLARE has no signature.
        if (action.type === ActionType.DECLARE) {
          return { ...action, annotation: {} }
        }
        return action
      })
    } as EventDocument

    const annotation = getAnnotationForActionType({
      event: withNotifyOnlySignature,
      actionType: ActionType.DECLARE
    })

    expect(annotation['review.signature']).toEqual(notifySignature)
  })
})
