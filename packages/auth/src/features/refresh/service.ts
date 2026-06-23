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
  internalClient
} from '@auth/features/authenticate/service'
import { WEB_USER_JWT_AUDIENCES, JWT_ISSUER } from '@auth/constants'
import { TokenUserType } from '@opencrvs/commons'

export class UserNotActiveError extends Error {}

export async function refreshToken(userId: string) {
  const { role, status } = await internalClient.user.getById.query(userId)

  if (status !== 'active') {
    throw new UserNotActiveError()
  }

  const roleScopeMappings = await getUserRoleScopeMapping()
  const scopes = roleScopeMappings[role]

  return createToken(
    userId,
    scopes,
    WEB_USER_JWT_AUDIENCES,
    JWT_ISSUER,
    role,
    TokenUserType.enum.user
  )
}
