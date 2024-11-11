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
import * as jwt from 'jsonwebtoken'
import * as t from 'io-ts'
import { function as f, either as e } from 'fp-ts'
import { publicCert } from '@config/server'

const tokenPayload = t.type({
  sub: t.string,
  scope: t.array(t.string),
  iat: t.number,
  exp: t.number,
  aud: t.array(t.string)
})

export type ITokenPayload = t.TypeOf<typeof tokenPayload>

function safeVerifyJwt(token: string) {
  return e.tryCatch(
    () =>
      jwt.verify(token, publicCert, {
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:config-user'
      }),
    (e) => (e instanceof Error ? e : new Error('Unkown error'))
  )
}

export function verifyToken(token: string) {
  return f.pipe(token, safeVerifyJwt, e.chainW(tokenPayload.decode))
}
