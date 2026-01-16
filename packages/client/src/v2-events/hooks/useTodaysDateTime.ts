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
import { TimeValue } from '@opencrvs/commons/client'
import { padZero } from '../utils'

export function useTodaysDateTime(): {
  $$date: string
  $$time: z.infer<typeof TimeValue>
} {
  const today = new Date()

  const year = today.getFullYear()
  const month = padZero(today.getMonth() + 1)
  const day = padZero(today.getDate())
  const hours = padZero(today.getHours())
  const minutes = padZero(today.getMinutes())

  return {
    $$date: `${year}-${month}-${day}`,
    $$time: `${hours}:${minutes}`
  }
}
