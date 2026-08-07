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

/**
 * Event statuses recognized by the system
 *
 * Deliberately kept in its own dependency-free module: `EventMetadata.ts`
 * pulls in `ActionDocument.ts`, which imports back from `../authentication`.
 * `../scopes` needs `EventStatus` and is itself imported by
 * `../authentication`, so importing it from `EventMetadata.ts` there would
 * complete that cycle and break module initialization order.
 */
export const EventStatus = z.enum([
  'CREATED',
  'NOTIFIED',
  'DECLARED',
  'REGISTERED',
  'ARCHIVED'
])

export type EventStatus = z.infer<typeof EventStatus>
