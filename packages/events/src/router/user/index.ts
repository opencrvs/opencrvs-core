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
import { router, publicProcedure } from '@events/router/trpc'
import { getUsersById } from '@events/service/users/users'

export const userRouter = router({
  get: publicProcedure.input(z.string()).query(async ({ input }) => {
    const [user] = await getUsersById([input])
    return user
  }),
  list: publicProcedure
    .input(z.array(z.string()))
    .query(async ({ input }) => getUsersById(input))
})
