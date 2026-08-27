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
import { TRPCError } from '@trpc/server'
import {
  UserName,
  UserAuditRecordInput,
  TokenUserType,
  UUID
} from '@opencrvs/commons'
import { internalProcedure, serviceRouter } from '@events/router/trpc'
import {
  getUserCredentialsByUsername,
  getUserRoleAndStatus,
  updatePasswordHash
} from '@events/storage/postgres/events/users'
import { generateHash } from '@events/service/auth/hash'
import {
  checkSecurityQuestionMatch,
  getCredentials,
  getSecurityQuestionsForUser,
  verifyUser
} from '@events/service/users/api'
import { writeAuditLog } from '@events/storage/postgres/events/auditLog'
import { getSystemInitialisation } from '@events/service/auth'
import { canInitialiseSystem } from '../middleware'

const VerifyUserOutput = z.object({
  id: z.string(),
  username: z.string(),
  mobile: z.string().optional(),
  email: z.string().optional(),
  status: z.string(),
  name: UserName,
  securityQuestionKey: z.string(),
  scope: z.array(z.string())
})

/**
 * Audit entries written through this router are authored by a trusted service,
 * so the acting client is supplied explicitly rather than derived from a token.
 */
const InternalUserAuditRecordInput = z.object({
  clientId: z.string(),
  clientType: TokenUserType,
  entry: UserAuditRecordInput
})

/**
 * Service-to-service routes, reachable only with an internal service token
 * (see `internalProcedure`). These are not exposed to clients: they exist so
 * the auth service can read and write user state it does not own.
 */
export const internalUserRouter = serviceRouter({
  getById: internalProcedure
    .input(UUID)
    .output(z.object({ id: z.string(), role: z.string(), status: z.string() }))
    // System clients live in a separate table; querying `users` already excludes them.
    .query(async ({ input }) => {
      const user = await getUserRoleAndStatus(input)
      if (!user) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }
      return user
    }),
  verifyPassword: internalProcedure
    .input(
      z.object({
        username: z.string(),
        password: z.string()
      })
    )
    .output(
      z.object({
        id: z.string(),
        name: UserName,
        mobile: z.string().optional(),
        email: z.string().optional(),
        status: z.string(),
        role: z.string(),
        primaryOfficeId: z.string()
      })
    )
    .mutation(async ({ input }) => {
      const user = await getUserCredentialsByUsername(input.username)

      if (!user) {
        throw new TRPCError({ code: 'UNAUTHORIZED' })
      }

      const hash = await generateHash(input.password, user.salt)
      if (hash !== user.passwordHash) {
        throw new TRPCError({ code: 'UNAUTHORIZED' })
      }

      return {
        id: user.id,
        name: {
          firstname: user.firstname,
          surname: user.surname
        },
        mobile: user.mobile ?? undefined,
        email: user.email ?? undefined,
        status: user.status,
        role: user.role,
        primaryOfficeId: user.officeId
      }
    }),
  verifySecurityAnswer: internalProcedure
    .input(
      z.object({
        userId: UUID,
        questionKey: z.string(),
        answer: z.string()
      })
    )
    .output(z.object({ matched: z.boolean(), questionKey: z.string() }))
    .mutation(async ({ input }) => {
      const record = await getCredentials(input.userId)

      const questions = getSecurityQuestionsForUser(record)
      return checkSecurityQuestionMatch({
        questions,
        input,
        salt: record.salt
      })
    }),
  verifyUser: internalProcedure
    .input(
      z
        .object({ mobile: z.string().optional(), email: z.string().optional() })
        .refine((d) => d.mobile || d.email, 'mobile or email required')
    )
    .output(VerifyUserOutput)
    .mutation(async ({ input }) => {
      return verifyUser(input)
    }),
  changePassword: internalProcedure
    .input(
      z.object({
        userId: UUID,
        password: z.string()
      })
    )
    .mutation(async ({ input }) => {
      const record = await getCredentials(input.userId)
      const newHash = await generateHash(input.password, record.salt)
      await updatePasswordHash(UUID.parse(input.userId), newHash)
      void writeAuditLog({
        clientId: input.userId,
        clientType: 'user',
        operation: 'user.password_reset',
        requestData: { subjectId: input.userId }
      })
    }),
  audit: {
    record: internalProcedure
      .input(InternalUserAuditRecordInput)
      .mutation(async ({ input }) => {
        await writeAuditLog({
          ...input.entry,
          clientId: input.clientId,
          clientType: input.clientType
        })
      })
  },
  initialisation: {
    authenticate: internalProcedure
      .use(canInitialiseSystem())
      .input(z.object({ password: z.string() }))
      .output(z.object({ valid: z.boolean() }))
      .mutation(async ({ input }) => {
        const systemInitialisation = await getSystemInitialisation()

        if (systemInitialisation.completedAt !== null) {
          throw new TRPCError({
            code: 'UNAUTHORIZED'
          })
        }

        const hash = await generateHash(
          input.password,
          systemInitialisation.salt
        )
        if (hash !== systemInitialisation.hash) {
          throw new TRPCError({ code: 'UNAUTHORIZED' })
        }

        return { valid: true }
      })
  }
})
