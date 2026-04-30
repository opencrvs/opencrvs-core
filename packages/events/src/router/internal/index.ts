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
import { FamilyName, UserAuditRecordInput, UUID } from '@opencrvs/commons'
import { internalProcedure, serviceRouter } from '@events/router/trpc'
import {
  getUserCredentialsByUsername,
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
  name: FamilyName,
  securityQuestionKey: z.string(),
  scope: z.array(z.string())
})

/**
 * Intermediary route for having an endpoint to test with. Will be removed once we merge the user management changes.
 */
export const internalUserRouter = serviceRouter({
  ping: internalProcedure
    .input(z.string())
    .output(z.string())
    .query(({ input }) => {
      return `pong: ${input}`
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
        name: FamilyName,
        mobile: z.string().optional(),
        email: z.string().optional(),
        status: z.string(),
        role: z.string()
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
        name: [
          {
            use: 'en',
            given: [user.firstname ?? ''],
            family: user.surname ?? ''
          }
        ],
        mobile: user.mobile ?? undefined,
        email: user.email ?? undefined,
        status: user.status,
        role: user.role
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
      .input(UserAuditRecordInput)
      .mutation(async ({ input }) => {
        await writeAuditLog({
          ...input,
          clientId: input.requestData.subjectId,
          clientType: 'system'
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
