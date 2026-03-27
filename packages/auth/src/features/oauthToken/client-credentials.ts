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

import * as Hapi from '@hapi/hapi'
import {
  authenticateSystem,
  createToken
} from '@auth/features/authenticate/service'
import { WEB_USER_JWT_AUDIENCES, JWT_ISSUER } from '@auth/constants'
import * as oauthResponse from './responses'
import { TokenUserType } from '@opencrvs/commons/authentication'
import { getParam } from './utils'

export async function clientCredentialsHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const clientId = getParam(request, 'client_id')
  const clientSecret = getParam(request, 'client_secret')

  if (!clientId || !clientSecret) {
    return oauthResponse.invalidRequest(h)
  }

  let result
  try {
    result = await authenticateSystem(clientId, clientSecret)
  } catch (err) {
    return oauthResponse.invalidClient(h)
  }

  if (result.status !== 'active') {
    return oauthResponse.invalidClient(h)
  }

  /**
   * Intermediary step to convert any legacy scopes to the new format.
   * For example, 'record.create' becomes 'type=record.create' to align with the new scope format.
   *
   * Since mongo is in the middle of deprecation, we won't write new migrations to update existing scopes in the database, but instead convert them on the fly here.
   */
  const v2Scopes = result.scope.map((s) => {
    // Intentionally verbose for clarity.
    if (s === 'record.notify') {
      return 'type=record.notify'
    }

    if (s === 'record.search') {
      return 'type=record.search'
    }

    if (s === 'record.read') {
      return 'type=record.read'
    }

    if (s === 'record.create') {
      return 'type=record.create'
    }

    return s
  })

  const token = await createToken(
    result.systemId,
    v2Scopes,
    WEB_USER_JWT_AUDIENCES,
    JWT_ISSUER,
    undefined,
    TokenUserType.enum.system
  )
  return oauthResponse.success(h, token)
}
