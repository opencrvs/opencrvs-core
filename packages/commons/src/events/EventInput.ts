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
import { v4 as uuidv4 } from 'uuid'

export const EventInput = z
  .object({
    transactionId: z.string(),
    type: z.string()
  })
  .openapi({ default: { transactionId: uuidv4(), type: 'v2.birth' } })

export type EventInput = z.infer<typeof EventInput>
