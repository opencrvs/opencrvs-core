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
import { ActionType } from './ActionType'
import { ActionStatus } from './ActionDocument'
import { z } from 'zod'
import { TranslationConfig } from './TranslationConfig'
import { Conditional } from './Conditional'

export const InherentFlags = {
  PENDING_CERTIFICATION: 'pending-certification',
  INCOMPLETE: 'incomplete',
  REJECTED: 'rejected',
  CORRECTION_REQUESTED: 'correction-requested',
  POTENTIAL_DUPLICATE: 'potential-duplicate'
} as const

export type InherentFlags = (typeof InherentFlags)[keyof typeof InherentFlags]

export const ActionFlag = z
  .string()
  .regex(
    new RegExp(
      `^(${Object.values(ActionType).join('|').toLowerCase()}):(${Object.values(
        ActionStatus
      )
        .join('|')
        .toLowerCase()})$`
    ),
    'Flag must be in the format ActionType:ActionStatus (lowerCase)'
  )
export const Flag = ActionFlag.or(z.nativeEnum(InherentFlags))

export type ActionFlag = z.infer<typeof ActionFlag>
export type Flag = z.infer<typeof Flag>

/**
 * Configuration of a custom flag that can be associated with a certain event type.
 */
export const FlagConfig = z.object({
  id: z.string().describe('Unique identifier of the flag.'),
  requiresAction: z.boolean().describe('Whether the flag requires an action.'),
  label: TranslationConfig.describe('Human readable label of the flag.')
})

export type FlagConfig = z.infer<typeof FlagConfig>

export const ActionFlagConfig = z.object({
  id: z.string().describe('Id of the flag.'),
  operation: z
    .enum(['add', 'remove'])
    .describe('Operation to perform on the flag.'),
  conditional: Conditional.optional().describe(
    'When conditional is met, the operation is performed on the flag. If not provided, the operation is performed unconditionally.'
  )
})
