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

export const ConditionalTypes = {
  SHOW: 'SHOW',
  HIDE: 'HIDE',
  ENABLE: 'ENABLE'
} as const

export const ShowConditional = z.object({
  type: z.literal(ConditionalTypes.SHOW),
  conditional: Conditional()
})

export const HideConditional = z.object({
  type: z.literal(ConditionalTypes.HIDE),
  conditional: Conditional()
})

export const EnableConditional = z.object({
  type: z.literal(ConditionalTypes.ENABLE),
  conditional: Conditional()
})
