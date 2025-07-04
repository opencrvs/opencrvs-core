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
import { Action } from './ActionDocument'
import { extendZodWithOpenApi } from 'zod-openapi'
import { UUID } from '../uuid'
extendZodWithOpenApi(z)

export const EventDocument = z
  .object({
    id: UUID,
    type: z.string(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    actions: z.array(Action),
    trackingId: z.string()
  })
  .openapi({ ref: 'EventDocument' })

export type EventDocument = z.infer<typeof EventDocument>
