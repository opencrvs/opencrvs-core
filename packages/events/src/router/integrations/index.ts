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
import { SCOPES } from '@opencrvs/commons'
import { router, userAndSystemProcedure } from '@events/router/trpc'
import { requiresAnyOfScopes } from '@events/router/middleware'
import { registerSystem } from '@events/service/integrations/api'

const CreateIntegrationInput = z.object({
  name: z.string().min(1, 'Integration name is required'),
  scopes: z.array(z.string()).min(1, 'At least one scope is required')
})

const CreateIntegrationOutput = z.object({
  clientId: z.string(),
  shaSecret: z.string(),
  clientSecret: z.string()
})

export const integrationsRouter = router({
  create: userAndSystemProcedure
    .meta({
      openapi: {
        method: 'POST',
        path: '/integrations',
        summary: 'Create a new integration client',
        tags: ['Integrations']
      }
    })
    .input(CreateIntegrationInput)
    .output(CreateIntegrationOutput)
    .use(requiresAnyOfScopes([SCOPES.INTEGRATION_CREATE]))
    .mutation(async ({ input, ctx }) => {
      const result = await registerSystem(
        {
          name: input.name,
          type: 'CUSTOM',
          scope: input.scopes
        },
        ctx.token
      )

      return result
    })
})
