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
import {
  createSystemClient,
  getSystemClientById,
  listSystemClients,
  updateSystemClientStatus,
  deleteSystemClient,
  refreshSystemClientSecret
} from '@events/storage/postgres/events/system-clients'
import { compare, generateSaltedHash } from '@events/service/auth/hash'
import { getUsersById } from '@events/service/users/users'
import { UserOrSystem } from '@opencrvs/commons'

function getDisplayName(user: UserOrSystem): string {
  if (user.type === 'system') {
    return user.name
  }
  if (user.fullHonorificName) {
    return user.fullHonorificName
  }
  const namePart = user.name.find((n) => n.use === 'en') ?? user.name[0]
  if (!namePart) return ''
  return [...namePart.given, namePart.family].filter(Boolean).join(' ')
}

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
    status: z.string(),
    createdAt: z.string(),
    createdByName: z.string().nullable()
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

const IntegrationIdInput = z.object({
  id: UUID
})

const GetIntegrationOutput = z.object({
  id: z.string(),
  name: z.string(),
  scopes: z.array(z.string()),
  status: z.string(),
  shaSecret: z.string().nullable()
})

const ToggleStatusOutput = z.object({
  id: z.string(),
  name: z.string(),
  status: z.string()
})

const DeleteOutput = z.object({
  id: z.string(),
  name: z.string()
})

const RefreshSecretOutput = z.object({
  clientId: z.string(),
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
      const clientSecret = randomUUID()
      const shaSecret = randomUUID()
      const { hash: secretHash, salt } = await generateSaltedHash(clientSecret)

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

      if (!systemClient.secretHash || !systemClient.salt) {
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
    .query(async ({ input, ctx }) => {
      const rows = await listSystemClients(input ?? undefined)

      const creatorIds = [
        ...new Set(rows.map((r) => r.createdBy).filter((id): id is string => id != null))
      ]
      const creators = creatorIds.length
        ? await getUsersById(creatorIds, ctx.token)
        : []
      const creatorNameById = new Map(
        creators.map((u) => [u.id, getDisplayName(u)])
      )

      return rows.map((row) => ({
        id: row.id,
        name: row.name,
        scopes: row.scopes as string[],
        status: row.status,
        createdAt: row.createdAt,
        createdByName: row.createdBy != null ? (creatorNameById.get(row.createdBy) ?? null) : null
      }))
    }),

  get: userAndSystemProcedure
    .input(IntegrationIdInput)
    .output(GetIntegrationOutput)
    .use(requiresAnyOfScopes([SCOPES.INTEGRATION_CREATE]))
    .query(async ({ input }) => {
      const row = await getSystemClientById(input.id)
      return {
        id: row.id,
        name: row.name,
        scopes: row.scopes as string[],
        status: row.status,
        shaSecret: row.shaSecret
      }
    }),

  deactivate: userAndSystemProcedure
    .input(IntegrationIdInput)
    .output(ToggleStatusOutput)
    .use(requiresAnyOfScopes([SCOPES.INTEGRATION_CREATE]))
    .mutation(async ({ input, ctx }) => {
      const row = await updateSystemClientStatus(input.id, 'disabled')

      await writeAuditLog({
        clientId: ctx.user.id,
        clientType: ctx.user.type,
        operation: 'integrations.deactivate',
        requestData: { id: input.id },
        responseSummary: { id: row.id, status: row.status }
      })

      return { id: row.id, name: row.name, status: row.status }
    }),

  activate: userAndSystemProcedure
    .input(IntegrationIdInput)
    .output(ToggleStatusOutput)
    .use(requiresAnyOfScopes([SCOPES.INTEGRATION_CREATE]))
    .mutation(async ({ input, ctx }) => {
      const row = await updateSystemClientStatus(input.id, 'active')

      await writeAuditLog({
        clientId: ctx.user.id,
        clientType: ctx.user.type,
        operation: 'integrations.activate',
        requestData: { id: input.id },
        responseSummary: { id: row.id, status: row.status }
      })

      return { id: row.id, name: row.name, status: row.status }
    }),

  delete: userAndSystemProcedure
    .input(IntegrationIdInput)
    .output(DeleteOutput)
    .use(requiresAnyOfScopes([SCOPES.INTEGRATION_CREATE]))
    .mutation(async ({ input, ctx }) => {
      const row = await deleteSystemClient(input.id)

      await writeAuditLog({
        clientId: ctx.user.id,
        clientType: ctx.user.type,
        operation: 'integrations.delete',
        requestData: { id: input.id },
        responseSummary: { id: row.id, name: row.name }
      })

      return { id: row.id, name: row.name }
    }),

  refreshSecret: userAndSystemProcedure
    .input(IntegrationIdInput)
    .output(RefreshSecretOutput)
    .use(requiresAnyOfScopes([SCOPES.INTEGRATION_CREATE]))
    .mutation(async ({ input, ctx }) => {
      const clientSecret = randomUUID()
      const { hash: secretHash, salt } = await generateSaltedHash(clientSecret)

      await refreshSystemClientSecret(input.id, secretHash, salt)

      await writeAuditLog({
        clientId: ctx.user.id,
        clientType: ctx.user.type,
        operation: 'integrations.refreshSecret',
        requestData: { id: input.id },
        responseSummary: { clientId: input.id }
      })

      return { clientId: input.id, clientSecret }
    })
})
