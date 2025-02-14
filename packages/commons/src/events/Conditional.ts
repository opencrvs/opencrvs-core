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

import { JSONSchema } from '../conditionals/conditionals'
import { z } from 'zod'

export function Conditional() {
  /*
   * Using JSONSchema directly here would cause a
   * "The inferred type of this node exceeds the maximum length the compiler will serialize."
   * error, so I've copied the type here
   */
  return z.custom<JSONSchema>((val) => typeof val === 'object' && val !== null)
}

/**
 * By default, when conditionals are undefined, action is visible and enabled to everyone.
 */
export const ConditionalType = {
  /** When 'SHOW' conditional is defined, the action is shown to the user only if the condition is met */
  SHOW: 'SHOW',
  /** If 'ENABLE' conditional is defined, the action is enabled only if the condition is met */
  ENABLE: 'ENABLE'
} as const

export const ShowConditional = z.object({
  type: z.literal(ConditionalType.SHOW),
  conditional: Conditional()
})

export const EnableConditional = z.object({
  type: z.literal(ConditionalType.ENABLE),
  conditional: Conditional()
})
