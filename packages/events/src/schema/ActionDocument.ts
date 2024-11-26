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
import { ActionInputFields } from './ActionInput'
import { ActionType } from '@opencrvs/commons'

export const ActionDocument = z.object({
  type: z.nativeEnum(ActionType),
  fields: ActionInputFields,
  createdBy: z.string().describe('The user who created the action'),
  createdAt: z.date()
})

export type ActionDocument = z.infer<typeof ActionDocument>
