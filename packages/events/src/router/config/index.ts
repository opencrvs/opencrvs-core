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
import {
  publicProcedure,
  router,
  userAndSystemProcedure,
  userOnlyProcedure
} from '@events/router/trpc'
import {
  getClientApplicationConfig,
  getPublicApplicationConfig,
  getPrintableCertificateConfigurations
} from '@events/service/config/config'

export const configRouter = router({
  application: userAndSystemProcedure
    .input(z.void())
    .query(async () => getClientApplicationConfig()),

  publicApplication: publicProcedure
    .input(z.void())
    .query(async () => getPublicApplicationConfig()),

  /** The certificate templates the user may print. */
  certificates: userOnlyProcedure
    .input(z.void())
    .query(async ({ ctx }) => getPrintableCertificateConfigurations(ctx.token))
})
