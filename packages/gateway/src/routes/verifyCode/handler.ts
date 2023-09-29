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
import * as Joi from 'joi'
import {
  CERT_PUBLIC_KEY_PATH,
  CONFIG_SMS_CODE_EXPIRY_SECONDS,
  NOTIFICATION_URL,
  PRODUCTION,
  QA_ENV
} from '@gateway/constants'
import { del, get, set } from '@gateway/features/user/database'
import * as crypto from 'crypto'
import { resolve } from 'url'
import { readFileSync } from 'fs'
import * as jwt from 'jsonwebtoken'
import fetch from '@gateway/fetch'
import { unauthorized } from '@hapi/boom'
import { logger } from '@gateway/logger'
import * as t from 'io-ts'
import * as F from 'fp-ts'

const pipe = F.function.pipe
const { chainW, tryCatch } = F.either

const publicCert = readFileSync(CERT_PUBLIC_KEY_PATH)

interface ICodeDetails {
  code: string
  createdAt: number
}

type SixDigitVerificationCode = string

interface ISendVerifyCodeResponse {
  userId: string
  nonce: string
  status: string
  mobile?: string
  email?: string
}

interface IUserName {
  use: string
  family: string
  given: string[]
}

interface ISendVerifyCodePayload {
  userFullName: IUserName[]
  notificationEvent: string
  phoneNumber?: string
  email?: string
}

export async function storeVerificationCode(nonce: string, code: string) {
  const codeDetails = {
    code,
    createdAt: Date.now()
  }
  await set(`verification_${nonce}`, JSON.stringify(codeDetails))
}

export async function generateAndStoreVerificationCode(
  nonce: string
): Promise<SixDigitVerificationCode> {
  const code = crypto.randomInt(100000, 999999).toString()
  await storeVerificationCode(nonce, code)
  return code
}

export async function checkVerificationCode(
  nonce: string,
  code: string
): Promise<void> {
  const codeDetails: ICodeDetails = await getVerificationCodeDetails(nonce)

  if (!codeDetails) {
    throw new Error('sms code not found')
  }

  const codeExpired =
    (Date.now() - codeDetails.createdAt) / 1000 >=
    CONFIG_SMS_CODE_EXPIRY_SECONDS

  if (code !== codeDetails.code) {
    throw new Error('sms code invalid')
  }

  if (codeExpired) {
    throw new Error('sms code expired')
  }
}

export async function getVerificationCodeDetails(
  nonce: string
): Promise<ICodeDetails> {
  const codeDetails = await get(`verification_${nonce}`)
  return JSON.parse(codeDetails) as ICodeDetails
}

export async function deleteUsedVerificationCode(
  nonce: string
): Promise<boolean> {
  const count = await del(`verification_${nonce}`)
  return Boolean(count)
}

export function generateNonce() {
  return crypto.randomBytes(16).toString('base64').toString()
}

export async function sendVerificationCode(
  verificationCode: string,
  token: string,
  notificationEvent: string,
  userFullName: IUserName[],
  mobile?: string,
  email?: string
): Promise<void> {
  const params = {
    msisdn: mobile,
    email,
    code: verificationCode,
    notificationEvent,
    userFullName
  }

  await fetch(resolve(NOTIFICATION_URL, 'authenticationCode'), {
    method: 'POST',
    body: JSON.stringify(params),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  })

  return undefined
}

export async function generateAndSendVerificationCode(
  nonce: string,
  scope: string[],
  token: string,
  notificationEvent: string,
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
    verificationCode = await generateAndStoreVerificationCode(nonce)
  }
  if (!PRODUCTION || QA_ENV) {
    logger.info(
      `Sending a verification to ,
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
        token,
        notificationEvent,
        userFullName,
        mobile,
        email
      )
    }
  }
}

export default async function sendVerifyCodeHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const payload = request.payload as ISendVerifyCodePayload
  const { userFullName, phoneNumber, notificationEvent, email } = payload
  const token = request.headers.authorization.replace('Bearer ', '') as string
  const decodedOrError = verifyToken(token)
  if (decodedOrError._tag === 'Left') {
    return unauthorized()
  }
  const decoded = decodedOrError.right
  const { sub: userId, scope } = decoded
  const nonce = generateNonce()
  const response: ISendVerifyCodeResponse = {
    userId,
    nonce,
    status: 'Success',
    mobile: phoneNumber,
    email
  }
  await generateAndSendVerificationCode(
    nonce,
    scope,
    token,
    notificationEvent,
    userFullName,
    phoneNumber,
    email
  )
  return h.response(response).code(201)
}

export const requestSchema = Joi.object({
  userFullName: Joi.array().items(
    Joi.object({
      given: Joi.array().items(Joi.string()).required(),
      use: Joi.string().required(),
      family: Joi.string().required()
    }).unknown(true)
  ),
  notificationEvent: Joi.string(),
  phoneNumber: Joi.string(),
  email: Joi.string()
})

export const responseSchema = Joi.object({
  userId: Joi.string(),
  nonce: Joi.string(),
  status: Joi.string(),
  mobile: Joi.string(),
  email: Joi.string()
})

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
        audience: 'opencrvs:gateway-user'
      }),
    (e) => (e instanceof Error ? e : new Error('Unkown error'))
  )
}

export function verifyToken(token: string) {
  return pipe(token, safeVerifyJwt, chainW(tokenPayload.decode))
}
