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

import * as z from 'zod/v4'
import { ActionBase, ActionStatus } from './ActionDocument'
import { BaseActionInput } from './ActionInput'
import { ActionTypes } from './ActionType'
import { UUID } from '../uuid'

/*
 * A temporary storage for an action.
 * Stored with details of the event, creator and creation time.
 * Drafts are deleted when the action is committed.
 */
export const Draft = z
  .object({
    id: UUID,
    eventId: UUID,
    transactionId: z.string(),
    createdAt: z.string().datetime(),
    action: ActionBase.extend({
      type: ActionTypes.exclude([ActionTypes.enum.DELETE])
    }).omit({ id: true, createdAtLocation: true })
  })
  .describe(
    'A temporary storage for an action. Stored with details of the event, creator and creation time.'
  )

export const DraftInput = BaseActionInput.omit({ waitFor: true }).extend({
  /*
   * A draft can name a file that no action references. Such a file stays until
   * the record is deleted or the record's next action sweeps its prefix.
   * DECLARE is available only where one of those is still coming: a created
   * record, which can still be deleted, and a record part way through an edit,
   * which is about to be declared or registered.
   */
  type: z.literal(ActionTypes.enum.DECLARE),
  status: z.enum([
    ActionStatus.Requested,
    ActionStatus.Accepted,
    ActionStatus.Rejected
  ])
})

export type Draft = z.infer<typeof Draft>
export type DraftInput = z.infer<typeof DraftInput>
