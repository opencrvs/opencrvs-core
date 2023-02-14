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
import { readFileSync } from 'fs'
import { CERT_PRIVATE_KEY_PATH } from '@opencrvs/auth/src/constants'
import {
  CONFIG_SYSTEM_TOKEN_EXPIRY_SECONDS,
  CONFIG_TOKEN_EXPIRY_SECONDS
} from '@gateway/constants'
import { sign } from 'jsonwebtoken'

const cert = readFileSync(CERT_PRIVATE_KEY_PATH)
export function createToken(
  userId: string,
  scope: string[],
  audience: string[],
  issuer: string,
  temporary?: boolean
): string {
  if (typeof userId === undefined) {
    throw new Error('Invalid userId found for token creation')
  }
  return sign({ scope }, cert, {
    subject: userId,
    algorithm: 'RS256',
    expiresIn: temporary
      ? CONFIG_SYSTEM_TOKEN_EXPIRY_SECONDS
      : CONFIG_TOKEN_EXPIRY_SECONDS,
    audience,
    issuer
  })
}

export const generateToken = () =>
  createToken(
    '63a02c66e6d4bd1155b615d2',
    ['register', 'performance', 'certify', 'demo'],
    [
      'opencrvs:auth-user',
      'opencrvs:user-mgnt-user',
      'opencrvs:hearth-user',
      'opencrvs:gateway-user',
      'opencrvs:notification-user',
      'opencrvs:workflow-user',
      'opencrvs:search-user',
      'opencrvs:metrics-user',
      'opencrvs:countryconfig-user',
      'opencrvs:webhooks-user',
      'opencrvs:config-user',
      'opencrvs:documents-user'
    ],
    'opencrvs:auth-service',
    true
  )
