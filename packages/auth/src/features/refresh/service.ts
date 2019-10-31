/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import { createToken, ITokenPayload } from '@auth/features/authenticate/service'
import { WEB_USER_JWT_AUDIENCES, JWT_ISSUER } from '@auth/constants'

export async function refreshToken(payload: ITokenPayload): Promise<string> {
  return createToken(
    payload.sub,
    payload.scope,
    WEB_USER_JWT_AUDIENCES,
    JWT_ISSUER
  )
}
