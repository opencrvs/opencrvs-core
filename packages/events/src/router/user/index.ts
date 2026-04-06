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

import { TRPCError } from '@trpc/server'
import * as z from 'zod/v4'
import { UserAuditRecordInput } from '@opencrvs/commons/events'
import {
  AuditLogEntrySchema,
  UserAuditRecordInput
} from '@opencrvs/commons/events'
import {
  logger,
  personNameFromV1ToV2,
  SCOPES,
  User,
  UserInput,
  UserOrSystem
} from '@opencrvs/commons'
import { requiresAnyOfScopes } from '@events/router/middleware'
import {
  router,
  userAndSystemProcedure,
  userOnlyProcedure
} from '@events/router/trpc'
import { getRoles } from '@events/service/config/config'
import { getUserActions } from '@events/service/events/user/actions'
import {
  queryUserAuditLog,
  writeAuditLog
} from '@events/storage/postgres/events/auditLog'
import {
  activateUser,
  changeUserAvatar,
  changeUserEmail,
  changeUserPassword,
  changeUserPhone,
  createUser,
  getLegacyUser,
  searchUsers,
  updateUser
} from '@events/service/users/api'
import { getUsersById, isUser } from '@events/service/users/users'
import {
  checkVerificationCode,
  generateAndSendVerificationCode,
  generateNonce
} from '@events/service/verifyCode'
import { UserActionsQuery } from '@events/storage/postgres/events/actions'
import { userCanReadOtherUser } from '../middleware'

const UserAuditListQuery = z.object({
  userId: z.string(),
  skip: z.number().optional().default(0),
  count: z.number().optional().default(10),
  timeStart: z.string().optional(),
  timeEnd: z.string().optional(),
  excludeOperations: z.array(z.string()).optional().default([])
})

const auditRouter = router({
  record: userAndSystemProcedure
    .input(UserAuditRecordInput)
    .mutation(async ({ input, ctx }) => {
      await writeAuditLog({
        ...input,
        clientId: ctx.user.id,
        clientType: ctx.user.type
      })
    }),
  list: userOnlyProcedure
    .input(UserAuditListQuery)
    .output(
      z.object({ results: z.array(AuditLogEntrySchema), total: z.number() })
    )
    .use(userCanReadOtherUser)
    .query(async ({ input }) => {
      const { results, total } = await queryUserAuditLog({
        subjectId: input.userId,
        skip: input.skip,
        count: input.count,
        timeStart: input.timeStart,
        timeEnd: input.timeEnd,
        excludeOperations: input.excludeOperations
      })
      return {
        results: results.map((r) => AuditLogEntrySchema.parse(r)),
        total
      }
    })
})

const UserSearch = z.object({
  username: z.string().optional(),
  mobile: z.string().optional(),
  status: z.string().optional(),
  primaryOfficeId: z.string().optional(),
  locationId: z.string().optional(),
  count: z.number().min(0),
  skip: z.number().min(0),
  sortOrder: z.enum(['asc', 'desc'])
})

export const userRouter = router({
  get: userOnlyProcedure
    .input(z.string())
    .output(UserOrSystem)
    .query(async ({ input, ctx }) => {
      const users = await getUsersById([input], ctx.token)
      if (users.length === 0) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }

      return users[0]
    }),
  create: userAndSystemProcedure
    .use(
      requiresAnyOfScopes([
        SCOPES.USER_CREATE,
        SCOPES.USER_CREATE_MY_JURISDICTION
      ])
    )
    .input(UserInput)
    .output(User)
    .mutation(async ({ input, ctx }) => {
      if (input.mobile) {
        const existingWithMobile = await searchUsers(
          { mobile: input.mobile, count: 1, skip: 0, sortOrder: 'asc' },
          ctx.token
        )
        if (existingWithMobile.length > 0) {
          logger.error(
            `Phone number ${input.mobile} is already in use by another user`
          )
          throw new TRPCError({ code: 'CONFLICT', message: 'DUPLICATE_PHONE' })
        }
      }
      if (input.email) {
        const existingWithEmail = await searchUsers(
          { email: input.email, count: 1, skip: 0, sortOrder: 'asc' },
          ctx.token
        )
        if (existingWithEmail.length > 0) {
          logger.error(`Email ${input.email} is already in use by another user`)
          throw new TRPCError({ code: 'CONFLICT', message: 'DUPLICATE_EMAIL' })
        }
      }
      return createUser(input, ctx.token)
    }),
  update: userAndSystemProcedure
    .use(
      requiresAnyOfScopes([
        SCOPES.USER_UPDATE,
        SCOPES.USER_UPDATE_MY_JURISDICTION
      ])
    )
    .input(UserInput.and(z.object({ id: z.string() })))
    .output(User)
    .mutation(async ({ input, ctx }) => {
      if (input.mobile) {
        const existingWithMobile = await searchUsers(
          { mobile: input.mobile, count: 1, skip: 0, sortOrder: 'asc' },
          ctx.token
        )
        if (
          existingWithMobile.length > 0 &&
          existingWithMobile[0].id !== input.id
        ) {
          logger.error(
            `Phone number ${input.mobile} is already in use by another user`
          )
          throw new TRPCError({ code: 'CONFLICT', message: 'DUPLICATE_PHONE' })
        }
      }
      if (input.email) {
        const existingWithEmail = await searchUsers(
          { email: input.email, count: 1, skip: 0, sortOrder: 'asc' },
          ctx.token
        )
        if (
          existingWithEmail.length > 0 &&
          existingWithEmail[0].id !== input.id
        ) {
          logger.error(`Email ${input.email} is already in use by another user`)
          throw new TRPCError({ code: 'CONFLICT', message: 'DUPLICATE_EMAIL' })
        }
      }
      return updateUser(input, ctx.token)
    }),
  list: userOnlyProcedure
    .input(z.array(z.string()))
    .output(z.array(UserOrSystem))
    .query(async ({ input, ctx }) => getUsersById(input, ctx.token)),
  search: userAndSystemProcedure
    .input(UserSearch)
    .output(z.array(UserOrSystem))
    .query(async ({ input, ctx }) => searchUsers(input, ctx.token)),
  actions: userOnlyProcedure
    .input(UserActionsQuery)
    .use(userCanReadOtherUser)
    .query(async ({ input }) => {
      return getUserActions(input)
    }),
  roles: router({
    list: userOnlyProcedure.query(async ({ ctx }) => getRoles(ctx.token))
  }),
  changePassword: userOnlyProcedure
    .input(
      z.object({
        userId: z.string(),
        existingPassword: z.string(),
        password: z.string()
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (input.userId !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "Not allowed to change another user's password"
        })
      }
      await changeUserPassword(input, ctx.token)
    }),
  sendVerifyCode: userOnlyProcedure
    .input(
      z.object({
        notificationEvent: z.enum([
          'change-phone-number',
          'change-email-address'
        ])
      })
    )
    .output(
      z.object({
        nonce: z.string()
      })
    )
    .mutation(async ({ input, ctx }) => {
      const nonce = generateNonce()
      const rawToken = ctx.token.replace('Bearer ', '')
      const user = await getLegacyUser(ctx.user.id, ctx.token)

      await generateAndSendVerificationCode({
        nonce,
        token: rawToken,
        notificationEvent: input.notificationEvent,
        recipientName: personNameFromV1ToV2(user.name),
        phoneNumber: user.mobile,
        email: user.email
      })

      return {
        nonce
      }
    }),
  changePhone: userOnlyProcedure
    .input(
      z.object({
        userId: z.string(),
        phoneNumber: z.string(),
        nonce: z.string(),
        verifyCode: z.string()
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (input.userId !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "Not allowed to change another user's phone number"
        })
      }
      try {
        checkVerificationCode(input.nonce, input.verifyCode)
      } catch (err) {
        logger.error(
          `Phone number change verification failed for user ${input.userId}: ${(err as Error).message}`
        )
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Verification failed: ${(err as Error).message}`
        })
      }

      const [user] = await getUsersById([input.userId], ctx.token)

      if (!isUser(user)) {
        logger.error(`Failed to change phone number: Subject is a system user`)
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Failed to change phone number: Subject is a system user`
        })
      }

      if (!user.email) {
        logger.error(
          `Failed to change phone number for user ${input.userId}: User has no email address to send verification code to`
        )
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Failed to change phone number: User has no email address to send verification code to`
        })
      }

      const userWithDuplicateNumber = await searchUsers(
        {
          email: user.email,
          count: 1,
          skip: 0,
          sortOrder: 'asc'
        },
        ctx.token
      )

      if (
        userWithDuplicateNumber.length > 0 &&
        userWithDuplicateNumber[0].id !== input.userId
      ) {
        logger.error(
          `Phone number ${input.phoneNumber} is already in use by another user`
        )
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Phone number is already in use'
        })
      }

      await changeUserPhone(
        { userId: input.userId, phoneNumber: input.phoneNumber },
        ctx.token
      )
    }),
  changeEmail: userOnlyProcedure
    .input(
      z.object({
        userId: z.string(),
        email: z.string(),
        nonce: z.string(),
        verifyCode: z.string()
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (input.userId !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "Not allowed to change another user's email"
        })
      }
      try {
        checkVerificationCode(input.nonce, input.verifyCode)
      } catch (err) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Verification failed: ${(err as Error).message}`
        })
      }

      const userWithDuplicateEmail = await searchUsers(
        {
          email: input.email,
          count: 1,
          skip: 0,
          sortOrder: 'asc'
        },
        ctx.token
      )

      if (
        userWithDuplicateEmail.length > 0 &&
        userWithDuplicateEmail[0].id !== input.userId
      ) {
        logger.error(`Email ${input.email} is already in use by another user`)
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Email is already in use'
        })
      }

      await changeUserEmail(
        { userId: input.userId, email: input.email },
        ctx.token
      )
    }),
  changeAvatar: userOnlyProcedure
    .input(
      z.object({
        userId: z.string(),
        avatar: z.object({
          type: z.string(),
          data: z.string()
        })
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (input.userId !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "Not allowed to change another user's avatar"
        })
      }
      await changeUserAvatar(input, ctx.token)
    }),
  activate: userOnlyProcedure
    .input(z.any())
    .mutation(async ({ input, ctx }) => {
      return activateUser(input, ctx.token)
    }),
  audit: auditRouter
})
