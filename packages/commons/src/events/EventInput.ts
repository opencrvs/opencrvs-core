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
import * as z from 'zod/v4'
import { v4 as uuidv4 } from 'uuid'
import { UUID } from '../uuid'

export const EventInput = z
  .object({
    transactionId: z.string(),
    type: z.string(),
    createdAtLocation: UUID.nullish().describe(
      'Location where the event occurred. Required for system users.'
    ),
    configVersionId: z
      .string()
      .optional()
      .describe(
        'Id of the event configuration version the client created the record under, e.g. while offline. Must be configured and not take effect in the future. Defaults to the version in effect when the server receives the record.'
      )
  })
  .meta({ default: { transactionId: uuidv4(), type: 'birth' } })

export type EventInput = z.infer<typeof EventInput>
