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
import * as z from 'zod/v4'
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

export type ActionFlag = z.infer<typeof ActionFlag>

/** Custom flag identifier defined by the country config. These may not match any InherentFlags or ActionFlag patterns. */
export const CustomFlag = z
  .string()
  // Don't allow any inherent flags to be used here
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  .refine((val) => !Object.values(InherentFlags).includes(val as any), {
    message: `Custom flag cannot be one of the inherent flags: ${Object.values(
      InherentFlags
    ).join(', ')}`
  })
  // Don't allow any ActionFlag patterns to be used here
  .refine((val) => !ActionFlag.safeParse(val).success, {
    message:
      'Custom flag cannot match the ActionFlag pattern (ActionType:ActionStatus).'
  })
  .describe('Custom flag identifier defined by the country config.')
export type CustomFlag = z.infer<typeof CustomFlag>

export const Flag = ActionFlag.or(z.enum(InherentFlags)).or(CustomFlag)
export type Flag = z.infer<typeof Flag>

/**
 * Configuration of a custom flag that can be associated with a certain event type.
 */
export const FlagConfig = z.object({
  id: CustomFlag,
  requiresAction: z
    .boolean()
    .describe(
      'Indicates if this flag expects an action to be performed to be cleared.'
    ),
  label: TranslationConfig.describe('Human readable label of the flag.')
})

export type FlagConfig = z.infer<typeof FlagConfig>

/**
 * Configuration for a flag action, which is executed when the action is performed.
 */
export const ActionFlagConfig = z.object({
  id: CustomFlag,
  operation: z
    .enum(['add', 'remove'])
    .describe('Operation to perform on the flag.'),
  conditional: Conditional.optional().describe(
    'When conditional is met, the operation is performed on the flag. If not provided, the operation is performed unconditionally.'
  )
})
