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
  User,
  UserInput,
  UserOrSystem
} from '@opencrvs/commons'
import { allowedWithAnyOfScopes } from '@events/router/middleware'
import {
  publicProcedure,
  router,
  userAndSystemProcedure,
  userOnlyProcedure
} from '@events/router/trpc'
import { getRoles } from '@events/service/config/config'
import { generateHash } from '@events/service/auth/hash'
import {
  getUserByMobileOrEmail,
  getUserByUsername,
  getUserCredentialsByUserId,
  updatePasswordHash,
  SecurityQuestion
} from '@events/storage/postgres/events/users'
import { getUserActions } from '@events/service/events/user/actions'
import {
  queryUserAuditLog,
  writeAuditLog
} from '@events/storage/postgres/events/auditLog'
import {
  activateUser,
  changeUserAvatar,
  changeUserEmail,
  changeUserPhone,
  createUser,
  getUser,
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

const VerifyUserOutput = z.object({
  id: z.string(),
  username: z.string(),
  mobile: z.string().optional(),
  email: z.string().optional(),
  status: z.string(),
  name: z.array(
    z.object({
      use: z.string(),
      given: z.array(z.string()),
      family: z.string()
    })
  ),
  securityQuestionKey: z.string(),
  scope: z.array(z.string())
})

export const userRouter = router({
  verifyPassword: publicProcedure
    .input(
      z.object({
        username: z.string(),
        password: z.string()
      })
    )
    .output(
      z.object({
        id: z.string(),
        name: z.array(
          z.object({
            use: z.string(),
            given: z.array(z.string()),
            family: z.string()
          })
        ),
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
  verifySecurityAnswer: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        questionKey: z.string(),
        answer: z.string()
      })
    )
    .output(z.object({ matched: z.boolean(), questionKey: z.string() }))
    .mutation(async ({ input }) => {
      const record = await getUserCredentialsByUserId(input.userId)

      if (!record) {
        throw new TRPCError({ code: 'UNAUTHORIZED' })
      }

      const questions = record.securityQuestions as SecurityQuestion[]

      if (!Array.isArray(questions) || questions.length === 0) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: "User doesn't have security questions"
        })
      }

      const matched = (
        await Promise.all(
          questions.map(async (q) => {
            if (q.questionKey !== input.questionKey) {
              return false
            }
            const hash = await generateHash(
              input.answer.toLowerCase(),
              record.salt
            )
            return hash === q.answerHash
          })
        )
      ).some(Boolean)

      const questionKey = matched
        ? input.questionKey
        : (questions.find((q) => q.questionKey !== input.questionKey)
            ?.questionKey ?? input.questionKey)

      return { matched, questionKey }
    }),
  verifyUser: publicProcedure
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

      const questions = user.securityQuestions as SecurityQuestion[]

      if (!Array.isArray(questions) || questions.length === 0) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: "User doesn't have security questions"
        })
      }

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
    .use(allowedWithAnyOfScopes(['user.create']))
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
    .use(allowedWithAnyOfScopes(['user.edit']))
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
  changePassword: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        existingPassword: z.string().optional(),
        password: z.string()
      })
    )
    .mutation(async ({ input }) => {
      const record = await getUserCredentialsByUserId(input.userId)

      if (!record) {
        logger.error(`No user details found by given userid: ${input.userId}`)
        // Don't return a 404 as this gives away that this user account exists
        throw new TRPCError({ code: 'UNAUTHORIZED' })
      }

      if (input.existingPassword) {
        if (record.status !== 'active') {
          logger.error(
            `User is not in active state for given userid: ${input.userId}`
          )
          // Don't return a 404 as this gives away that this user account exists
          throw new TRPCError({ code: 'UNAUTHORIZED' })
        }
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
      await updatePasswordHash(input.userId, newHash)
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
      const user = await getUser(ctx.user.id)

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
