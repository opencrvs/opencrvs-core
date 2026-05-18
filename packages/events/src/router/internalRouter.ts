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

import { serviceRouter } from '@events/router/trpc'
import { internalUserRouter } from './internal'

/**
 * Internal routes that are not exposed to external clients but can be used for internal communication between services or for administrative purposes.
 * These routes should require a special authentication and should be protected accordingly.
 */
export const internalRouter = serviceRouter({
  user: internalUserRouter
})

/** @knipignore */
export type InternalRouter = typeof internalRouter
