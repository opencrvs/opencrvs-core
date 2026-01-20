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
 * Serialized representation of "now" date-time value.
 * Used to indicate that the current date-time should be used.
 * This is useful in scenarios where the exact date-time is not known at the time of serialization,
 * and should be determined at the time of deserialization or processing.
 */
export const SerializedNowDateTime = z.object({
  $$now: z.literal(true)
})

export type SerializedNowDateTime = z.infer<typeof SerializedNowDateTime>

export function todayDateTimeValueSerializer(): SerializedNowDateTime {
  return { $$now: true }
}
