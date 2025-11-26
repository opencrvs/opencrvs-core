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
import { ActionType, Draft, UUID } from '@opencrvs/commons/client'

export function getEventDrafts(
  eventId: UUID,
  localDraft: Draft,
  drafts: Draft[]
) {
  return drafts
    .filter((d) => d.eventId === eventId)
    .concat({
      ...localDraft,
      /*
       * Force the local draft always to be the latest
       * This is to prevent a situation where the local draft gets created,
       * then a CREATE action request finishes in the background and is stored with a later
       * timestamp
       */
      createdAt: new Date().toISOString(),
      /*
       * If params.eventId changes (from tmp id to concrete id) then change the local draft id
       */
      eventId,
      action: {
        ...localDraft.action,
        createdAt: new Date().toISOString()
      }
    })
}

export type AvailableActionTypes = Extract<
  ActionType,
  | 'NOTIFY'
  | 'DECLARE'
  | 'VALIDATE'
  | 'REGISTER'
  | 'REQUEST_CORRECTION'
  | 'APPROVE_CORRECTION'
  | 'REJECT_CORRECTION'
>
