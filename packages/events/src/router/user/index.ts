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
/* eslint-disable max-lines */
import { TRPCError } from '@trpc/server'
import * as z from 'zod/v4'
import { decode } from 'jsonwebtoken'
import {
  AuditLogEntrySchema,
  UserAuditRecordInput,
  UUID
} from '@opencrvs/commons/events'
import {
  CreateUserInput,
  getAcceptedScopesFromToken,
  getScopeOptionValue,
  JurisdictionFilter,
  logger,
  TokenWithBearer,
  User,
  UserOrSystem,
  UserOrSystemSummary,
  UpdateUserInput,
  CreateUserInputInternal
} from '@opencrvs/commons'
import {
  allowedWithAnyOfScopes,
  canAccessUserWithScopes,
  canCreateUserWithScopes,
  canUpdateUserLocation,
  userCanReadOtherUser
} from '@events/router/middleware'
import {
  internalProcedure,
  router,
  userAndSystemProcedure,
  userOnlyProcedure
} from '@events/router/trpc'
import { getApplicationConfig, getRoles } from '@events/service/config/config'
import { generateHash } from '@events/service/auth/hash'
import {
  updatePasswordHash,
  updateUserById
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
  getUsersById,
  isUser,
  searchUsers,
  searchUsersAll,
  updateUser,
  sendUsernameReminder,
  sendResetPasswordInvite,
  resendInvite,
  verifyPasswordById
} from '@events/service/users/api'
import {
  checkVerificationCode,
  generateAndSendVerificationCode,
  generateNonce
} from '@events/service/verifyCode'
import { UserActionsQuery } from '@events/storage/postgres/events/actions'
import { userCanReadUserAudit } from '../middleware'

const UserSearch = z.object({
  username: z.string().optional(),
  mobile: z.string().optional(),
  email: z.string().optional(),
  status: z.string().optional(),
  primaryOfficeId: z.string().optional(),
  count: z.number().min(0),
  skip: z.number().min(0),
  sortBy: z
    .enum([
      'createdAt',
      'firstname',
      'surname',
      'username',
      'email',
      'status',
      'role'
    ])
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc'])
})

const AuditLogSubject = z.object({
  sub: z.string(),
  userType: z.enum(['system', 'user']).optional()
})

function getAuditLogIdentifiers(token: TokenWithBearer) {
  const withoutBearer = token.replace('Bearer ', '')
  const decoded = decode(withoutBearer)

  return AuditLogSubject.parse(decoded)
}

async function validateMobile(mobile: string) {
  const config = await getApplicationConfig()
  let pattern: RegExp
  try {
    pattern = new RegExp(config.PHONE_NUMBER_PATTERN)
  } catch {
    logger.error(
      `PHONE_NUMBER_PATTERN "${config.PHONE_NUMBER_PATTERN}" is not a valid regex — skipping mobile validation`
    )
    return
  }
  if (!pattern.test(mobile)) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: `INVALID_MOBILE: "${mobile}" does not match the configured pattern ${config.PHONE_NUMBER_PATTERN}`
    })
  }
}

export async function handleCreateUser(
  input: CreateUserInput | CreateUserInputInternal,
  ctx: { token: TokenWithBearer }
): Promise<User> {
  if (input.mobile) {
    await validateMobile(input.mobile)
    const existingWithMobile = await searchUsers({
      mobile: input.mobile,
      count: 1,
      skip: 0,
      sortOrder: 'asc',
      sortBy: 'createdAt'
    })
    if (existingWithMobile.length > 0) {
      logger.error(
        `Phone number ${input.mobile} is already in use by another user`
      )
      throw new TRPCError({ code: 'CONFLICT', message: 'DUPLICATE_MOBILE' })
    }
  }

  if (input.email) {
    const existingWithEmail = await searchUsers({
      email: input.email,
      count: 1,
      skip: 0,
      sortOrder: 'asc',
      sortBy: 'createdAt'
    })
    if (existingWithEmail.length > 0) {
      logger.error(`Email ${input.email} is already in use by another user`)
      throw new TRPCError({ code: 'CONFLICT', message: 'DUPLICATE_EMAIL' })
    }
  }

  const user = await createUser(input, ctx.token)

  const auditLogIdentifiers = getAuditLogIdentifiers(ctx.token)
  await writeAuditLog({
    ...input,
    clientId: auditLogIdentifiers.sub,
    clientType: auditLogIdentifiers.userType ?? 'system',
    operation: 'user.create_user',
    requestData: {
      subjectId: user.id,
      role: user.role,
      primaryOfficeId: user.primaryOfficeId
    }
  })

  return user
}

export function searchUsersRoute(
  procedure: typeof internalProcedure | typeof userAndSystemProcedure
) {
  return procedure
    .input(UserSearch)
    .output(z.array(UserOrSystem))
    .query(async ({ input, ctx }) => {
      const primaryOfficeId = input.primaryOfficeId
        ? UUID.parse(input.primaryOfficeId)
        : undefined

      // Internal procedures bypass scope check
      if (!('user' in ctx)) {
        return searchUsers({ ...input, primaryOfficeId })
      }

      const acceptedScopes = getAcceptedScopesFromToken(ctx.token, [
        'user.search'
      ])

      if (acceptedScopes.length === 0) {
        throw new TRPCError({ code: 'FORBIDDEN' })
      }

      const accessLevel = getScopeOptionValue(acceptedScopes[0], 'accessLevel')

      if (
        accessLevel === JurisdictionFilter.enum.administrativeArea &&
        ctx.user.administrativeAreaId
      ) {
        const allUsers = await searchUsersAll({
          ...input,
          primaryOfficeId: primaryOfficeId,
          administrativeAreaId: ctx.user.administrativeAreaId
        })
        return allUsers.slice(input.skip, input.skip + input.count)
      }

      if (accessLevel === JurisdictionFilter.enum.location) {
        return searchUsers({
          ...input,
          primaryOfficeId: ctx.user.primaryOfficeId
        })
      }

      return searchUsers({ ...input, primaryOfficeId })
    })
}

const UserAuditListQuery = z.object({
  userId: UUID,
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
    .use(userCanReadUserAudit)
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

export const userRouter = router({
  get: userOnlyProcedure
    .input(UUID)
    .use(userCanReadOtherUser)
    .output(UserOrSystem)
    .query(async ({ input }) => {
      const users = await getUsersById([input])
      if (users.length === 0) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }

      return users[0]
    }),
  create: userAndSystemProcedure
    .input(CreateUserInput)
    .use(canCreateUserWithScopes(['user.create']))
    .output(User)
    .mutation(async ({ input, ctx }) => handleCreateUser(input, ctx)),
  update: userAndSystemProcedure
    .input(UpdateUserInput)
    .use(canUpdateUserLocation)
    .use(canAccessUserWithScopes(['user.edit']))
    .output(User)
    .mutation(async ({ input, ctx }) => {
      if (input.mobile) {
        await validateMobile(input.mobile)
        const existingWithMobile = await searchUsers({
          mobile: input.mobile,
          count: 1,
          skip: 0,
          sortBy: 'createdAt',
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
          sortBy: 'createdAt',
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
    .output(z.array(UserOrSystemSummary))
    .query(async ({ input }) => getUsersById(input)),
  search: searchUsersRoute(userAndSystemProcedure),
  actions: userOnlyProcedure
    .input(UserActionsQuery)
    .use(userCanReadUserAudit)
    .query(async ({ input }) => {
      return getUserActions(input)
    }),
  roles: router({
    list: userOnlyProcedure.query(async () => getRoles())
  }),
  changePassword: userOnlyProcedure
    .input(
      z.object({
        existingPassword: z.string(),
        password: z.string()
      })
    )
    .mutation(async ({ input, ctx }) => {
      const userId = UUID.parse(ctx.user.id)
      const record = await getCredentials(userId)

      const existingHash = await generateHash(
        input.existingPassword,
        record.salt
      )
      if (existingHash !== record.passwordHash) {
        logger.error(`Password didn't match for given userid: ${ctx.user.id}`)
        // Don't return a 404 as this gives away that this user account exists
        throw new TRPCError({ code: 'UNAUTHORIZED' })
      }

      const newHash = await generateHash(input.password, record.salt)
      await updatePasswordHash(userId, newHash)
      void writeAuditLog({
        clientId: userId,
        clientType: 'user',
        operation: 'user.password_changed',
        requestData: { subjectId: userId }
      })
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
        recipientName: user.name,
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
        userId: UUID,
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

      const [user] = await getUsersById([input.userId])

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
        sortBy: 'createdAt',
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
        sortBy: 'createdAt',
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
        avatar: z.string()
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
      await updateUserById(UUID.parse(ctx.user.id), {
        profileImagePath: input.avatar
      })
    }),
  resendInvite: userAndSystemProcedure
    .input(UUID)
    .use(canAccessUserWithScopes(['user.edit']))
    .mutation(async ({ input, ctx }) => {
      const userId = UUID.parse(input)

      await resendInvite(userId, ctx.token)
      const auditLogIdentifiers = getAuditLogIdentifiers(ctx.token)
      await writeAuditLog({
        operation: 'user.resend_invite',
        requestData: { subjectId: userId },
        clientId: auditLogIdentifiers.sub,
        clientType: auditLogIdentifiers.userType ?? 'system'
      })
    }),
  activate: userOnlyProcedure
    .input(
      z.object({
        userId: UUID,
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
  sendUsernameReminder: userAndSystemProcedure
    .input(UUID)
    .use(canAccessUserWithScopes(['user.edit']))
    .mutation(async ({ input, ctx }) => {
      const userId = UUID.parse(input)
      await sendUsernameReminder(userId, ctx.token)
      const auditLogIdentifiers = getAuditLogIdentifiers(ctx.token)
      await writeAuditLog({
        operation: 'user.username_reminder_by_admin',
        requestData: { subjectId: userId },
        clientId: auditLogIdentifiers.sub,
        clientType: auditLogIdentifiers.userType ?? 'system'
      })
    }),
  sendResetPasswordInvite: userAndSystemProcedure
    .use(allowedWithAnyOfScopes(['user.edit']))
    .input(UUID)
    .mutation(async ({ input, ctx }) => {
      const userId = UUID.parse(input)
      const auditLogIdentifiers = getAuditLogIdentifiers(ctx.token)
      const adminUser = await getUser(auditLogIdentifiers.sub)
      await sendResetPasswordInvite(
        userId,
        {
          id: adminUser.id,
          name: adminUser.name,
          role: adminUser.role
        },
        ctx.token
      )
      await writeAuditLog({
        operation: 'user.password_reset_by_admin',
        requestData: { subjectId: userId },
        clientId: auditLogIdentifiers.sub,
        clientType: auditLogIdentifiers.userType ?? 'system'
      })
    }),
  verifyLoggedInUserPassword: userOnlyProcedure
    .input(z.object({ password: z.string() }))
    .output(
      z.object({
        mobile: z.string().optional(),
        status: z.string(),
        username: z.string(),
        id: z.string()
      })
    )
    .mutation(async ({ input, ctx }) => {
      return verifyPasswordById(ctx.user.id, input.password)
    }),
  audit: auditRouter
})
