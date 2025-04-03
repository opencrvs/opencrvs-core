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

import { z } from 'zod'
import { ActionBase } from './ActionDocument'
import { BaseActionInput } from './ActionInput'
import { ActionTypes } from './ActionType'

/*
 * A temporary storage for an action.
 * Stored with details of the event, creator and creation time.
 * Drafts are deleted when the action is committed.
 */
export const Draft = z.object({
  id: z.string(),
  eventId: z.string(),
  transactionId: z.string(),
  createdAt: z.string().datetime(),
  action: ActionBase.extend({
    type: ActionTypes
  }).omit({ id: true, status: true })
})

export const DraftInput = BaseActionInput.extend({
  type: ActionTypes
})

export type Draft = z.infer<typeof Draft>
export type DraftInput = z.infer<typeof DraftInput>
