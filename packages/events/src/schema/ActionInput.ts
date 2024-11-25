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

const BaseActionInput = z.object({
  eventId: z.string(),
  transactionId: z.string(),
  fields: ActionInputFields
})

const ActionCreateInput = BaseActionInput.merge(
  z.object({
    type: z.literal(ActionType.CREATE)
  })
)

const ActionRegisterInput = BaseActionInput.merge(
  z.object({
    type: z.literal(ActionType.REGISTER),
    identifiers: z.object({
      trackingId: z.string(),
      registrationNumber: z.string()
    })
  })
)

export const ActionNotifyInput = BaseActionInput.merge(
  z.object({
    type: z.literal(ActionType.NOTIFY)
  })
)

export const ActionDeclareInput = BaseActionInput.merge(
  z.object({
    type: z.literal(ActionType.DECLARE)
  })
)

export const ActionInput = z.discriminatedUnion('type', [
  ActionCreateInput,
  ActionRegisterInput,
  ActionNotifyInput,
  ActionDeclareInput
])

export type ActionInput = z.infer<typeof ActionInput>
