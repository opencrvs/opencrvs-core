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
import { SCOPES, UUID } from '@opencrvs/commons'
import { router, userAndSystemProcedure } from '@events/router/trpc'
import { requiresAnyOfScopes } from '@events/router/middleware'
import { registerSystem } from '@events/service/integrations/api'
import {
  writeAuditLog,
  readAuditLog
} from '@events/storage/postgres/events/auditLog'

const CreateIntegrationInput = z.object({
  name: z.string().min(1, 'Integration name is required'),
  scopes: z.array(z.string()).min(1, 'At least one scope is required')
})

const CreateIntegrationOutput = z.object({
  clientId: z.string(),
  shaSecret: z.string(),
  clientSecret: z.string()
})

const AuditLogEntry = z.object({
  id: UUID,
  clientId: z.string(),
  clientType: z.string(),
  operation: z.string(),
  requestData: z.record(z.string(), z.unknown()).nullable(),
  responseSummary: z.record(z.string(), z.unknown()).nullable(),
  createdAt: z.string()
})

const AuditInput = z.object({
  clientId: UUID,
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  skip: z.number().int().nonnegative().optional().default(0),
  count: z.number().int().positive().max(100).optional().default(10)
})

const AuditOutput = z.object({
  total: z.number(),
  results: z.array(AuditLogEntry)
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


      await writeAuditLog({
        clientId: ctx.user.id,
        clientType: ctx.user.type,
        operation: 'integrations.create',
        requestData: { name: input.name, scopes: input.scopes },
        responseSummary: { clientId: result.clientId }
      })


      return result
    }),
  audit: userAndSystemProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/integrations/{clientId}/audit',
        summary: 'Retrieve audit log for a specific integration client',
        tags: ['Integrations']
      }
    })
    .input(AuditInput)
    .output(AuditOutput)
    .use(requiresAnyOfScopes([SCOPES.AUDIT_READ]))
    .query(async ({ input }) => {
      return readAuditLog({
        clientId: input.clientId,
        from: input.from,
        to: input.to,
        skip: input.skip,
        count: input.count
      })
    })
})
