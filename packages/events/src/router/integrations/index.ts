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

import { randomUUID } from 'crypto'
import * as z from 'zod/v4'
import { TRPCError } from '@trpc/server'
import { SCOPES, UUID } from '@opencrvs/commons'
import { publicProcedure, router, userAndSystemProcedure } from '@events/router/trpc'
import { requiresAnyOfScopes } from '@events/router/middleware'
import { writeAuditLog } from '@events/storage/postgres/events/auditLog'
import { createSystemClient, getSystemClientById, listSystemClients } from '@events/storage/postgres/events/system-clients'
import { compare, generateSaltedHash } from '@events/service/auth/hash'

const CreateIntegrationInput = z.object({
  name: z.string().min(1, 'Integration name is required'),
  scopes: z.array(z.string()).min(1, 'At least one scope is required')
})

const CreateIntegrationOutput = z.object({
  clientId: z.string(),
  shaSecret: z.string(),
  clientSecret: z.string()
})

const ListIntegrationsInput = z
  .object({
    status: z.optional(z.enum(['active', 'disabled']))
  })
  .optional()

const ListIntegrationsOutput = z.array(
  z.object({
    id: z.string(),
    name: z.string(),
    scopes: z.array(z.string()),
    status: z.string()
  })
)

const AuthenticateSystemInput = z.object({
  client_id: UUID,
  client_secret: z.string()
})

const AuthenticateSystemOutput = z.object({
  id: UUID,
  status: z.string(),
  scope: z.array(z.string())
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
      const clientSecret = randomUUID()
      const shaSecret = randomUUID()
      const { hash: secretHash, salt } = generateSaltedHash(clientSecret)

      const row = await createSystemClient({
        name: input.name,
        scopes: input.scopes,
        createdBy: ctx.user.id,
        secretHash,
        salt,
        shaSecret,
        status: 'active'
      })

      const result = {
        clientId: row.id,
        shaSecret,
        clientSecret
      }

      await writeAuditLog({
        clientId: ctx.user.id,
        clientType: ctx.user.type,
        operation: 'integrations.create',
        requestData: { name: input.name, scopes: input.scopes },
        responseSummary: { clientId: result.clientId }
      })

      return result
    }),

  authenticate: publicProcedure
    .input(AuthenticateSystemInput)
    .output(AuthenticateSystemOutput)
    .mutation(async ({ input }) => {
      const systemClient = await getSystemClientById(input.client_id)

      if (!systemClient || !systemClient.secretHash || !systemClient.salt) {
        throw new TRPCError({ code: 'UNAUTHORIZED' })
      }

      if (!(await compare(input.client_secret, systemClient.secretHash))) {
        throw new TRPCError({ code: 'UNAUTHORIZED' })
      }

      return {
        id: systemClient.id as UUID,
        status: systemClient.status,
        scope: systemClient.scopes as string[]
      }
    }),

  list: userAndSystemProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/integrations',
        summary: 'List integration clients',
        tags: ['Integrations']
      }
    })
    .input(ListIntegrationsInput)
    .output(ListIntegrationsOutput)
    .use(requiresAnyOfScopes([SCOPES.INTEGRATION_CREATE]))
    .query(async ({ input }) => {
      const rows = await listSystemClients(input ?? undefined)
      return rows.map((row) => ({
        id: row.id,
        name: row.name,
        scopes: row.scopes as string[],
        status: row.status
      }))
    })
})
