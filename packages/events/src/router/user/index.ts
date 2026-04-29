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
  hasScope,
  isBase64FileString,
  JurisdictionFilter,
  logger,
  personNameFromV1ToV2,
  TokenUserType,
  TokenWithBearer,
  User,
  UserOrSystem,
  UpdateUserInput,
  CreateUserInputInternal
} from '@opencrvs/commons'
import {
  allowedWithAnyOfScopes,
  canUpdateUserLocation
} from '@events/router/middleware'
import {
  internalProcedure,
  router,
  userAndSystemProcedure,
  userOnlyProcedure
} from '@events/router/trpc'
import { getRoles } from '@events/service/config/config'
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
  updateUser,
  sendUsernameReminder,
  sendResetPasswordInvite,
  resendInvite
} from '@events/service/users/api'
import { uploadBase64File } from '@events/service/files'
import {
  checkVerificationCode,
  generateAndSendVerificationCode,
  generateNonce
} from '@events/service/verifyCode'
import { UserActionsQuery } from '@events/storage/postgres/events/actions'
import { isLocationUnderAdministrativeArea } from '@events/storage/postgres/administrative-hierarchy/locations'
import { userCanReadOtherUser } from '../middleware'

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

export async function handleCreateUser(
  input: CreateUserInput | CreateUserInputInternal,
  ctx: { token: TokenWithBearer }
): Promise<User> {
  if (input.mobile) {
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
      const isInternalCall = !('user' in ctx)

      if (!isInternalCall) {
        const { user, token } = ctx as typeof ctx & {
          user: NonNullable<(typeof ctx & { user?: unknown })['user']>
        }

        const readScopes = getAcceptedScopesFromToken(token, ['user.read'])

        if (readScopes.length === 0) {
          throw new TRPCError({ code: 'NOT_FOUND' })
        }

        const accessLevels = readScopes.map((s) =>
          getScopeOptionValue(s, 'accessLevel')
        )

        if (!accessLevels.includes(JurisdictionFilter.enum.all)) {
          if (accessLevels.includes(JurisdictionFilter.enum.location)) {
            const officeId = input.primaryOfficeId
              ? UUID.parse(input.primaryOfficeId)
              : (user.primaryOfficeId ?? undefined)
            return searchUsers({
              ...input,
              primaryOfficeId: officeId
            })
          }

          if (
            accessLevels.includes(JurisdictionFilter.enum.administrativeArea)
          ) {
            return searchUsers({
              ...input,
              primaryOfficeId: input.primaryOfficeId
                ? UUID.parse(input.primaryOfficeId)
                : undefined,
              administrativeAreaId: user.administrativeAreaId ?? undefined
            })
          }
        }
      }

      return searchUsers({
        ...input,
        primaryOfficeId: input.primaryOfficeId
          ? UUID.parse(input.primaryOfficeId)
          : undefined
      })
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

export const userRouter = router({
  get: userOnlyProcedure
    .input(UUID)
    .output(UserOrSystem)
    .query(async ({ input, ctx }) => {
      if (!hasScope(ctx.token, 'user.read')) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }

      const users = await getUsersById([input])
      if (users.length === 0) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }

      const target = users[0]

      if (target.type === TokenUserType.enum.system) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }

      const readScopes = getAcceptedScopesFromToken(ctx.token, ['user.read'])
      const accessLevels = readScopes.map((s) =>
        getScopeOptionValue(s, 'accessLevel')
      )

      if (accessLevels.includes(JurisdictionFilter.enum.all)) {
        return target
      }

      const hasLocationAccess =
        accessLevels.includes(JurisdictionFilter.enum.location) ||
        accessLevels.includes(JurisdictionFilter.enum.administrativeArea)

      if (
        hasLocationAccess &&
        ctx.user.primaryOfficeId === target.primaryOfficeId
      ) {
        return target
      }

      const isUnderJurisdiction = ctx.user.administrativeAreaId
        ? await isLocationUnderAdministrativeArea({
            administrativeAreaId: ctx.user.administrativeAreaId,
            locationId: target.primaryOfficeId
          })
        : true

      if (
        accessLevels.includes(JurisdictionFilter.enum.administrativeArea) &&
        isUnderJurisdiction
      ) {
        return target
      }

      throw new TRPCError({ code: 'NOT_FOUND' })
    }),
  create: userAndSystemProcedure
    .use(allowedWithAnyOfScopes(['user.create']))
    .input(CreateUserInput)
    .output(User)
    .mutation(async ({ input, ctx }) => handleCreateUser(input, ctx)),
  update: userAndSystemProcedure
    .use(allowedWithAnyOfScopes(['user.edit']))
    .input(UpdateUserInput.and(z.object({ id: UUID })))
    .use(canUpdateUserLocation)
    .output(User)
    .mutation(async ({ input, ctx }) => {
      if (input.mobile) {
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
    .output(z.array(UserOrSystem))
    .query(async ({ input, ctx }) => {
      const readScopes = getAcceptedScopesFromToken(ctx.token, ['user.read'])

      if (readScopes.length === 0) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }

      const results = await getUsersById(input)

      const accessLevels = readScopes.map((s) =>
        getScopeOptionValue(s, 'accessLevel')
      )

      if (accessLevels.includes(JurisdictionFilter.enum.all)) {
        return results
      }

      const filtered = await Promise.all(
        results.map(async (u) => {
          if (u.type === TokenUserType.enum.system) {
            return u
          }

          if (
            accessLevels.includes(JurisdictionFilter.enum.location) ||
            accessLevels.includes(JurisdictionFilter.enum.administrativeArea)
          ) {
            if (ctx.user.primaryOfficeId === u.primaryOfficeId) {
              return u
            }
          }

          if (
            accessLevels.includes(JurisdictionFilter.enum.administrativeArea)
          ) {
            const isUnder = ctx.user.administrativeAreaId
              ? await isLocationUnderAdministrativeArea({
                  administrativeAreaId: ctx.user.administrativeAreaId,
                  locationId: u.primaryOfficeId
                })
              : true
            if (isUnder) {
              return u
            }
          }

          return null
        })
      )

      return filtered.filter((u): u is UserOrSystem => u !== null)
    }),
  search: searchUsersRoute(userAndSystemProcedure),
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
  resendInvite: userAndSystemProcedure
    .use(allowedWithAnyOfScopes(['user.edit']))
    .input(UUID)
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
    .use(allowedWithAnyOfScopes(['user.edit']))
    .input(UUID)
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
  audit: auditRouter
})
