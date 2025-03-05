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
import { ActionType } from './ActionType'

export const Draft = z.object({
  id: z.string(),
  eventId: z.string(),
  transactionId: z.string(),
  createdAt: z.string().datetime(),
  action: ActionBase.extend({
    type: z.enum(Object.values(ActionType) as [ActionType, ...ActionType[]])
  }).omit({ id: true })
})

export const DraftInput = BaseActionInput.extend({
  /* Backend doesn't really use this field for now but it helps the client to keep things in order */
  createdAt: z.string().datetime(),
  type: z.enum(Object.values(ActionType) as [ActionType, ...ActionType[]])
})

export type Draft = z.infer<typeof Draft>
export type DraftInput = z.infer<typeof DraftInput>
