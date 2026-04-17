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
import { internalProcedure, internalRouter } from '@events/router/trpc'

/**
 * Intermediary route for having an endpoint to test with. Will be removed once we merge the user management changes.
 */
export const internalUserRouter = internalRouter({
  ping: internalProcedure
    .input(z.string())
    .output(z.string())
    .query(({ input }) => {
      return `pong: ${input}`
    })
})
