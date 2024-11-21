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
import { GetValues, NonEmptyArray } from '../types'
import { Form } from './Form'
import { Label } from './utils'

/**
 * Actions recognized by the system
 */
export const ActionType = {
  CREATE: 'CREATE',
  ASSIGN: 'ASSIGN',
  UNASSIGN: 'UNASSIGN',
  REGISTER: 'REGISTER',
  VALIDATE: 'VALIDATE',
  CORRECT: 'CORRECT',
  DETECT_DUPLICATE: 'DETECT_DUPLICATE',
  NOTIFY: 'NOTIFY',
  DECLARE: 'DECLARE'
} as const

export const actionTypes = Object.values(ActionType)
export type ActionType = GetValues<typeof ActionType>

/**
 * Configuration of action performed on an event.
 * Includes roles that can perform the action, label and forms involved.
 */
export const ActionConfig = z.object({
  type: z.enum(actionTypes as NonEmptyArray<ActionType>),
  label: Label,
  forms: z.array(Form)
})

export const ActionInputBase = z.object({
  type: z.enum(actionTypes as NonEmptyArray<ActionType>),
  createdAt: z.date(),
  createdBy: z.string(),
  fields: z.array(
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
})

export const ActionInput = z.union([
  ActionInputBase.extend({
    type: z.enum([ActionType.CREATE])
  }),
  ActionInputBase.extend({
    type: z.enum([ActionType.REGISTER]),
    identifiers: z.object({
      trackingId: z.string(),
      registrationNumber: z.string()
    })
  })
])

export type ActionInput = z.infer<typeof ActionInput>

export const Action = ActionInput.and(
  z.object({
    createdAt: z.date(),
    createdBy: z.string()
  })
)

export type Action = z.infer<typeof Action>
