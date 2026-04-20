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
  FamilyName,
  logger,
  UserAuditRecordInput,
  UUID
} from '@opencrvs/commons'
import { internalProcedure, internalRouter } from '@events/router/trpc'
import {
  getUserByMobileOrEmail,
  getUserByUsername,
  updatePasswordHash
} from '@events/storage/postgres/events/users'
import { generateHash } from '@events/service/auth/hash'
import {
  checkSecurityQuestionMatch,
  getCredentials,
  getSecurityQuestionsForUser
} from '@events/service/users/api'
import { getRoles } from '@events/service/config/config'
import { writeAuditLog } from '@events/storage/postgres/events/auditLog'

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
export const internalUserRouter = internalRouter({
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
      const user = await getUserByUsername(input.username)

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
        userId: z.string(),
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
      const user = await getUserByMobileOrEmail(
        input.mobile ? { mobile: input.mobile } : { email: input.email ?? '' }
      )

      if (!user) {
        // Don't reveal whether the account exists
        throw new TRPCError({ code: 'UNAUTHORIZED' })
      }

      const questions = getSecurityQuestionsForUser(user)

      const securityQuestionKey =
        questions[Math.floor(Math.random() * questions.length)].questionKey

      const roles = await getRoles()
      const scope = roles.find((r) => r.id === user.role)?.scopes ?? []

      return {
        id: user.id,
        username: user.username,
        mobile: user.mobile ?? undefined,
        email: user.email ?? undefined,
        status: user.status,
        name: [
          {
            use: 'en',
            given: [user.firstname ?? ''],
            family: user.surname ?? ''
          }
        ],
        securityQuestionKey,
        scope
      }
    }),
  changePassword: internalProcedure
    .input(
      z.object({
        userId: z.string(),
        existingPassword: z.string().optional(),
        password: z.string()
      })
    )
    .mutation(async ({ input }) => {
      const record = await getCredentials(input.userId)

      if (input.existingPassword) {
        const existingHash = await generateHash(
          input.existingPassword,
          record.salt
        )
        if (existingHash !== record.passwordHash) {
          logger.error(
            `Password didn't match for given userid: ${input.userId}`
          )
          // Don't return a 404 as this gives away that this user account exists
          throw new TRPCError({ code: 'UNAUTHORIZED' })
        }
      }

      const newHash = await generateHash(input.password, record.salt)
      await updatePasswordHash(UUID.parse(input.userId), newHash)
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
  }
})
