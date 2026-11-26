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
import { NoResultError } from 'kysely'
import { DatabaseError } from 'pg'
import { EncodedScope, TokenUserType, UUID } from '@opencrvs/commons'
import { AuditLogEntrySchema } from '@opencrvs/commons/events'
import {
  publicProcedure,
  router,
  userAndSystemProcedure,
  userOnlyProcedure
} from '@events/router/trpc'
import { allowedWithAnyOfScopes } from '@events/router/middleware'
import {
  queryClientAuditLog,
  writeAuditLog
} from '@events/storage/postgres/events/auditLog'
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

/**
 * Reading one integration's audit log.
 *
 * Pagination is bounded, unlike the sibling `user.audit.list` — nonsense page
 * sizes are rejected at the validation edge instead of reaching the database.
 *
 * Time bounds require a full instant. A bare calendar date is refused rather
 * than normalised, because "end of that day" needs a timezone the server
 * cannot infer; an offset such as `+02:00` is an unambiguous instant and is
 * accepted. There is no operation-exclusion filter: no use case for one.
 */
const IntegrationAuditInput = z.object({
  id: UUID,
  skip: z.number().int().min(0).optional().default(0),
  count: z.number().int().min(1).max(100).optional().default(10),
  timeStart: z.iso.datetime({ offset: true }).optional(),
  timeEnd: z.iso.datetime({ offset: true }).optional()
})

/**
 * Entries are validated against the audit entry union so a client can
 * discriminate on the operation. Deliberately strict: an unmodelled row fails
 * the whole page rather than being dropped silently. For a compliance artefact
 * a visible failure beats a silent gap — do not add a permissive fallback.
 */
const IntegrationAuditOutput = z.object({
  results: z.array(AuditLogEntrySchema),
  total: z.number()
})

class SystemClientNotFoundError extends TRPCError {
  constructor(id: string) {
    super({
      code: 'NOT_FOUND',
      message: `System client not found with ID: ${id}`
    })
  }
}

/**
 * Get a system client by ID. Throws tRPC HTTP 404 if it does not exist.
 *
 * `getSystemClientById` throws Kysely's `NoResultError`, and the service has no
 * global mapping from that to a 404, so unhandled it surfaces as a 500. Same
 * shape as `getEventById` in `service/events/events.ts`.
 */
async function requireSystemClientById(id: UUID) {
  try {
    return await getSystemClientById(id)
  } catch (error) {
    if (error instanceof NoResultError) {
      throw new SystemClientNotFoundError(id)
    }
    throw error
  }
}

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
    }),

  /**
   * Reads what a single system client actually did, newest first.
   *
   * tRPC-only on purpose: no `openapi` meta, so this is not a documented REST
   * route. There is no external consumer, because the endpoint is closed to
   * machine callers — hence `userOnlyProcedure`. Audit review is human
   * oversight over machines: a compromised integration credential must not be
   * usable to survey what any integration has been doing, not even its own.
   *
   * No jurisdiction filter, and that is a property of the domain rather than a
   * shortcut: system clients have no office and no administrative area, so
   * there is nothing for the access-level machinery to match against.
   * Integrations are national. See
   * docs/adr/0001-system-client-audit-log-access.md.
   */
  audit: userOnlyProcedure
    .input(IntegrationAuditInput)
    .output(IntegrationAuditOutput)
    .use(allowedWithAnyOfScopes(['integration.audit.read']))
    .query(async ({ input }) => {
      /*
       * This looks like a redundant existence check before a query that filters
       * on the same id anyway. It is load-bearing security. `audit_log
       * .client_id` is untyped text with no foreign key, shared by users and
       * system clients alike, so a read keyed only on that column cannot tell
       * the two apart. Without this, a holder of `integration.audit.read` could
       * pass any *user's* id and read that user's entire audit log — logins,
       * password changes, contact changes — without holding the scope that
       * governs user audit access at all.
       *
       * Filtering on `clientType` is not a substitute: the anonymous
       * username-reminder path writes user-keyed rows with `clientType:
       * 'system'`, so a client-type predicate still leaks them.
       *
       * See docs/adr/0001-system-client-audit-log-access.md before changing
       * this.
       */
      await requireSystemClientById(input.id)

      const { results, total } = await queryClientAuditLog({
        clientId: input.id,
        skip: input.skip,
        count: input.count,
        timeStart: input.timeStart,
        timeEnd: input.timeEnd,
        // This endpoint has no operation-exclusion filter.
        excludeOperations: []
      })

      return {
        results: results.map((r) => AuditLogEntrySchema.parse(r)),
        total
      }
    })
})
