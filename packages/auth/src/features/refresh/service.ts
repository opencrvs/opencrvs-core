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
import {
  createToken,
  getUserRoleScopeMapping,
  internalClient,
  signRefreshToken
} from '@auth/features/authenticate/service'
import { consume, revokeFamily } from '@auth/features/refresh/family'
import { WEB_USER_JWT_AUDIENCES, JWT_ISSUER } from '@auth/constants'
import { TokenUserType, logger } from '@opencrvs/commons'

export class RefreshTokenError extends Error {}

export async function refreshToken(
  userId: string,
  userType: TokenUserType,
  familyId: string,
  jti: string
): Promise<{ token: string; refreshToken: string }> {
  const consumed = await consume(familyId, jti)

  if (consumed.status === 'missing') {
    throw new RefreshTokenError('refresh family not found')
  }

  if (consumed.status === 'reuse') {
    logger.error(
      `Refresh token reuse detected: familyId=${familyId} sub=${userId}. Family revoked.`
    )
    throw new RefreshTokenError('refresh token reuse detected')
  }
  // consumed.status is 'rotate' or 'grace' here (missing/reuse already threw)

  const { role, status } = await internalClient.user.getById.query(userId)
  if (status !== 'active') {
    await revokeFamily(familyId)
    throw new RefreshTokenError('user not active')
  }

  const roleScopeMappings = await getUserRoleScopeMapping()
  const scopes = roleScopeMappings[role]

  const token = await createToken(
    userId,
    scopes,
    WEB_USER_JWT_AUDIENCES,
    JWT_ISSUER,
    role,
    TokenUserType.enum.user
  )
  const refreshToken = await signRefreshToken(
    userId,
    userType,
    familyId,
    consumed.newJti
  )

  return { token, refreshToken }
}
