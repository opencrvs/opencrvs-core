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
import { FastifyReply, FastifyRequest } from 'fastify'
import {
  OIDPQuerySchema,
  OIDPUserInfoSchema,
  fetchToken,
  fetchUserInfo
} from '../esignet-api'
import { z } from 'zod'

export type OIDPUserInfoRequest = FastifyRequest<{
  Body: z.infer<typeof OIDPUserInfoSchema>
  Querystring: z.infer<typeof OIDPQuerySchema>
}>

export const OIDPUserInfoHandler = async (
  request: OIDPUserInfoRequest,
  _reply: FastifyReply
) => {
  const { clientId, redirectUri } = request.body
  const code = request.query.code

  request.log.info({
    event: 'esignet.userinfo.request.received',
    clientId,
    redirectUri: redirectUri.split('?')[0],
    hasCode: Boolean(code)
  })

  const tokenResponse = await fetchToken({
    code,
    clientId,
    redirectUri,
    logger: request.log
  })

  if (!tokenResponse.access_token) {
    request.log.warn(
      {
        event: 'esignet.token.request.missing-access-token'
      },
      'E-Signet token response did not include access token'
    )

    throw new Error(
      'Something went wrong with the OIDP token request. No access token was returned.'
    )
  }

  const userInfo = await fetchUserInfo(tokenResponse.access_token, request.log)

  request.log.info(
    {
      event: 'esignet.userinfo.request.succeeded'
    },
    'Successfully fetched OIDP user info'
  )

  return userInfo
}
