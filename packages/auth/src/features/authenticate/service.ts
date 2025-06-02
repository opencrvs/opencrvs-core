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
import { JWT_ISSUER } from '@auth/constants'
import { resolve } from 'url'
import { readFileSync } from 'fs'
import { promisify } from 'util'
import * as jwt from 'jsonwebtoken'
import { redis } from '@auth/database'
import * as t from 'io-ts'
import {
  NotificationEvent,
  generateVerificationCode,
  sendVerificationCode,
  storeVerificationCode
} from '@auth/features/verifyCode/service'
import { logger, UUID } from '@opencrvs/commons'
import { unauthorized } from '@hapi/boom'
import * as F from 'fp-ts'
import { Scope, TokenUserType } from '@opencrvs/commons/authentication'
const { chainW, tryCatch } = F.either
const { pipe } = F.function
import { env } from '@auth/environment'

const cert = readFileSync(env.CERT_PRIVATE_KEY_PATH)
const publicCert = readFileSync(env.CERT_PUBLIC_KEY_PATH)

const sign = promisify<
  Record<string, unknown>,
  jwt.Secret,
  jwt.SignOptions,
  string
>(jwt.sign)

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
  email?: string
  role: string
}

export interface ISystemAuthentication {
  systemId: string
  status: string
  scope: Scope[]
}

export class UserInfoNotFoundError extends Error {}

export function isUserInfoNotFoundError(err: Error) {
  return err instanceof UserInfoNotFoundError
}

export async function authenticate(
  username: string,
  password: string
): Promise<IAuthentication> {
  const url = resolve(env.USER_MANAGEMENT_URL, '/verifyPassword')

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
    role: body.role,
    status: body.status,
    mobile: body.mobile,
    email: body.email
  }
}

export async function authenticateSystem(
  client_id: string,
  client_secret: string
): Promise<ISystemAuthentication> {
  const url = resolve(env.USER_MANAGEMENT_URL, '/verifySystem')

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
  temporary?: boolean,
  userType: TokenUserType = TokenUserType.USER
): Promise<string> {
  return sign({ scope, userType }, cert, {
    subject: userId,
    algorithm: 'RS256',
    expiresIn: temporary
      ? env.CONFIG_SYSTEM_TOKEN_EXPIRY_SECONDS
      : env.CONFIG_TOKEN_EXPIRY_SECONDS,
    audience,
    issuer
  })
}

export async function createTokenForRecordValidation(
  userId: UUID,
  recordId: UUID
) {
  return sign(
    {
      scope: ['record.confirm-registration', 'record.reject-registration'],
      recordId
    },
    cert,
    {
      subject: userId,
      algorithm: 'RS256',
      expiresIn: '7 days',
      audience: [
        'opencrvs:gateway-user', // to get to the gateway
        'opencrvs:user-mgnt-user', // to allow the gateway to connect the 'sub' to an actual user
        'opencrvs:auth-user',
        'opencrvs:hearth-user',
        'opencrvs:notification-user',
        'opencrvs:workflow-user',
        'opencrvs:search-user',
        'opencrvs:metrics-user',
        'opencrvs:countryconfig-user',
        'opencrvs:webhooks-user',
        'opencrvs:config-user',
        'opencrvs:documents-user',
        'opencrvs:notification-api-user'
      ],
      issuer: JWT_ISSUER
    }
  )
}

export async function storeUserInformation(
  nonce: string,
  userFullName: IUserName[],
  userId: string,
  scope: string[],
  mobile?: string,
  email?: string
) {
  return redis.set(
    `user_information_${nonce}`,
    JSON.stringify({ userId, scope, userFullName, mobile, email })
  )
}

export async function getStoredUserInformation(nonce: string) {
  const record = await redis.get(`user_information_${nonce}`)
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
  const isDemoUser = scope.indexOf('demo') > -1 || env.QA_ENV
  logger.info(`Is demo user: ${isDemoUser}. Scopes: ${scope.join(', ')}`)
  let verificationCode
  if (isDemoUser) {
    verificationCode = '000000'
    await storeVerificationCode(nonce, verificationCode)
  } else {
    verificationCode = await generateVerificationCode(nonce)
  }

  if (!env.isProd || env.QA_ENV) {
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
