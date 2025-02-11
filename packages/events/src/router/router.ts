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

import { router } from '@events/router/trpc'

import { eventRouter } from './event'
import { userRouter } from './user'
import { locationRouter } from './locations'

export const appRouter = router({
  event: eventRouter,
  user: userRouter,
  locations: locationRouter
})

/** @knipignore */
export type AppRouter = typeof appRouter
