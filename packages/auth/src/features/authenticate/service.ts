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
import fetch from 'node-fetch'
import {
  USER_MANAGEMENT_URL,
  CERT_PRIVATE_KEY_PATH,
  CERT_PUBLIC_KEY_PATH,
  CONFIG_TOKEN_EXPIRY_SECONDS,
  CONFIG_SYSTEM_TOKEN_EXPIRY_SECONDS,
  PRODUCTION,
  QA_ENV,
  METRICS_URL
} from '@auth/constants'
import { resolve } from 'url'
import { readFileSync } from 'fs'
import { promisify } from 'util'
import * as jwt from 'jsonwebtoken'
import { get, set } from '@auth/database'
import * as t from 'io-ts'
import {
  NotificationEvent,
  generateVerificationCode,
  sendVerificationCode,
  storeVerificationCode
} from '@auth/features/verifyCode/service'
import { logger } from '@auth/logger'
import { unauthorized } from '@hapi/boom'
import { chainW, tryCatch } from 'fp-ts/Either'
import { pipe } from 'fp-ts/function'

const cert = readFileSync(CERT_PRIVATE_KEY_PATH)
const publicCert = readFileSync(CERT_PUBLIC_KEY_PATH)

const sign = promisify(jwt.sign) as (
  payload: string | Buffer | Record<string, unknown>,
  secretOrPrivateKey: jwt.Secret,
  options?: jwt.SignOptions
) => Promise<string>
export interface IUserName {
  use: string
  family: string
  given: string[]
}
export interface IAuthentication {
  name: IUserName[]
  mobile?: string
  userId: string
  status: string
  scope: string[]
  email?: string
}

export interface ISystemAuthentication {
  systemId: string
  status: string
  scope: string[]
}

export class UserInfoNotFoundError extends Error {}

export function isUserInfoNotFoundError(err: Error) {
  return err instanceof UserInfoNotFoundError
}

export async function authenticate(
  username: string,
  password: string
): Promise<IAuthentication> {
  const url = resolve(USER_MANAGEMENT_URL, '/verifyPassword')

  const res = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({ username, password }),
    headers: { 'Content-Type': 'application/json' }
  })

  if (res.status !== 200) {
    throw Error(res.statusText)
  }
  const body = await res.json()
  return {
    name: body.name,
    userId: body.id,
    scope: body.scope,
    status: body.status,
    mobile: body.mobile,
    email: body.email
  }
}

export async function authenticateSystem(
  client_id: string,
  client_secret: string
): Promise<ISystemAuthentication> {
  const url = resolve(USER_MANAGEMENT_URL, '/verifySystem')

  const res = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({ client_id, client_secret }),
    headers: { 'Content-Type': 'application/json' }
  })

  if (res.status !== 200) {
    throw Error(res.statusText)
  }

  const body = await res.json()
  return {
    systemId: body.id,
    scope: body.scope,
    status: body.status
  }
}

export async function createToken(
  userId: string,
  scope: string[],
  audience: string[],
  issuer: string,
  temporary?: boolean
): Promise<string> {
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

export async function storeUserInformation(
  nonce: string,
  userFullName: IUserName[],
  userId: string,
  scope: string[],
  mobile?: string,
  email?: string
) {
  return set(
    `user_information_${nonce}`,
    JSON.stringify({ userId, scope, userFullName, mobile, email })
  )
}

export async function getStoredUserInformation(nonce: string) {
  const record = await get(`user_information_${nonce}`)
  if (record === null) {
    throw new UserInfoNotFoundError('user not found')
  }
  const parsedUserData = JSON.parse(record)
  return parsedUserData
}

export async function generateAndSendVerificationCode(
  nonce: string,
  scope: string[],
  notificationEvent: NotificationEvent,
  userFullName: IUserName[],
  mobile?: string,
  email?: string
) {
  const isDemoUser = scope.indexOf('demo') > -1
  logger.info(
    `isDemoUser,
      ${JSON.stringify({
        isDemoUser: isDemoUser
      })}`
  )
  let verificationCode
  if (isDemoUser) {
    verificationCode = '000000'
    await storeVerificationCode(nonce, verificationCode)
  } else {
    verificationCode = await generateVerificationCode(nonce)
  }
  if (!PRODUCTION || QA_ENV) {
    logger.info(
      `Sending a verification to,
          ${JSON.stringify({
            mobile: mobile,
            email: email,
            verificationCode
          })}`
    )
  } else {
    if (isDemoUser) {
      throw unauthorized()
    } else {
      await sendVerificationCode(
        verificationCode,
        notificationEvent,
        userFullName,
        mobile,
        email
      )
    }
  }
}

const tokenPayload = t.type({
  sub: t.string,
  scope: t.array(t.string),
  iat: t.number,
  exp: t.number,
  aud: t.array(t.string)
})

export type ITokenPayload = t.TypeOf<typeof tokenPayload>

function safeVerifyJwt(token: string) {
  return tryCatch(
    () =>
      jwt.verify(token, publicCert, {
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:auth-user'
      }),
    (e) => (e instanceof Error ? e : new Error('Unkown error'))
  )
}

export function verifyToken(token: string) {
  return pipe(token, safeVerifyJwt, chainW(tokenPayload.decode))
}

export function getPublicKey() {
  return publicCert
}

export async function postUserActionToMetrics(
  action: string,
  token: string,
  remoteAddress: string,
  userAgent: string,
  practitionerId?: string
) {
  const url = resolve(METRICS_URL, '/audit/events')
  const body = { action: action, practitionerId }
  const authentication = 'Bearer ' + token

  await fetch(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
      Authorization: authentication,
      'x-real-ip': remoteAddress,
      'x-real-user-agent': userAgent
    }
  })
}
