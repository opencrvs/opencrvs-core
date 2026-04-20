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
import {
  AuditLogEntrySchema,
  UserAuditRecordInput,
  UUID
} from '@opencrvs/commons/events'
import {
  isBase64FileString,
  logger,
  personNameFromV1ToV2,
  User,
  UserInput,
  UserOrSystem
} from '@opencrvs/commons'
import {
  allowedWithAnyOfScopes,
  enforceOfficeUpdatePermission
} from '@events/router/middleware'
import {
  router,
  userAndSystemProcedure,
  userOnlyProcedure
} from '@events/router/trpc'
import { getRoles } from '@events/service/config/config'
import { generateHash } from '@events/service/auth/hash'
import {
  updatePasswordHash,
  updateUserById,
  deleteSuperUser
} from '@events/storage/postgres/events/users'
import { getUserActions } from '@events/service/events/user/actions'
import {
  queryUserAuditLog,
  writeAuditLog
} from '@events/storage/postgres/events/auditLog'
import {
  activateUser,
  createUser,
  getCredentials,
  getUser,
  searchUsers,
  updateUser
} from '@events/service/users/api'
import { uploadBase64File } from '@events/service/files'
import { getUsersById, isUser } from '@events/service/users/api'
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
    .query(async ({ input }) => {
      const users = await getUsersById([input])
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
        const existingWithMobile = await searchUsers({
          mobile: input.mobile,
          count: 1,
          skip: 0,
          sortOrder: 'asc'
        })
        if (existingWithMobile.length > 0) {
          logger.error(
            `Phone number ${input.mobile} is already in use by another user`
          )
          throw new TRPCError({ code: 'CONFLICT', message: 'DUPLICATE_PHONE' })
        }
      }
      if (input.email) {
        const existingWithEmail = await searchUsers({
          email: input.email,
          count: 1,
          skip: 0,
          sortOrder: 'asc'
        })
        if (existingWithEmail.length > 0) {
          logger.error(`Email ${input.email} is already in use by another user`)
          throw new TRPCError({ code: 'CONFLICT', message: 'DUPLICATE_EMAIL' })
        }
      }
      const user = await createUser(input, ctx.token)
      await writeAuditLog({
        ...input,
        clientId: user.id,
        clientType: user.type,
        operation: 'user.create_user',
        requestData: {
          subjectId: user.id,
          role: user.role,
          primaryOfficeId: user.primaryOfficeId
        }
      })

      return user
    }),
  update: userAndSystemProcedure
    .use(allowedWithAnyOfScopes(['user.edit']))
    .input(UserInput.and(z.object({ id: z.string() })))
    .use(enforceOfficeUpdatePermission)
    .output(User)
    .mutation(async ({ input, ctx }) => {
      if (input.mobile) {
        const existingWithMobile = await searchUsers({
          mobile: input.mobile,
          count: 1,
          skip: 0,
          sortOrder: 'asc'
        })
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
        const existingWithEmail = await searchUsers({
          email: input.email,
          count: 1,
          skip: 0,
          sortOrder: 'asc'
        })
        if (
          existingWithEmail.length > 0 &&
          existingWithEmail[0].id !== input.id
        ) {
          logger.error(`Email ${input.email} is already in use by another user`)
          throw new TRPCError({ code: 'CONFLICT', message: 'DUPLICATE_EMAIL' })
        }
      }
      const user = await updateUser(input, ctx.token)
      await writeAuditLog({
        operation: 'user.edit_user',
        requestData: { subjectId: input.id },
        clientId: ctx.user.id,
        clientType: ctx.user.type
      })
      return user
    }),
  list: userOnlyProcedure
    .input(z.array(z.string()))
    .output(z.array(UserOrSystem))
    .query(async ({ input }) => getUsersById(input)),
  search: userAndSystemProcedure
    .input(UserSearch)
    .output(z.array(UserOrSystem))
    .query(async ({ input }) =>
      searchUsers({
        ...input,
        primaryOfficeId: input.primaryOfficeId
          ? UUID.parse(input.primaryOfficeId)
          : undefined,
        locationId: input.locationId ? UUID.parse(input.locationId) : undefined
      })
    ),
  actions: userOnlyProcedure
    .input(UserActionsQuery)
    .use(userCanReadOtherUser)
    .query(async ({ input }) => {
      return getUserActions(input)
    }),
  roles: router({
    list: userOnlyProcedure.query(async () => getRoles())
  }),
  changePassword: userOnlyProcedure
    .input(
      z.object({
        userId: z.string(),
        existingPassword: z.string().optional(),
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
      const record = await getCredentials(ctx.user.id)

      if (input.existingPassword) {
        const existingHash = await generateHash(
          input.existingPassword,
          record.salt
        )
        if (existingHash !== record.passwordHash) {
          logger.error(`Password didn't match for given userid: ${ctx.user.id}`)
          // Don't return a 404 as this gives away that this user account exists
          throw new TRPCError({ code: 'UNAUTHORIZED' })
        }
      }

      const newHash = await generateHash(input.password, record.salt)
      await updatePasswordHash(UUID.parse(ctx.user.id), newHash)
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

      const [user] = await getUsersById([ctx.user.id])

      if (!isUser(user)) {
        logger.error(`Failed to change phone number: Subject is a system user`)
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Failed to change phone number: Subject is a system user`
        })
      }

      if (user.status !== 'active') {
        logger.error(
          `User is not in active state for given userid: ${ctx.user.id}`
        )
        throw new TRPCError({ code: 'UNAUTHORIZED' })
      }

      if (!user.email) {
        logger.error(
          `Failed to change phone number for user ${ctx.user.id}: User has no email address to send verification code to`
        )
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Failed to change phone number: User has no email address to send verification code to`
        })
      }

      const userWithDuplicateNumber = await searchUsers({
        mobile: input.phoneNumber,
        count: 1,
        skip: 0,
        sortOrder: 'asc'
      })

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

      await updateUserById(UUID.parse(ctx.user.id), {
        mobile: input.phoneNumber
      })
      await writeAuditLog({
        operation: 'user.phone_number_changed',
        requestData: { subjectId: ctx.user.id },
        responseSummary: { phoneNumber: input.phoneNumber },
        clientId: ctx.user.id,
        clientType: ctx.user.type
      })
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

      const subject = await getUser(ctx.user.id)
      if (subject.status !== 'active') {
        logger.error(
          `User is not in active state for given userid: ${ctx.user.id}`
        )
        throw new TRPCError({ code: 'UNAUTHORIZED' })
      }

      const userWithDuplicateEmail = await searchUsers({
        email: input.email,
        count: 1,
        skip: 0,
        sortOrder: 'asc'
      })

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

      await updateUserById(UUID.parse(ctx.user.id), { email: input.email })
      await writeAuditLog({
        operation: 'user.email_address_changed',
        requestData: { subjectId: ctx.user.id },
        responseSummary: { email: input.email },
        clientId: ctx.user.id,
        clientType: ctx.user.type
      })
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
      const subject = await getUser(ctx.user.id)
      if (subject.status !== 'active') {
        logger.error(
          `User is not in active state for given userid: ${ctx.user.id}`
        )
        throw new TRPCError({ code: 'UNAUTHORIZED' })
      }
      const profileImagePath = isBase64FileString(input.avatar.data)
        ? await uploadBase64File(input.avatar.data, ctx.token)
        : input.avatar.data
      await updateUserById(UUID.parse(ctx.user.id), { profileImagePath })
    }),
  activate: userOnlyProcedure
    .input(
      z.object({
        userId: z.string(),
        password: z.string(),
        securityQNAs: z.array(
          z.object({
            questionKey: z.string(),
            answer: z.string()
          })
        )
      })
    )
    .mutation(async ({ input }) => {
      return activateUser(input)
    }),
  deactivateSuperUser: userAndSystemProcedure
    .use(
      allowedWithAnyOfScopes([
        'bypassratelimit',
        'user.create',
        'user.data-seeding',
        'integration.create'
      ])
    )
    .input(z.object({ username: z.string() }))
    .output(z.void())
    .mutation(async ({ input }) => {
      await deleteSuperUser(input.username)
    }),
  audit: auditRouter
})
