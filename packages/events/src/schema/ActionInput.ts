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

import { ActionType } from '@opencrvs/commons'
import { z } from 'zod'

export const ActionInputFields = z.array(
  z.object({
    id: z.string(),
    value: z.union([
      z.string(),
      z.number(),
      z.array(
        z.object({
          optionValues: z.array(z.string()),
          type: z.string(),
          data: z.string(),
          fileSize: z.number()
        })
      )
    ])
  })
)

const ActionCreateInput = z.object({
  type: z.literal(ActionType.CREATE),
  fields: ActionInputFields
})

const ActionRegisterInput = z.object({
  type: z.literal(ActionType.REGISTER),
  fields: ActionInputFields,
  identifiers: z.object({
    trackingId: z.string(),
    registrationNumber: z.string()
  })
})

export const ActionInput = z.discriminatedUnion('type', [
  ActionCreateInput,
  ActionRegisterInput
])

export type ActionInput = z.infer<typeof ActionInput>
