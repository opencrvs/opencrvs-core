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
import { ActionDocument, ResolvedActionDocument } from './ActionDocument'

export const EventDocument = z.object({
  id: z.string(),
  type: z.string(),
  transactionId: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  actions: z.array(ActionDocument)
})

export type EventDocument = z.infer<typeof EventDocument>

/** ResolvedEventDocument is used when full event is fetched. Each of the identifier fields (locations, users) will incude actual values over ids. */
export const ResolvedEventDocument = EventDocument.extend({
  actions: z.array(ResolvedActionDocument)
})

export type ResolvedEventDocument = z.infer<typeof ResolvedEventDocument>
