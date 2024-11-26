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

export const EventInput = z.object({
  transactionId: z.string(),
  type: z.string(),
  fields: z.array(
    z.object({
      id: z.string(),
      value: z.union([
        z.string(),
        z.number(),
        z.array(
          // @TODO: Check if we could make this stricter by leveraging the types in @opencrvs/commons
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

export type EventInput = z.infer<typeof EventInput>
