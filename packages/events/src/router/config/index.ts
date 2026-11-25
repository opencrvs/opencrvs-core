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
import { getAcceptedScopesFromToken } from '@opencrvs/commons/authentication'
import {
  publicProcedure,
  router,
  userAndSystemProcedure,
  userOnlyProcedure
} from '@events/router/trpc'
import {
  getClientApplicationConfig,
  getPublicApplicationConfig,
  getInMemoryCertificateConfigurations
} from '@events/service/config/config'

export const configRouter = router({
  application: userAndSystemProcedure
    .input(z.void())
    .query(async () => getClientApplicationConfig()),

  publicApplication: publicProcedure
    .input(z.void())
    .query(async () => getPublicApplicationConfig()),

  /** The certificate templates the user may print. */
  certificates: userOnlyProcedure.input(z.void()).query(async ({ ctx }) => {
    const printScopes = getAcceptedScopesFromToken(ctx.token, [
      'record.print-certified-copies'
    ])
    if (printScopes.length === 0) {
      return []
    }

    const certificates = await getInMemoryCertificateConfigurations()
    if (printScopes.some((scope) => !scope.options?.templates?.length)) {
      return certificates
    }

    const allowed = new Set(
      printScopes.flatMap((scope) => scope.options?.templates ?? [])
    )
    return certificates.filter(({ id }) => allowed.has(id))
  })
})
