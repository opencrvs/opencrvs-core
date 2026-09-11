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
import { createToken } from '@auth/features/authenticate/service'
import { WEB_USER_JWT_AUDIENCES } from '@auth/constants'
import { SERVICE_USER_ID, TokenUserType } from '@opencrvs/commons'

interface IAuthResponse {
  token: string
}

export default async function serviceTokenHandler(
  _request: Hapi.Request,
  _h: Hapi.ResponseToolkit
): Promise<IAuthResponse> {
  const token = await createToken(
    SERVICE_USER_ID,
    [],
    // Country config both validates this token itself (event-config load,
    // all-user broadcasts, telemetry) and relays it onward — e.g. when sending
    // informant notifications it calls back through the gateway to the events
    // service. It therefore needs the same audiences as a user token, otherwise
    // those relayed calls are rejected with a 401. It carries no scopes, so a
    // broad audience grants no authority; it only lets each service accept the
    // token for the scope-free operations country config performs.
    WEB_USER_JWT_AUDIENCES,
    'opencrvs:auth-service',
    undefined,
    TokenUserType.enum.system
  )
  return { token }
}
