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
import { pick } from 'lodash'
import { z } from 'zod'
import { getAcceptedScopesFromToken } from '@opencrvs/commons/authentication'
import {
  publicProcedure,
  router,
  userAndSystemProcedure
} from '@events/router/trpc'
import {
  getApplicationConfig,
  getClientApplicationConfig,
  getInMemoryCertificateConfigurations
} from '@events/service/config/config'

/** The application configuration fields the login page shows before sign-in. */
const PUBLIC_APPLICATION_CONFIG_FIELDS = [
  'APPLICATION_NAME',
  'COUNTRY_LOGO',
  'PHONE_NUMBER_PATTERN',
  'USER_NOTIFICATION_DELIVERY_METHOD',
  'INFORMANT_NOTIFICATION_DELIVERY_METHOD'
] as const

export const configRouter = router({
  application: userAndSystemProcedure
    .input(z.void())
    .query(async () => getClientApplicationConfig()),

  publicApplication: publicProcedure
    .input(z.void())
    .query(async () =>
      pick(await getApplicationConfig(), PUBLIC_APPLICATION_CONFIG_FIELDS)
    ),

  /** The certificate templates the caller may print. */
  certificates: userAndSystemProcedure
    .input(z.void())
    .query(async ({ ctx }) => {
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
