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
import { DatabaseError } from 'pg'
import { EncodedScope, TokenUserType, UUID } from '@opencrvs/commons'
import {
  publicProcedure,
  router,
  userAndSystemProcedure
} from '@events/router/trpc'
import { allowedWithAnyOfScopes } from '@events/router/middleware'
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

/** Postgres `unique_violation`, raised when a pre-shared client id is taken */
const PG_UNIQUE_VIOLATION = '23505'

const CreateIntegrationInput = z.object({
  name: z.string().min(1, 'Integration name is required'),
  scopes: z.array(z.string()).min(1, 'At least one scope is required'),
  /**
   * Pre-shared credentials. When given, the client is seeded with exactly
   * these values, so an integrating system (e.g. mosip-api) can authenticate
   * immediately using the pair it already carries in its own environment — no
   * manual "Reveal keys" step. Omit to have credentials generated, which is
   * what the Integrations UI does.
   *
   * Nested so that seeding one half without the other — a client nobody can
   * authenticate as — cannot be expressed.
   */
  credentials: z.optional(
    z.object({ clientId: UUID, clientSecret: z.string().min(1) })
  )
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
    createdAt: z.iso.datetime(),
    // Null for integrations registered from the country configuration on
    // startup — those are created by a system token, not by a user
    createdBy: UUID.nullable()
  })
)

const AuthenticateSystemInput = z.object({
  client_id: UUID,
  client_secret: z.string()
})

const AuthenticateSystemOutput = z.object({
  id: UUID,
  status: z.string(),
  scope: z.array(EncodedScope)
})

const IntegrationIdInput = z.object({
  id: UUID
})

const GetIntegrationOutput = z.object({
  id: z.string(),
  name: z.string(),
  scopes: z.array(z.string()),
  status: z.string(),
  shaSecret: z.string().nullable(),
  createdAt: z.string(),
  createdBy: UUID.nullable()
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
    .use(allowedWithAnyOfScopes(['integration.create']))
    .mutation(async ({ input, ctx }) => {
      const clientSecret = input.credentials?.clientSecret ?? randomUUID()
      const shaSecret = randomUUID()
      const { hash: secretHash, salt } = await generateSaltedHash(clientSecret)

      const row = await createSystemClient({
        // Kysely treats `undefined` as "not provided", so the column default
        // generates an id when no pre-shared one is given
        id: input.credentials?.clientId,
        name: input.name,
        scopes: input.scopes,
        // A system caller is the startup bootstrap token, which has no
        // users(id) behind it to reference
        createdBy:
          ctx.user.type === TokenUserType.enum.system ? null : ctx.user.id,
        secretHash,
        salt,
        shaSecret,
        status: 'active'
      }).catch((error: unknown) => {
        if (
          input.credentials &&
          error instanceof DatabaseError &&
          error.code === PG_UNIQUE_VIOLATION
        ) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: `An integration with client id ${input.credentials.clientId} already exists`
          })
        }
        throw error
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
        scope: systemClient.scopes as EncodedScope[]
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
    .use(allowedWithAnyOfScopes(['integration.create']))
    .query(async ({ input }) => {
      const rows = await listSystemClients(input ?? undefined)

      return rows.map((row) => ({
        id: row.id,
        name: row.name,
        scopes: row.scopes as string[],
        status: row.status,
        createdAt: row.createdAt,
        createdBy: row.createdBy
      }))
    }),

  get: userAndSystemProcedure
    .input(IntegrationIdInput)
    .output(GetIntegrationOutput)
    .use(allowedWithAnyOfScopes(['integration.create']))
    .query(async ({ input }) => {
      const row = await getSystemClientById(input.id)
      return {
        id: row.id,
        name: row.name,
        scopes: row.scopes as string[],
        status: row.status,
        shaSecret: row.shaSecret,
        createdAt: row.createdAt,
        createdBy: row.createdBy
      }
    }),

  deactivate: userAndSystemProcedure
    .input(IntegrationIdInput)
    .output(ToggleStatusOutput)
    .use(allowedWithAnyOfScopes(['integration.create']))
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
    .use(allowedWithAnyOfScopes(['integration.create']))
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
    .use(allowedWithAnyOfScopes(['integration.create']))
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
    .use(allowedWithAnyOfScopes(['integration.create']))
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
