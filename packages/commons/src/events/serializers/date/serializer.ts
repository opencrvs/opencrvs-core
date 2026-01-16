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

/**
 * Represents a date-time value indicating the current date and time.
 * Note: Values of $$date and $$time are not used for any computation; their presence indicates 'now'
 */
export const SerializedNowDateTime = z
  .object({
    $$date: z.literal('now').optional(),
    $$time: z.literal('now').optional()
  })
  .or(z.literal('$$date'))
  .or(z.literal('$$time'))

export type SerializedNowDateTime = z.infer<typeof SerializedNowDateTime>

export function todayDateTimeValueSerializer(): SerializedNowDateTime {
  return {
    $$date: 'now',
    $$time: 'now'
  } as const
}
